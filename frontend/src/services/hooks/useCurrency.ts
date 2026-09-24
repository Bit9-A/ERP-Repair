import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as currencyService from "../currency.service";
import { queryKeys } from "../queryKeys";

// ============================================
// React Query hooks — Currency & DolarAPI (Venezuela)
// ============================================

/**
 * Hook para obtener las tasas consolidadas de DolarAPI (BCV, Paralelo, Euro)
 */
export function useCurrencyRates() {
  const query = useQuery({
    queryKey: queryKeys.currency.rates,
    queryFn: () => currencyService.getCurrencyRates(false),
    staleTime: 5 * 60 * 1000,       // 5 minutos fresca
    refetchInterval: 10 * 60 * 1000, // Revalida cada 10 min en segundo plano
  });

  return {
    ...query,
    rates: query.data,
    bcv: query.data?.usd.oficial ?? 0,
    paralelo: query.data?.usd.paralelo ?? 0,
    diferenciaPct: query.data?.usd.diferenciaPct ?? 0,
    eurBcv: query.data?.eur?.oficial ?? 0,
    eurParalelo: query.data?.eur?.paralelo ?? 0,
    fechaActualizacion: query.data?.usd.fechaActualizacion ?? "",
  };
}

/**
 * Hook para consultar las monedas guardadas en la base de datos
 */
export function useDbCurrencies() {
  return useQuery({
    queryKey: queryKeys.currency.db,
    queryFn: currencyService.getDbCurrencies,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para sincronizar la tasa BCV oficial en la base de datos
 */
export function useSyncBcvToDb() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: currencyService.syncBcvToDb,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.currency.db });
      qc.invalidateQueries({ queryKey: queryKeys.currency.rates });
    },
  });
}
