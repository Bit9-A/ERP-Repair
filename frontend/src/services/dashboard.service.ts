import { api } from "../lib/api";
import type { ApiResponse } from "../types";

export interface DashboardData {
  kanbanCounts: {
    RECIBIDO: number;
    EN_REVISION: number;
    ESPERANDO_REPUESTO: number;
    REPARADO: number;
    ENTREGADO: number;
    ABANDONO: number;
  };
  metrics: {
    activeTickets: number;
    waitingParts: number;
    lowStockCount: number;
    todayRevenue: number;
  };
}

/** GET /dashboard */
export async function getDashboardData(): Promise<DashboardData> {
  const { data } = await api.get<ApiResponse<DashboardData>>("/dashboard");
  return data.data;
}
