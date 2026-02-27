import { api } from "../lib/api";
import type {
  ApiResponse,
  TransaccionFinanciera,
  TipoTransaccion,
} from "../types";

// ============================================
// Transactions service — /api/transactions
// ============================================

export interface TransactionsFilters {
  tipo?: TipoTransaccion;
  categoria?: string;
  desde?: string;
  hasta?: string;
}

export interface CreateTransactionPayload {
  tipo: TipoTransaccion;
  monto_usd: number;
  concepto: string;
  categoria?: string;
  ticketId?: string;
  ventaId?: string;
}

export interface TransactionBalance {
  ingresos: number;
  egresos: number;
  balance: number;
}

export interface TransactionStatsHoy {
  ingresosHoy: number;
  egresosHoy: number;
  balanceHoy: number;
  cantidadHoy: number;
}

export interface CategoriaBreakdown {
  categoria: string;
  total: number;
  cantidad: number;
}

/** GET /transactions */
export async function getAll(
  filters?: TransactionsFilters,
): Promise<TransaccionFinanciera[]> {
  const { data } = await api.get<ApiResponse<TransaccionFinanciera[]>>(
    "/transactions",
    { params: filters },
  );
  return data.data;
}

/** POST /transactions */
export async function create(
  payload: CreateTransactionPayload,
): Promise<TransaccionFinanciera> {
  const { data } = await api.post<ApiResponse<TransaccionFinanciera>>(
    "/transactions",
    payload,
  );
  return data.data;
}

/** GET /transactions/stats */
export async function getStatsHoy(): Promise<TransactionStatsHoy> {
  const { data } = await api.get<ApiResponse<TransactionStatsHoy>>(
    "/transactions/stats",
  );
  return data.data;
}

/** GET /transactions/balance */
export async function getBalance(
  desde?: string,
  hasta?: string,
): Promise<TransactionBalance> {
  const { data } = await api.get<ApiResponse<TransactionBalance>>(
    "/transactions/balance",
    { params: { desde, hasta } },
  );
  return data.data;
}

/** GET /transactions/categorias */
export async function getByCategoria(
  desde?: string,
  hasta?: string,
): Promise<CategoriaBreakdown[]> {
  const { data } = await api.get<ApiResponse<CategoriaBreakdown[]>>(
    "/transactions/categorias",
    { params: { desde, hasta } },
  );
  return data.data;
}
