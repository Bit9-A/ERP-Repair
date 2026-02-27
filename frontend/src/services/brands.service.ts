import { api } from "../lib/api";
import type { ApiResponse } from "../types";

// ── Types ──

export interface Marca {
  id: string;
  nombre: string;
  modelos: Modelo[];
  createdAt: string;
}

export interface Modelo {
  id: string;
  nombre: string;
  marcaId: string;
  createdAt: string;
}

// ── Marca API ──

export async function getAllMarcas(): Promise<Marca[]> {
  const { data } = await api.get<ApiResponse<Marca[]>>("/brands");
  return data.data;
}

export async function createMarca(nombre: string): Promise<Marca> {
  const { data } = await api.post<ApiResponse<Marca>>("/brands", { nombre });
  return data.data;
}

export async function deleteMarca(id: string): Promise<void> {
  await api.delete(`/brands/${id}`);
}

// ── Modelo API ──

export async function getModelosByMarca(marcaId: string): Promise<Modelo[]> {
  const { data } = await api.get<ApiResponse<Modelo[]>>(
    `/brands/${marcaId}/modelos`,
  );
  return data.data;
}

export async function createModelo(
  marcaId: string,
  nombre: string,
): Promise<Modelo> {
  const { data } = await api.post<ApiResponse<Modelo>>(
    `/brands/${marcaId}/modelos`,
    { nombre },
  );
  return data.data;
}

export async function deleteModelo(id: string): Promise<void> {
  await api.delete(`/brands/modelos/${id}`);
}
