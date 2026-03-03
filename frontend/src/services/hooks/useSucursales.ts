import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as sucursalesService from "../sucursales.service";
import type { Sucursal } from "../../types";

const QUERY_KEY = ["sucursales"] as const;

// ── Queries ──

export function useSucursales() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: sucursalesService.getAll,
  });
}

export function useSucursal(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => sucursalesService.getById(id),
    enabled: !!id,
  });
}

export function useSucursalInventario(sucursalId: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, sucursalId, "inventario"],
    queryFn: () => sucursalesService.getInventario(sucursalId),
    enabled: !!sucursalId,
  });
}

export function useInventarioTotal() {
  return useQuery({
    queryKey: [...QUERY_KEY, "inventario-total"],
    queryFn: sucursalesService.getInventarioTotal,
  });
}

// ── Mutations ──

export function useCreateSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sucursalesService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useUpdateSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sucursal> }) =>
      sucursalesService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}

export function useDeleteSucursal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sucursalesService.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
}
