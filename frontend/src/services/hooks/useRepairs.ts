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
