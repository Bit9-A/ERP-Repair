import { api } from "../lib/api";
import type { ApiResponse, Servicio } from "../types";

// ============================================
// Catalog service (servicios de reparación)
// — /api/services
// ============================================

export interface CreateServicioPayload {
  nombre: string;
  precio_usd: number;
}

export interface UpdateServicioPayload extends Partial<CreateServicioPayload> {}

/** GET /services */
export async function getAll(): Promise<Servicio[]> {
  const { data } = await api.get<ApiResponse<Servicio[]>>("/services");
  return data.data;
}

/** GET /services/:id */
export async function getById(id: string): Promise<Servicio> {
  const { data } = await api.get<ApiResponse<Servicio>>(`/services/${id}`);
  return data.data;
}

/** POST /services */
export async function create(
  payload: CreateServicioPayload,
): Promise<Servicio> {
  const { data } = await api.post<ApiResponse<Servicio>>("/services", payload);
  return data.data;
}

/** PUT /services/:id */
export async function update(
  id: string,
  payload: UpdateServicioPayload,
): Promise<Servicio> {
  const { data } = await api.put<ApiResponse<Servicio>>(
    `/services/${id}`,
    payload,
  );
  return data.data;
}

/** DELETE /services/:id */
export async function remove(id: string): Promise<Servicio> {
  const { data } = await api.delete<ApiResponse<Servicio>>(`/services/${id}`);
  return data.data;
}
