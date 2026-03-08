import { SimpleGrid, Paper, Text, ThemeIcon, Group } from "@mantine/core";
import { IconPlus, IconTool, IconPackage, IconShoppingCart, IconUserPlus, IconReceipt2, IconMapPinPlus } from "@tabler/icons-react";
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
    label: "Nueva Orden",
    description: "Crear orden de reparación",
    icon: IconTool, // Cambiado de Plus a Tool para asociarlo a reparaciones
    color: "#22C55E",
    path: "/reparaciones",
  },
  {
    label: "Entrada Inventario",
    description: "Registrar entrada de productos",
    icon: IconPackage, // Representa mejor la acción de "entrar" o gestionar cajas
    color: "#3B82F6",
    path: "/inventario",
  },
  {
    label: "Realizar Venta",
    description: "Registrar una venta",
    icon: IconShoppingCart, // El estándar universal para ventas/POS
    color: "#F59E0B", // Un naranja/ámbar queda mejor que el amarillo chillón para lectura
    path: "/ventas",
  },
  {
    label: "Registrar un Cliente",
    description: "Registrar un nuevo cliente",
    icon: IconUserPlus, // Específicamente para la acción de "agregar" persona
    color: "#06B6D4", // Un cian para diferenciarlo de ventas
    path: "/clients",
  },
  {
    label: "Cierre de Caja",
    description: "Generar reporte del día",
    icon: IconReceipt2, // Representa el ticket o reporte final de cuentas
    color: "#8B5CF6",
    path: "/finanzas",
  },
  {
    label: "Agregar Sucursal",
    description: "Configurar nueva ubicación",
    icon: IconMapPinPlus, // Icono de ubicación con un "+" para expansión
    color: "#EC4899", // Un rosa/fucsia para que destaque como acción administrativa
    path: "/sucursales",
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
              <Text size="sm" fw={600}>
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
