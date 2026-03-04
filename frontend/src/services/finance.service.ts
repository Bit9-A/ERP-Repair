import { api } from "../lib/api";
import type { ApiResponse, Moneda, Pago } from "../types";

// ============================================
// Finance service — /api/finance
// ============================================

export interface CreateMonedaPayload {
  codigo: string;
  nombre?: string;
  tasa_cambio: number;
}

export interface RegisterPagoPayload {
  ticketId?: string;
  ventaId?: string;
  monedaId: string;
  monto_moneda_local: number;
  equivalente_usd: number;
  metodo: string;
  referencia?: string;
}

export interface CierreDeCaja {
  fecha: string;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  pagos: Pago[];
}

export interface FinanceStats {
  ingresosHoy: number;
  egresosHoy: number;
  balanceHoy: number;
  ticketsCobradosHoy: number;
  cantidadEgresosHoy: number;
  totalPagosHistorico: number;
}

// -- Monedas --

/** GET /finance/monedas */
export async function getMonedas(): Promise<Moneda[]> {
  const { data } = await api.get<ApiResponse<Moneda[]>>("/finance/monedas");
  return data.data;
}

/** POST /finance/monedas */
export async function createMoneda(
  payload: CreateMonedaPayload,
): Promise<Moneda> {
  const { data } = await api.post<ApiResponse<Moneda>>(
    "/finance/monedas",
    payload,
  );
  return data.data;
}

/** PATCH /finance/monedas/:id */
export async function updateTasa(
  id: string,
  tasa_cambio: number,
): Promise<Moneda> {
  const { data } = await api.patch<ApiResponse<Moneda>>(
    `/finance/monedas/${id}`,
    { tasa_cambio },
  );
  return data.data;
}

// -- Pagos --

/** GET /finance/pagos */
export async function getPagos(
  periodo?: "dia" | "semana" | "mes",
): Promise<Pago[]> {
  const { data } = await api.get<ApiResponse<Pago[]>>("/finance/pagos", {
    params: periodo ? { periodo } : undefined,
  });
  return data.data;
}

/** POST /finance/pagos */
export async function registrarPago(
  payload: RegisterPagoPayload,
): Promise<Pago> {
  const { data } = await api.post<ApiResponse<Pago>>("/finance/pagos", payload);
  return data.data;
}

// -- Cierre de caja --

/** GET /finance/cierre */
export async function getCierre(fecha?: string): Promise<CierreDeCaja> {
  const { data } = await api.get<ApiResponse<CierreDeCaja>>("/finance/cierre", {
    params: fecha ? { fecha } : undefined,
  });
  return data.data;
}

// -- Stats --

/** GET /finance/stats */
export async function getStats(
  periodo?: "dia" | "semana" | "mes",
): Promise<FinanceStats> {
  const { data } = await api.get<ApiResponse<FinanceStats>>("/finance/stats", {
    params: periodo ? { periodo } : undefined,
  });
  return data.data;
}
