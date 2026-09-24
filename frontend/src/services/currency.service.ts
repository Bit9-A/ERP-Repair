import { api } from "../lib/api";
import type { ApiResponse } from "../types";

export interface CurrencyRatesSummary {
  usd: {
    oficial: number;     // Tasa oficial BCV
    paralelo: number;    // Tasa mercado paralelo
    diferenciaPct: number;
    fechaActualizacion: string;
  };
  eur?: {
    oficial: number;
    paralelo: number;
    fechaActualizacion: string;
  };
  cached: boolean;
  timestamp: string;
}

export interface MonedaDb {
  id: string;
  codigo: string;
  nombre: string | null;
  tasa_cambio: number;
  updatedAt: string;
}

/**
 * Obtiene el resumen de tasas de cambio (BCV, Paralelo, Euro)
 */
export async function getCurrencyRates(refresh = false): Promise<CurrencyRatesSummary> {
  const { data } = await api.get<ApiResponse<CurrencyRatesSummary>>(
    `/currency/rates${refresh ? "?refresh=true" : ""}`
  );
  return data.data;
}

/**
 * Obtiene únicamente la tasa oficial del BCV
 */
export async function getBcvRate(): Promise<{ tasa: number; fuente: string; fechaActualizacion: string }> {
  const { data } = await api.get<ApiResponse<{ tasa: number; fuente: string; fechaActualizacion: string }>>(
    "/currency/bcv"
  );
  return data.data;
}

/**
 * Obtiene la tasa del dólar paralelo
 */
export async function getParaleloRate(): Promise<{ tasa: number; fuente: string; diferenciaPct: number; fechaActualizacion: string }> {
  const { data } = await api.get<ApiResponse<{ tasa: number; fuente: string; diferenciaPct: number; fechaActualizacion: string }>>(
    "/currency/paralelo"
  );
  return data.data;
}

/**
 * Sincroniza la tasa actual del BCV en la base de datos para la moneda VES
 */
export async function syncBcvToDb(): Promise<{ moneda: MonedaDb; tasaAnterior: number; tasaNueva: number }> {
  const { data } = await api.post<ApiResponse<{ moneda: MonedaDb; tasaAnterior: number; tasaNueva: number }>>(
    "/currency/sync-bcv"
  );
  return data.data;
}

/**
 * Obtiene las monedas configuradas en la base de datos
 */
export async function getDbCurrencies(): Promise<MonedaDb[]> {
  const { data } = await api.get<ApiResponse<MonedaDb[]>>("/currency/db");
  return data.data;
}
