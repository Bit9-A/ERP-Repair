import {
  SimpleGrid,
  Stack,
  Title,
  Text,
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
import { useKanbanCounts } from "../../../services";
import { useProducts, useRepairs } from "../../../services";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: kanbanCounts } = useKanbanCounts();
  const { data: products = [] } = useProducts();
  const { data: repairs = [], isLoading } = useRepairs();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  // KPI calculations from real data
  const activeTickets = repairs.filter((r) => r.estado !== "ENTREGADO").length;
  const waitingParts = repairs.filter(
    (r) => r.estado === "ESPERANDO_REPUESTO",
  ).length;
  const lowStockCount = products.filter(
    (p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo,
  ).length;

  // Approximate today's revenue from delivered tickets
  const todayRevenue = repairs
    .filter((r) => {
      if (!r.fecha_ingreso) return false;
      const today = new Date().toDateString();
      return new Date(r.fecha_ingreso).toDateString() === today;
    })
    .reduce((sum, r) => sum + (r.precio_total_usd || 0), 0);

  const counts = kanbanCounts || {
    RECIBIDO: 0,
    EN_REVISION: 0,
    ESPERANDO_REPUESTO: 0,
    REPARADO: 0,
    ENTREGADO: 0,
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
