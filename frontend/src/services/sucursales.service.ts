import { api } from "../lib/api";
import type {
  ApiResponse,
  Sucursal,
  SucursalProducto,
  Producto,
} from "../types";

// ============================================
// Sucursales service — /api/sucursales
// ============================================

export async function getAll(): Promise<Sucursal[]> {
  const { data } = await api.get<ApiResponse<Sucursal[]>>("/sucursales");
  return data.data;
}

export async function getById(id: string): Promise<Sucursal> {
  const { data } = await api.get<ApiResponse<Sucursal>>(`/sucursales/${id}`);
  return data.data;
}

export async function getInventario(
  sucursalId: string,
): Promise<SucursalProducto[]> {
  const { data } = await api.get<ApiResponse<SucursalProducto[]>>(
    `/sucursales/${sucursalId}/inventario`,
  );
  return data.data;
}

export async function getInventarioTotal(): Promise<Producto[]> {
  const { data } = await api.get<ApiResponse<Producto[]>>(
    "/sucursales/inventario/total",
  );
  return data.data;
}

export async function create(payload: {
  nombre: string;
  direccion?: string;
}): Promise<Sucursal> {
  const { data } = await api.post<ApiResponse<Sucursal>>(
    "/sucursales",
    payload,
  );
  return data.data;
}

export async function update(
  id: string,
  payload: Partial<{ nombre: string; direccion: string; activa: boolean }>,
): Promise<Sucursal> {
  const { data } = await api.patch<ApiResponse<Sucursal>>(
    `/sucursales/${id}`,
    payload,
  );
  return data.data;
}

export async function remove(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<ApiResponse<{ message: string }>>(
    `/sucursales/${id}`,
  );
  return data.data;
}

export async function transferirStock(payload: {
  origenId: string;
  destinoId: string;
  productoId: string;
  cantidad: number;
}): Promise<{ success: boolean; cantidad: number }> {
  const { data } = await api.post<
    ApiResponse<{ success: boolean; cantidad: number }>
  >("/sucursales/transferir", payload);
  return data.data;
}
