import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as transactionsService from "../transactions.service";
import type {
  TransactionsFilters,
  CreateTransactionPayload,
} from "../transactions.service";

// ============================================
// React Query hooks — Transactions
// ============================================

export function useTransactions(filters?: TransactionsFilters) {
  return useQuery({
    queryKey: queryKeys.transactions.all(filters),
    queryFn: () => transactionsService.getAll(filters),
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransactionPayload) =>
      transactionsService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useTransactionStatsHoy() {
  return useQuery({
    queryKey: queryKeys.transactions.statsHoy,
    queryFn: transactionsService.getStatsHoy,
  });
}

export function useBalance(desde?: string, hasta?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.balance(desde, hasta),
    queryFn: () => transactionsService.getBalance(desde, hasta),
  });
}

export function useTransactionsByCategoria(desde?: string, hasta?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.categorias(desde, hasta),
    queryFn: () => transactionsService.getByCategoria(desde, hasta),
  });
}
