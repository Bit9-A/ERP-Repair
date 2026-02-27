import { useState, useCallback } from "react";
import {
  Box,
  SimpleGrid,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
} from "@mantine/core";
import { TicketCard } from "./TicketCard";
import { KANBAN_COLUMNS, TICKET_STATUS } from "../../../lib/constants";
import type { EstadoTicket, TicketReparacion } from "../../../types";
import dayjs from "dayjs";

interface KanbanBoardProps {
  tickets: TicketReparacion[];
  onTicketClick?: (ticket: TicketReparacion) => void;
  onMoveTicket?: (ticketId: string, newEstado: EstadoTicket) => void;
}

const COLUMN_COLORS: Record<EstadoTicket, string> = {
  RECIBIDO: "#64748B",
  EN_REVISION: "#3B82F6",
  ESPERANDO_REPUESTO: "#F59E0B",
  REPARADO: "#22C55E",
  ENTREGADO: "#8B5CF6",
  ABANDONO: "#EF4444",
};

// 2-row layout: top 3 + bottom 3
const TOP_ROW: EstadoTicket[] = [
  "RECIBIDO",
  "EN_REVISION",
  "ESPERANDO_REPUESTO",
];
const BOTTOM_ROW: EstadoTicket[] = ["REPARADO", "ENTREGADO", "ABANDONO"];

export function KanbanBoard({
  tickets,
  onTicketClick,
  onMoveTicket,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // --- Business logic: 60/90 day rules ---
  const processedTickets = tickets.map((ticket) => {
    const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), "day");

    if (diasTranscurridos >= 90 && ticket.estado !== "ENTREGADO") {
      return {
        ...ticket,
        estado: "ABANDONO" as EstadoTicket,
        esUrgente: true,
      };
    }

    if (diasTranscurridos >= 60 && ticket.estado !== "ENTREGADO") {
      return { ...ticket, esUrgente: true };
    }

    return ticket;
  });

  // Group tickets by column
  const grouped = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = processedTickets.filter((t) => t.estado === col);
      return acc;
    },
    {} as Record<EstadoTicket, TicketReparacion[]>,
  );

  // --- Native HTML5 DnD handlers ---
  const handleDragStart = useCallback(
    (e: React.DragEvent, ticketId: string) => {
      e.dataTransfer.setData("text/plain", ticketId);
      e.dataTransfer.effectAllowed = "move";
      setDraggingId(ticketId);
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent, estado: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(estado);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, estado: EstadoTicket) => {
      e.preventDefault();
      const ticketId = e.dataTransfer.getData("text/plain");
      setDragOverColumn(null);
      setDraggingId(null);
      if (ticketId) {
        onMoveTicket?.(ticketId, estado);
      }
    },
    [onMoveTicket],
  );

  const handleDragEnd = useCallback(() => {
    setDragOverColumn(null);
    setDraggingId(null);
  }, []);

  const renderColumn = (estado: EstadoTicket) => {
    const status = TICKET_STATUS[estado];
    const accentColor = COLUMN_COLORS[estado];
    const columnTickets = grouped[estado] || [];
    const isOver = dragOverColumn === estado;

    return (
      <Paper
        key={estado}
        p="sm"
        radius="lg"
        onDragOver={(e) => handleDragOver(e, estado)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, estado)}
        style={{
          flex: 1,
          minHeight: 200,
          background: isOver ? `${accentColor}15` : "var(--bg-card)",
          border: isOver
            ? `2px dashed ${accentColor}`
            : "1px solid var(--border-subtle)",
          transition: "all 200ms ease",
          transform: isOver ? "scale(1.01)" : "scale(1)",
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
            {columnTickets.length}
          </Badge>
        </Group>

        {/* Draggable Cards */}
        <Stack gap="sm" style={{ minHeight: 120 }}>
          {columnTickets.map((ticket) => (
            <Box
              key={ticket.id}
              draggable
              onDragStart={(e) => handleDragStart(e, ticket.id)}
              onDragEnd={handleDragEnd}
              style={{
                cursor: "grab",
                opacity: draggingId === ticket.id ? 0.4 : 1,
                transition: "opacity 150ms ease",
              }}
            >
              <TicketCard ticket={ticket} onClick={onTicketClick} />
            </Box>
          ))}

          {columnTickets.length === 0 && (
            <Text size="xs" c="dimmed" ta="center" py="xl">
              {isOver ? "Soltar aquí" : "Sin tickets"}
            </Text>
          )}
        </Stack>
      </Paper>
    );
  };

  return (
    <Stack gap="md">
      {/* Top row: RECIBIDO | EN_REVISION | ESPERANDO_REPUESTO */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {TOP_ROW.map(renderColumn)}
      </SimpleGrid>

      {/* Bottom row: REPARADO | ENTREGADO | ABANDONO */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {BOTTOM_ROW.map(renderColumn)}
      </SimpleGrid>
    </Stack>
  );
}
