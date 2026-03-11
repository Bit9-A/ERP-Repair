import { Drawer, Timeline, Text, Badge, Group, Stack, Card, Loader } from "@mantine/core";
import { IconTool, IconCheck, IconX, IconClock, IconDeviceMobile } from "@tabler/icons-react";
import { useClientRepairs } from "../../../services/hooks/useRepairs";
import type { Cliente } from "../../../services/clients.service";

interface ClientHistoryDrawerProps {
  opened: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export function ClientHistoryDrawer({ opened, onClose, cliente }: ClientHistoryDrawerProps) {
  const { data: tickets = [], isLoading } = useClientRepairs(cliente?.id || "");

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "ENTREGADO": return "green";
      case "REPARADO": return "blue";
      case "EN_REVISION": return "yellow";
      case "ESPERANDO_REPUESTO": return "orange";
      case "ABANDONO": return "red";
      default: return "gray";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "ENTREGADO": return <IconCheck size={14} />;
      case "REPARADO": return <IconTool size={14} />;
      case "EN_REVISION": return <IconClock size={14} />;
      case "ABANDONO": return <IconX size={14} />;
      default: return <IconDeviceMobile size={14} />;
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={cliente ? `Historial de ${cliente.nombre}` : "Historial del Cliente"}
      overlayProps={{ opacity: 0.5, blur: 4 }}
    >
      <Stack gap="lg" mt="md">
        {isLoading ? (
          <Group justify="center" p="xl"><Loader /></Group>
        ) : tickets.length === 0 ? (
          <Text c="dimmed" fs="italic" ta="center" mt="xl">
            Este cliente no tiene reparaciones registradas.
          </Text>
        ) : (
          <Timeline active={ tickets.length } bulletSize={24} lineWidth={2}>
            {tickets.map((ticket) => (
              <Timeline.Item
                key={ticket.id}
                bullet={getStatusIcon(ticket.estado)}
                title={
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={600} size="sm">{ticket.marca} {ticket.modelo}</Text>
                    <Badge color={getStatusColor(ticket.estado)} size="sm" variant="light">
                      {ticket.estado.replace("_", " ")}
                    </Badge>
                  </Group>
                }
              >
                <Card withBorder radius="md" p="sm" mt="xs" shadow="sm">
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">
                        {new Date(ticket.fecha_ingreso).toLocaleDateString()}
                      </Text>
                      {ticket.fecha_entrega && (
                        <Text size="xs" c="dimmed">
                          Entregado: {new Date(ticket.fecha_entrega).toLocaleDateString()}
                        </Text>
                      )}
                    </Group>
                    
                    <Text size="sm">
                      <Text span fw={500} c="dimmed">Falla: </Text>
                      {ticket.falla}
                    </Text>

                    <Group justify="space-between" align="flex-end" mt="xs">
                      <Stack gap={0}>
                        <Text size="xs" c="dimmed">Técnico designado</Text>
                        <Text size="sm" fw={500}>{ticket.tecnico?.nombre || "Sin asignar"}</Text>
                      </Stack>
                      <Text fw={700} c="blue">
                        ${ticket.precio_total_usd.toFixed(2)}
                      </Text>
                    </Group>
                  </Stack>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Stack>
    </Drawer>
  );
}
