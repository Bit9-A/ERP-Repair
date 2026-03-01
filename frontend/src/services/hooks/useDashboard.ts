import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as dashboardService from "../dashboard.service";

export function useDashboardData() {
  return useQuery({
    queryKey: queryKeys.dashboard.data,
    queryFn: dashboardService.getDashboardData,
    staleTime: 0, // Siempre considerado obsoleto
    refetchOnMount: true, // Recarga al entrar al Dashboard
    refetchOnWindowFocus: true, // Recarga al volver a la ventana
  });
}
