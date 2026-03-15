import { api } from "../lib/api";
import type { ApiResponse, Venta, EstadoVenta, MetodoPago } from "../types";

// ============================================
// Sales service — /api/sales
// ============================================

export interface SalesFilters {
  estado?: EstadoVenta;
  clienteId?: string;
}

export interface CreateSalePayload {
  clienteId?: string;
  sucursalId?: string;
  vendedorId?: string;
  descuento_usd?: number;
  items: {
    productoId: string;
    cantidad: number;
  }[];
  pago?: {
    monedaId: string;
    monto_moneda_local: number;
    equivalente_usd: number;
    metodo: MetodoPago;
    referencia?: string;
  };
}

export interface SalesStats {
  ventasHoy: number;
  totalHoy: number;
  ventasMes: number;
  totalMes: number;
}

/** GET /sales */
export async function getAll(filters?: SalesFilters): Promise<Venta[]> {
  const { data } = await api.get<ApiResponse<Venta[]>>("/sales", {
    params: filters,
  });
  return data.data;
}

/** GET /sales/:id */
export async function getById(id: string): Promise<Venta> {
  const { data } = await api.get<ApiResponse<Venta>>(`/sales/${id}`);
  return data.data;
}

/** POST /sales */
export async function create(payload: CreateSalePayload): Promise<Venta> {
  const { data } = await api.post<ApiResponse<Venta>>("/sales", payload);
  return data.data;
}

/** PATCH /sales/:id/pagar */
export async function marcarPagada(id: string): Promise<Venta> {
  const { data } = await api.patch<ApiResponse<Venta>>(`/sales/${id}/pagar`);
  return data.data;
}

/** PATCH /sales/:id/anular */
export async function anular(id: string): Promise<Venta> {
  const { data } = await api.patch<ApiResponse<Venta>>(`/sales/${id}/anular`);
  return data.data;
}

/** GET /sales/stats */
export async function getStats(): Promise<SalesStats> {
  const { data } = await api.get<ApiResponse<SalesStats>>("/sales/stats");
  return data.data;
}
