import { api } from "../lib/api";
import type {
  ApiResponse,
  Moneda,
  Pago,
  GastoRecurrente,
  FrecuenciaGasto,
} from "../types";

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
  periodo?: string,
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
  periodo?: string,
): Promise<FinanceStats> {
  const { data } = await api.get<ApiResponse<FinanceStats>>("/finance/stats", {
    params: periodo ? { periodo } : undefined,
  });
  return data.data;
}

// ============================================
// Egresos (Gastos)
// ============================================

export interface CreateEgresoPayload {
  monto_usd: number;
  concepto: string;
  categoria?: string;
  esFijo?: boolean;
}

/** GET /finance/egresos */
export async function getEgresos(
  periodo?: string,
): Promise<import("../types").TransaccionFinanciera[]> {
  const { data } = await api.get<
    ApiResponse<import("../types").TransaccionFinanciera[]>
  >("/finance/egresos", {
    params: periodo ? { periodo } : undefined,
  });
  return data.data;
}

/** POST /finance/egresos */
export async function createEgreso(
  payload: CreateEgresoPayload,
): Promise<import("../types").TransaccionFinanciera> {
  const { data } = await api.post<
    ApiResponse<import("../types").TransaccionFinanciera>
  >("/finance/egresos", payload);
  return data.data;
}

/** DELETE /finance/egresos/:id */
export async function deleteEgreso(
  id: string,
): Promise<import("../types").TransaccionFinanciera> {
  const { data } = await api.delete<
    ApiResponse<import("../types").TransaccionFinanciera>
  >(`/finance/egresos/${id}`);
  return data.data;
}

// ============================================
// Egresos Recurrentes (Programados)
// ============================================

export interface CreateRecurrentePayload {
  monto_usd: number;
  concepto: string;
  frecuencia: FrecuenciaGasto;
  categoria?: string;
  proximaFecha?: string;
}

export async function getRecurrentes(): Promise<GastoRecurrente[]> {
  const { data } = await api.get<ApiResponse<GastoRecurrente[]>>(
    "/finance/egresos/recurrentes",
  );
  return data.data;
}

export async function createRecurrente(
  payload: CreateRecurrentePayload,
): Promise<GastoRecurrente> {
  const { data } = await api.post<ApiResponse<GastoRecurrente>>(
    "/finance/egresos/recurrentes",
    payload,
  );
  return data.data;
}

export async function deleteRecurrente(id: string): Promise<null> {
  const { data } = await api.delete<ApiResponse<null>>(
    `/finance/egresos/recurrentes/${id}`,
  );
  return data.data;
}

export async function updateRecurrente(
  id: string,
  payload: Partial<CreateRecurrentePayload>,
): Promise<GastoRecurrente> {
  const { data } = await api.patch<ApiResponse<GastoRecurrente>>(
    `/finance/egresos/recurrentes/${id}`,
    payload,
  );
  return data.data;
}
