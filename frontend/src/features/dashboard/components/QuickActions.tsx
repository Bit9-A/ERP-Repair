import { SimpleGrid, Paper, Text, ThemeIcon, Group } from "@mantine/core";
import { IconPlus, IconPackage, IconCash } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  label: string;
  description: string;
  icon: typeof IconPlus;
  color: string;
  path: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: "Nuevo Ticket",
    description: "Crear ticket de reparación",
    icon: IconPlus,
    color: "#22C55E",
    path: "/reparaciones",
  },
  {
    label: "Entrada Inventario",
    description: "Registrar entrada de productos",
    icon: IconPackage,
    color: "#3B82F6",
    path: "/inventario",
  },
  {
    label: "Cierre de Caja",
    description: "Generar reporte del día",
    icon: IconCash,
    color: "#8B5CF6",
    path: "/finanzas",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      {ACTIONS.map((action) => (
        <Paper
          key={action.label}
          p="lg"
          radius="lg"
          onClick={() => navigate(action.path)}
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
          className="quick-action-card"
        >
          <Group gap="md">
            <ThemeIcon
              size="xl"
              radius="lg"
              variant="light"
              style={{
                backgroundColor: `${action.color}20`,
                color: action.color,
              }}
            >
              <action.icon size={22} stroke={1.5} />
            </ThemeIcon>
            <div>
              <Text size="sm" fw={600} c="gray.1">
                {action.label}
              </Text>
              <Text size="xs" c="dimmed">
                {action.description}
              </Text>
            </div>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
