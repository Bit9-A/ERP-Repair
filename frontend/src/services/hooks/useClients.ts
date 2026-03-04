import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as clientsService from "../clients.service";
import type {
  CreateClientePayload,
  UpdateClientePayload,
} from "../clients.service";

// ============================================
// React Query hooks — Clients
// ============================================

export function useClients() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: clientsService.getAll,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => clientsService.getById(id),
    enabled: !!id,
  });
}

export function useClientByCedula(cedula: string) {
  return useQuery({
    queryKey: ["clients", "cedula", cedula],
    queryFn: () => clientsService.findByCedula(cedula),
    enabled: cedula.length >= 3, // only search when at least 3 chars typed
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateClientePayload) =>
      clientsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateClientePayload & { id: string }) =>
      clientsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}
