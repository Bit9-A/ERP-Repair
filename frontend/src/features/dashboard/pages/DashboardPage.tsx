import {
  SimpleGrid,
  Stack,
  Title,
  Grid,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconTicket,
  IconClock,
  IconCurrencyDollar,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { KanbanPreview } from "../components/KanbanPreview";
import { RecentTickets } from "../components/RecentTickets";
import { QuickActions } from "../components/QuickActions";
import { useAuthStore } from "../../auth/store/auth.store";
import { useDashboardData, useFinanceStats } from "../../../services";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: dashboardData, isLoading } = useDashboardData();
  const { data: financeStats } = useFinanceStats();
  console.log("dashboardData", dashboardData);
  console.log("financeStats", financeStats);

  const { kanbanCounts, metrics } = dashboardData || {
    kanbanCounts: {
      RECIBIDO: 0,
      EN_REVISION: 0,
      ESPERANDO_REPUESTO: 0,
      REPARADO: 0,
      ENTREGADO: 0,
      ABANDONO: 0,
    },
    metrics: {
      activeTickets: 0,
      waitingParts: 0,
      lowStockCount: 0,
      todayRevenue: 0,
    },
  };

  const { activeTickets, waitingParts, lowStockCount } = metrics;
  const todayRevenue = financeStats?.ingresosHoy ?? 0;
  const counts: Record<string, number> = kanbanCounts as unknown as Record<
    string,
    number
  >;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {/* Greeting */}
      <Box>
        <Title order={2} c="gray.1">
          {getGreeting()}, {user?.nombre || "Admin"}
        </Title>
      </Box>

      {/* KPI Row */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <StatCard
          title="Tickets Activos"
          value={activeTickets}
          icon={<IconTicket size={20} />}
          accentColor="#22C55E"
        />
        <StatCard
          title="En Espera Repuesto"
          value={String(waitingParts).padStart(2, "0")}
          icon={<IconClock size={20} />}
          accentColor="#F59E0B"
        />
        <StatCard
          title="Ingresos Hoy"
          value={`$${todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<IconCurrencyDollar size={20} />}
          accentColor="#3B82F6"
        />
        <StatCard
          title="Stock Bajo"
          value={String(lowStockCount).padStart(2, "0")}
          icon={<IconAlertTriangle size={20} />}
          accentColor="#EF4444"
          subtitle="Reponer ahora"
        />
      </SimpleGrid>

      {/* Two-column: Workflow Status + Historial Reciente */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <KanbanPreview counts={counts} />
            <QuickActions />
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <RecentTickets />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
