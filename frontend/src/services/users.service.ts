import { api } from "../lib/api";
import type { ApiResponse, Usuario } from "../types";

// ============================================
// Users service — /api/users
// ============================================

export interface CreateUserPayload {
  nombre: string;
  email: string;
  password: string;
  rol: Usuario["rol"];
  porcentaje_comision_base?: number;
}

export interface UpdateUserPayload {
  nombre?: string;
  email?: string;
  rol?: Usuario["rol"];
  porcentaje_comision_base?: number;
}

/** GET /users/me */
export async function getMe(): Promise<Usuario> {
  const { data } = await api.get<ApiResponse<Usuario>>("/users/me");
  return data.data;
}

/** GET /users */
export async function getAll(): Promise<Usuario[]> {
  const { data } = await api.get<ApiResponse<Usuario[]>>("/users");
  return data.data;
}

/** GET /users/:id */
export async function getById(id: string): Promise<Usuario> {
  const { data } = await api.get<ApiResponse<Usuario>>(`/users/${id}`);
  return data.data;
}

/** POST /users */
export async function create(payload: CreateUserPayload): Promise<Usuario> {
  const { data } = await api.post<ApiResponse<Usuario>>("/users", payload);
  return data.data;
}

/** PUT /users/:id */
export async function update(
  id: string,
  payload: UpdateUserPayload,
): Promise<Usuario> {
  const { data } = await api.put<ApiResponse<Usuario>>(`/users/${id}`, payload);
  return data.data;
}

/** DELETE /users/:id */
export async function remove(id: string): Promise<Usuario> {
  const { data } = await api.delete<ApiResponse<Usuario>>(`/users/${id}`);
  return data.data;
}
