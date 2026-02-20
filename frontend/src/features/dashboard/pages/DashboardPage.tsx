import { SimpleGrid, Stack, Title, Text, Grid, Box } from "@mantine/core";
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

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <Stack gap="xl">
      {/* Greeting — matching Stitch "Buenos días, Admin" */}
      <Box>
        <Title order={2} c="gray.1">
          {getGreeting()}, {user?.nombre || "Admin"}
        </Title>
      </Box>

      {/* KPI Row — matching Stitch values */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <StatCard
          title="Tickets Activos"
          value={24}
          icon={<IconTicket size={20} />}
          accentColor="#22C55E"
        />
        <StatCard
          title="En Espera Repuesto"
          value="08"
          icon={<IconClock size={20} />}
          accentColor="#F59E0B"
          subtitle="4 críticos (urgente)"
        />
        <StatCard
          title="Ingresos Hoy"
          value="$1,240.00"
          icon={<IconCurrencyDollar size={20} />}
          accentColor="#3B82F6"
        />
        <StatCard
          title="Stock Bajo"
          value="05"
          icon={<IconAlertTriangle size={20} />}
          accentColor="#EF4444"
          subtitle="Reponer ahora"
        />
      </SimpleGrid>

      {/* Two-column: Workflow Status + Historial Reciente */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <KanbanPreview
              counts={{
                RECIBIDO: 5,
                EN_REVISION: 8,
                ESPERANDO_REPUESTO: 4,
                REPARADO: 5,
                ENTREGADO: 2,
              }}
            />
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
