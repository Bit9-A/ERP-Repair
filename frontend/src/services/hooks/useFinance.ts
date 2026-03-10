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

export function usePagos(periodo?: "dia" | "semana" | "mes") {
  return useQuery({
    queryKey: queryKeys.finance.pagos(periodo),
    queryFn: () => financeService.getPagos(periodo),
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

export function useFinanceStats(periodo?: "dia" | "semana" | "mes") {
  return useQuery({
    queryKey: [...queryKeys.finance.stats, periodo ?? "dia"],
    queryFn: () => financeService.getStats(periodo),
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
}

// -- Egresos (Gastos) --

export function useEgresos(periodo?: "dia" | "semana" | "mes") {
  return useQuery({
    queryKey: queryKeys.finance.egresos(periodo),
    queryFn: () => financeService.getEgresos(periodo),
  });
}

export function useCreateEgreso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: financeService.CreateEgresoPayload) =>
      financeService.createEgreso(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteEgreso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteEgreso(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["finance"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// -- Egresos Recurrentes --

export function useRecurrentes() {
  return useQuery({
    queryKey: queryKeys.finance.recurrentes,
    queryFn: financeService.getRecurrentes,
  });
}

export function useCreateRecurrente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: financeService.CreateRecurrentePayload) =>
      financeService.createRecurrente(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.recurrentes });
    },
  });
}

export function useDeleteRecurrente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financeService.deleteRecurrente(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.recurrentes });
    },
  });
}

export function useUpdateRecurrente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<financeService.CreateRecurrentePayload>;
    }) => financeService.updateRecurrente(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.finance.recurrentes });
    },
  });
}
