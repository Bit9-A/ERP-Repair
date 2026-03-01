import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as brandsService from "../brands.service";

// ============================================
// React Query hooks — Brands (Marcas & Modelos)
// ============================================

export function useMarcas() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: brandsService.getAllMarcas,
  });
}

export function useCreateMarca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nombre: string) => brandsService.createMarca(nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useDeleteMarca() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsService.deleteMarca(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useModelosByMarca(marcaId: string | undefined) {
  return useQuery({
    queryKey: ["brands", marcaId, "modelos"],
    queryFn: () => brandsService.getModelosByMarca(marcaId!),
    enabled: !!marcaId,
  });
}

export function useCreateModelo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ marcaId, nombre }: { marcaId: string; nombre: string }) =>
      brandsService.createModelo(marcaId, nombre),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}
