import { Card, Text, Group, Badge, Stack, Avatar } from "@mantine/core";
import { IconDeviceMobile, IconClock } from "@tabler/icons-react";
import type { TicketReparacion } from "../../../types";
import { TICKET_STATUS } from "../../../lib/constants";

interface TicketCardProps {
  ticket: TicketReparacion;
  onClick?: (ticket: TicketReparacion) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  RECIBIDO: "#64748B",
  EN_REVISION: "#3B82F6",
  ESPERANDO_REPUESTO: "#F59E0B",
  REPARADO: "#22C55E",
  ENTREGADO: "#8B5CF6",
};

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const status = TICKET_STATUS[ticket.estado];
  const borderColor = PRIORITY_COLORS[ticket.estado];

  return (
    <Card
      padding="sm"
      radius="md"
      className="kanban-card"
      onClick={() => onClick?.(ticket)}
      style={{
        background: "#1E293B",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        borderLeft: `3px solid ${borderColor}`,
        cursor: "grab",
        transition: "all 200ms ease",
      }}
    >
      {/* Header — ticket ID + tech avatar */}
      <Group justify="space-between" mb="xs">
        <Text ff="monospace" size="xs" fw={700} c="gray.1">
          #T-{String(ticket.id).padStart(3, "0")}
        </Text>
        <Avatar size="xs" radius="xl" color={borderColor} variant="filled">
          {(ticket.tecnico?.nombre ?? "?").charAt(0)}
        </Avatar>
      </Group>

      {/* Device — prominent */}
      <Group gap={6} mb={6}>
        <IconDeviceMobile size={14} color={borderColor} />
        <Text size="sm" fw={600} c="gray.1" lineClamp={1}>
          {ticket.equipo}
        </Text>
      </Group>

      {/* Failure description */}
      <Text size="xs" c="dimmed" lineClamp={2} mb="xs">
        {ticket.falla}
      </Text>

      {/* Footer — client + date */}
      <Group justify="space-between" mt="auto">
        <Text size="xs" c="dimmed">
          {ticket.cliente?.nombre ?? "Sin cliente"}
        </Text>
        <Group gap={4}>
          <IconClock size={12} color="#64748B" />
          <Text size="xs" c="dimmed" ff="monospace">
            {new Date(ticket.fecha_ingreso).toLocaleDateString("es-VE")}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
