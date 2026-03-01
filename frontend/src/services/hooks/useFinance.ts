import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as financeService from "../finance.service";
import type {
  CreateMonedaPayload,
  RegisterPagoPayload,
} from "../finance.service";

// ============================================
// React Query hooks — Finance
// ============================================

// -- Monedas --

export function useMonedas() {
  return useQuery({
    queryKey: queryKeys.finance.monedas,
    queryFn: financeService.getMonedas,
  });
}

export function useCreateMoneda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMonedaPayload) =>
      financeService.createMoneda(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.monedas });
    },
  });
}

export function useUpdateTasa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tasa_cambio }: { id: string; tasa_cambio: number }) =>
      financeService.updateTasa(id, tasa_cambio),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.monedas });
    },
  });
}

// -- Pagos --

export function usePagos(fecha?: string) {
  return useQuery({
    queryKey: queryKeys.finance.pagos(fecha),
    queryFn: () => financeService.getPagos(fecha),
  });
}

export function useRegistrarPago() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPagoPayload) =>
      financeService.registrarPago(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// -- Cierre de caja --

export function useCierre(fecha?: string) {
  return useQuery({
    queryKey: queryKeys.finance.cierre(fecha),
    queryFn: () => financeService.getCierre(fecha),
  });
}

// -- Stats --

export function useFinanceStats() {
  return useQuery({
    queryKey: queryKeys.finance.stats,
    queryFn: financeService.getStats,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}
