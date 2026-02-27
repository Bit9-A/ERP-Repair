import { api } from "../lib/api";
import type { ApiResponse } from "../types";

// ── Types ──

export interface Cliente {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tickets: number; ventas: number };
}

export interface CreateClientePayload {
  nombre: string;
  cedula: string;
  telefono: string;
  correo?: string;
}

export interface UpdateClientePayload {
  nombre?: string;
  telefono?: string;
  correo?: string;
}

// ── API calls ──

export async function getAll(): Promise<Cliente[]> {
  const { data } = await api.get<ApiResponse<Cliente[]>>("/clients");
  return data.data;
}

export async function getById(id: string): Promise<Cliente> {
  const { data } = await api.get<ApiResponse<Cliente>>(`/clients/${id}`);
  return data.data;
}

export async function findByCedula(cedula: string): Promise<Cliente | null> {
  const { data } = await api.get<ApiResponse<Cliente | null>>(
    `/clients/cedula/${cedula}`,
  );
  return data.data;
}

export async function create(payload: CreateClientePayload): Promise<Cliente> {
  const { data } = await api.post<ApiResponse<Cliente>>("/clients", payload);
  return data.data;
}

export async function update(
  id: string,
  payload: UpdateClientePayload,
): Promise<Cliente> {
  const { data } = await api.patch<ApiResponse<Cliente>>(
    `/clients/${id}`,
    payload,
  );
  return data.data;
}

export async function remove(id: string): Promise<void> {
  await api.delete(`/clients/${id}`);
}
