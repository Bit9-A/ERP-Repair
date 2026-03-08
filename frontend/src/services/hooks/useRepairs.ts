import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as repairsService from "../repairs.service";
import type {
  RepairsFilters,
  CreateRepairPayload,
  UpdateRepairPayload,
} from "../repairs.service";
import type { EstadoTicket } from "../../types";

// ============================================
// React Query hooks — Repairs
// ============================================

export function useRepairs(filters?: RepairsFilters) {
  return useQuery({
    queryKey: filters
      ? (["repairs", "all", filters] as const)
      : (["repairs", "all"] as const),
    queryFn: () => repairsService.getAll(filters),
  });
}

export function useRepairsHistory(page: number, limit: number, search: string) {
  return useQuery({
    queryKey: ["repairs", "history", { page, limit, search }] as const,
    queryFn: () => repairsService.getHistory(page, limit, search),
  });
}

export function useRepair(id: string) {
  return useQuery({
    queryKey: queryKeys.repairs.detail(id),
    queryFn: () => repairsService.getById(id),
    enabled: !!id,
  });
}

export function useKanbanCounts() {
  return useQuery({
    queryKey: queryKeys.repairs.kanbanCounts,
    queryFn: repairsService.getKanbanCounts,
  });
}

export function useCreateRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRepairPayload) =>
      repairsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
    },
  });
}

export function useUpdateRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateRepairPayload & { id: string }) =>
      repairsService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
    },
  });
}

export function useUpdateEstado() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoTicket }) =>
      repairsService.updateEstado(id, estado),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
    },
  });
}

export function useAddRepuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      productoId,
      cantidad,
    }: {
      id: string;
      productoId: string;
      cantidad: number;
    }) => repairsService.addRepuesto(id, productoId, cantidad),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useAddServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      servicioId,
      precioCobrado,
    }: {
      id: string;
      servicioId: string;
      precioCobrado: number;
    }) => repairsService.addServicio(id, servicioId, precioCobrado),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
    },
  });
}

export function useDeleteRepair() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => repairsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
    },
  });
}

export function useRemoveRepuesto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, repuestoId }: { id: string; repuestoId: string }) =>
      repairsService.removeRepuesto(id, repuestoId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useRemoveServicio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, servicioId }: { id: string; servicioId: string }) =>
      repairsService.removeServicio(id, servicioId),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
    },
  });
}

export function useEntregarTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      pagos,
    }: {
      id: string;
      pagos: Array<{
        monedaId: string;
        monto_moneda_local: number;
        metodo: string;
        referencia?: string;
      }>;
    }) => repairsService.entregarTicket(id, pagos),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["repairs"] });
      qc.invalidateQueries({
        queryKey: queryKeys.repairs.detail(variables.id),
      });
      // Also invalidate finance-related queries so dashboard / finance page updates
      qc.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}
