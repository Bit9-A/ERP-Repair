import { useState, useCallback } from "react";
import {
  Box,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
  ScrollArea,
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

// Single row for Kanban-style horizontal scrolling
const ALL_COLUMNS = KANBAN_COLUMNS;

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
    (e: React.DragEvent, ticket: TicketReparacion) => {
      // Prevent dragging if ticket is already delivered
      if (ticket.estado === "ENTREGADO") {
        e.preventDefault();
        return;
      }
      e.dataTransfer.setData("text/plain", ticket.id);
      e.dataTransfer.effectAllowed = "move";
      setDraggingId(ticket.id);
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
          minWidth: 320,
          maxWidth: 320,
          height: "calc(100vh - 250px)",
          display: "flex",
          flexDirection: "column",
          background: isOver ? `${accentColor}15` : "var(--bg-elevated)",
          border: isOver
            ? `2px dashed ${accentColor}`
            : "1px solid var(--border-subtle)",
          transition: "all 0.2s ease",
          transform: isOver ? "none" : "none",
          boxShadow: isOver ? "0 4px 20px rgba(15, 23, 42, 0.05)" : "none",
        }}
      >
        {/* Column header */}
        <Group
          justify="space-between"
          mb="xs"
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

        {/* Draggable Cards - scrollable area */}
        <ScrollArea
          style={{ flex: 1, marginRight: -10, paddingRight: 10 }}
          type="hover"
          offsetScrollbars
        >
          <Stack gap="sm" style={{ minHeight: "100%", paddingBottom: 20 }}>
            {columnTickets.map((ticket) => (
              <Box
                key={ticket.id}
                draggable={ticket.estado !== "ENTREGADO"} // Disable dragging visually if delivered
                onDragStart={(e) => handleDragStart(e, ticket)}
                onDragEnd={handleDragEnd}
                style={{
                  cursor: ticket.estado === "ENTREGADO" ? "default" : "grab",
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
        </ScrollArea>
      </Paper>
    );
  };

  return (
    <ScrollArea type="auto" offsetScrollbars pb="md">
      <Group align="flex-start" wrap="nowrap" gap="md" pb="sm">
        {ALL_COLUMNS.map(renderColumn)}
      </Group>
    </ScrollArea>
  );
}
