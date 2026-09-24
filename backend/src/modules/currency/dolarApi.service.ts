import prisma from "../../config/prisma";
import { DolarApiRate, CurrencyRatesSummary } from "./currency.types";

const DOLAR_API_BASE = "https://ve.dolarapi.com/v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos de caché en memoria

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

let cachedDolares: CacheEntry<DolarApiRate[]> | null = null;
let cachedEuros: CacheEntry<DolarApiRate[]> | null = null;

/**
 * Realiza una petición GET segura con timeout
 */
async function fetchWithTimeout(url: string, timeoutMs = 6000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "ERP-Repair-DolarApi/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`DolarAPI error (${url}): HTTP ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Obtiene todas las cotizaciones del Dólar en Venezuela (BCV Oficial y Paralelo)
 */
export async function getDolarRates(forceRefresh = false): Promise<DolarApiRate[]> {
  const now = Date.now();
  if (!forceRefresh && cachedDolares && now - cachedDolares.timestamp < CACHE_TTL_MS) {
    return cachedDolares.data;
  }

  try {
    const data: DolarApiRate[] = await fetchWithTimeout(`${DOLAR_API_BASE}/dolares`);
    cachedDolares = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error("[DolarAPI] Error obteniendo tasas del dólar:", error);
    if (cachedDolares) {
      return cachedDolares.data; // Retorna caché anterior si la red falla
    }
    throw error;
  }
}

/**
 * Obtiene las cotizaciones del Euro en Venezuela
 */
export async function getEuroRates(forceRefresh = false): Promise<DolarApiRate[]> {
  const now = Date.now();
  if (!forceRefresh && cachedEuros && now - cachedEuros.timestamp < CACHE_TTL_MS) {
    return cachedEuros.data;
  }

  try {
    const data: DolarApiRate[] = await fetchWithTimeout(`${DOLAR_API_BASE}/euros`);
    cachedEuros = { data, timestamp: now };
    return data;
  } catch (error) {
    console.error("[DolarAPI] Error obteniendo tasas del euro:", error);
    if (cachedEuros) {
      return cachedEuros.data;
    }
    return [];
  }
}

/**
 * Obtiene un resumen consolidado con Dólar Oficial (BCV), Paralelo y Euros
 */
export async function getRatesSummary(forceRefresh = false): Promise<CurrencyRatesSummary> {
  const [dolares, euros] = await Promise.all([
    getDolarRates(forceRefresh),
    getEuroRates(forceRefresh).catch(() => []),
  ]);

  const oficialUsd = dolares.find((r) => r.fuente === "oficial")?.promedio || 0;
  const paraleloUsd = dolares.find((r) => r.fuente === "paralelo")?.promedio || 0;
  const fechaUsd = dolares.find((r) => r.fuente === "oficial")?.fechaActualizacion || new Date().toISOString();

  const diferenciaPct = oficialUsd > 0
    ? Number((((paraleloUsd - oficialUsd) / oficialUsd) * 100).toFixed(2))
    : 0;

  const oficialEur = euros.find((r) => r.fuente === "oficial")?.promedio || 0;
  const paraleloEur = euros.find((r) => r.fuente === "paralelo")?.promedio || 0;
  const fechaEur = euros.find((r) => r.fuente === "oficial")?.fechaActualizacion || new Date().toISOString();

  return {
    usd: {
      oficial: oficialUsd,
      paralelo: paraleloUsd,
      diferenciaPct,
      fechaActualizacion: fechaUsd,
    },
    eur: {
      oficial: oficialEur,
      paralelo: paraleloEur,
      fechaActualizacion: fechaEur,
    },
    cached: !forceRefresh && !!cachedDolares && Date.now() - cachedDolares.timestamp < CACHE_TTL_MS,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Sincroniza la tasa oficial del BCV en la base de datos (tabla Moneda -> VES)
 */
export async function syncBcvRateToDatabase(): Promise<{
  moneda: any;
  tasaAnterior: number;
  tasaNueva: number;
}> {
  const summary = await getRatesSummary(true);
  const tasaBcv = summary.usd.oficial;

  if (!tasaBcv || tasaBcv <= 0) {
    throw new Error("No se pudo obtener una tasa oficial BCV válida de DolarAPI");
  }

  // Buscar o crear la moneda VES
  const monedaExistente = await prisma.moneda.findUnique({
    where: { codigo: "VES" },
  });

  const tasaAnterior = monedaExistente?.tasa_cambio ?? 0;

  const monedaActualizada = await prisma.moneda.upsert({
    where: { codigo: "VES" },
    update: {
      tasa_cambio: tasaBcv,
      nombre: "Bolívar Digital (BCV)",
    },
    create: {
      codigo: "VES",
      nombre: "Bolívar Digital (BCV)",
      tasa_cambio: tasaBcv,
    },
  });

  console.log(
    `[DolarAPI] ✅ Tasa VES actualizada en DB: ${tasaAnterior} -> ${tasaBcv} Bs/USD`
  );

  return {
    moneda: monedaActualizada,
    tasaAnterior,
    tasaNueva: tasaBcv,
  };
}
