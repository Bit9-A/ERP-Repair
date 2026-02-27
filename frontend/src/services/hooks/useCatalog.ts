import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as catalogService from "../catalog.service";
import type {
  CreateServicioPayload,
  UpdateServicioPayload,
} from "../catalog.service";

// ============================================
// React Query hooks — Catalog (servicios)
// ============================================

export function useServicios() {
  return useQuery({
    queryKey: queryKeys.catalog.all,
    queryFn: catalogService.getAll,
  });
}

export function useServicio(id: string) {
  return useQuery({
    queryKey: queryKeys.catalog.detail(id),
    queryFn: () => catalogService.getById(id),
    enabled: !!id,
  });
}

export function useCreateServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateServicioPayload) =>
      catalogService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.all });
    },
  });
}

export function useUpdateServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateServicioPayload & { id: string }) =>
      catalogService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.all });
      qc.invalidateQueries({
        queryKey: queryKeys.catalog.detail(variables.id),
      });
    },
  });
}

export function useDeleteServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.catalog.all });
    },
  });
}
