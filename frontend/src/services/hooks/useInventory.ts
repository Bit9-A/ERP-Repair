import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as inventoryService from "../inventory.service";
import type {
  InventoryFilters,
  CreateProductPayload,
  UpdateProductPayload,
  AdjustStockPayload,
  AddStockPayload,
} from "../inventory.service";

// ============================================
// React Query hooks — Inventory
// ============================================

export function useProducts(filters?: InventoryFilters) {
  return useQuery({
    queryKey: filters
      ? (["inventory", "products", filters] as const)
      : (["inventory", "products"] as const),
    queryFn: () => inventoryService.getAll(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.detail(id),
    queryFn: () => inventoryService.getById(id),
    enabled: !!id,
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: queryKeys.inventory.stats,
    queryFn: inventoryService.getStats,
  });
}

export function useLowStock() {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock,
    queryFn: inventoryService.getLowStock,
  });
}

export function useMovimientos(id: string) {
  return useQuery({
    queryKey: queryKeys.inventory.movimientos(id),
    queryFn: () => inventoryService.getMovimientos(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) =>
      inventoryService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateProductPayload & { id: string }) =>
      inventoryService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({
        queryKey: queryKeys.inventory.detail(variables.id),
      });
    },
  });
}

export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AdjustStockPayload & { id: string }) =>
      inventoryService.adjustStock(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({
        queryKey: queryKeys.inventory.detail(variables.id),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.inventory.movimientos(variables.id),
      });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inventoryService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}

// Feature 2 & 3: Add stock with supplier price and branch
export function useAddStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: AddStockPayload & { id: string }) =>
      inventoryService.addStock(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({
        queryKey: queryKeys.inventory.movimientos(variables.id),
      });
    },
  });
}

// Feature 2: supplier price history
export function useHistorialPrecios(id: string) {
  return useQuery({
    queryKey: ["inventory", id, "historial-precios"],
    queryFn: () => inventoryService.getHistorialPrecios(id),
    enabled: !!id,
  });
}
