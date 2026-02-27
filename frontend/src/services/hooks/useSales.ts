import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as salesService from "../sales.service";
import type { SalesFilters, CreateSalePayload } from "../sales.service";

// ============================================
// React Query hooks — Sales
// ============================================

export function useSales(filters?: SalesFilters) {
  return useQuery({
    queryKey: queryKeys.sales.all(filters),
    queryFn: () => salesService.getAll(filters),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: queryKeys.sales.detail(id),
    queryFn: () => salesService.getById(id),
    enabled: !!id,
  });
}

export function useSalesStats() {
  return useQuery({
    queryKey: queryKeys.sales.stats,
    queryFn: salesService.getStats,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalePayload) => salesService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useMarcarPagada() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.marcarPagada(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: queryKeys.sales.detail(id) });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAnularVenta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesService.anular(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: queryKeys.sales.detail(id) });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
