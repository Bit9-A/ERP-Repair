import { Box, Stack, Text, Group, Badge } from "@mantine/core";
import { TicketCard } from "./TicketCard";
import { TICKET_STATUS } from "../../../lib/constants";
import type { EstadoTicket, TicketReparacion } from "../types/tickets.types";

interface KanbanColumnProps {
  estado: EstadoTicket;
  tickets: TicketReparacion[];
  onTicketClick?: (ticket: TicketReparacion) => void;
}

const COLUMN_COLORS: Record<EstadoTicket, string> = {
  RECIBIDO: "#64748B",
  EN_REVISION: "#3B82F6",
  ESPERANDO_REPUESTO: "#F59E0B",
  REPARADO: "#22C55E",
  ENTREGADO: "#8B5CF6",
  ABANDONO: "#EF4444",
};

export function KanbanColumn({
  estado,
  tickets,
  onTicketClick,
}: KanbanColumnProps) {
  const status = TICKET_STATUS[estado];
  const accentColor = COLUMN_COLORS[estado];

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 260,
        maxWidth: 320,
      }}
    >
      {/* Column header */}
      <Group
        gap="sm"
        mb="md"
        pb="sm"
        style={{ borderBottom: `2px solid ${accentColor}` }}
      >
        <Text
          size="xs"
          fw={700}
          tt="uppercase"
          style={{ letterSpacing: "0.05em", color: accentColor }}
        >
          {status.label}
        </Text>
        <Badge
          size="sm"
          variant="filled"
          radius="xl"
          style={{ backgroundColor: accentColor }}
        >
          {tickets.length}
        </Badge>
      </Group>

      {/* Cards */}
      <Stack
        gap="sm"
        style={{
          minHeight: 200,
          padding: 4,
        }}
      >
        {tickets.map((ticket) => (
          <TicketCard key={ticket.id} ticket={ticket} onClick={onTicketClick} />
        ))}

        {tickets.length === 0 && (
          <Text size="xs" c="dimmed" ta="center" py="xl">
            Sin tickets
          </Text>
        )}
      </Stack>
    </Box>
  );
}
