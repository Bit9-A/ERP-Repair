import { useState, useCallback } from "react";
import {
  Box,
  Stack,
  Text,
  Group,
  Badge,
  Paper,
  ScrollArea,
  ThemeIcon,
} from "@mantine/core";
import { IconInbox, IconArrowDownCircle } from "@tabler/icons-react";
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
  REPARADO: "#10B981",
  ENTREGADO: "#8B5CF6",
  ABANDONO: "#EF4444",
};

export function KanbanBoard({
  tickets,
  onTicketClick,
  onMoveTicket,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Business logic: 60/90 day abandon rules
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

  // Native HTML5 DnD handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, ticket: TicketReparacion) => {
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
          width: 310,
          minWidth: 310,
          height: "calc(100vh - 280px)",
          minHeight: 520,
          display: "flex",
          flexDirection: "column",
          background: isOver ? `${accentColor}18` : "var(--bg-elevated)",
          border: isOver
            ? `2px dashed ${accentColor}`
            : "1px solid var(--border-subtle)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: isOver ? `0 8px 24px ${accentColor}25` : "none",
        }}
      >
        {/* Column header */}
        <Group
          justify="space-between"
          align="center"
          mb="sm"
          pb="xs"
          style={{
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <Group gap="xs">
            <Box
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: accentColor,
              }}
            />
            <Text
              size="xs"
              fw={700}
              className="font-heading"
              tt="uppercase"
              style={{ letterSpacing: "0.06em", color: "var(--text-primary)" }}
            >
              {status.label}
            </Text>
          </Group>

          <Badge
            size="sm"
            variant="light"
            style={{
              backgroundColor: `${accentColor}20`,
              color: accentColor,
              fontWeight: 700,
            }}
          >
            {columnTickets.length}
          </Badge>
        </Group>

        {/* Scrollable list of cards */}
        <ScrollArea
          style={{ flex: 1 }}
          type="hover"
          offsetScrollbars
        >
          <Stack gap="xs" style={{ minHeight: "100%", paddingBottom: 16 }}>
            {columnTickets.map((ticket) => (
              <Box
                key={ticket.id}
                draggable={ticket.estado !== "ENTREGADO"}
                onDragStart={(e) => handleDragStart(e, ticket)}
                onDragEnd={handleDragEnd}
                style={{
                  cursor: ticket.estado === "ENTREGADO" ? "default" : "grab",
                  opacity: draggingId === ticket.id ? 0.35 : 1,
                  transition: "opacity 150ms ease",
                }}
              >
                <TicketCard
                  ticket={ticket}
                  onClick={onTicketClick}
                  onMoveTicket={
                    ticket.estado !== "ENTREGADO"
                      ? (nuevo) => onMoveTicket?.(ticket.id, nuevo)
                      : undefined
                  }
                />
              </Box>
            ))}

            {columnTickets.length === 0 && (
              <Stack align="center" justify="center" py="xl" gap={4} style={{ opacity: 0.5 }}>
                {isOver ? (
                  <>
                    <ThemeIcon size="lg" radius="xl" color="blue" variant="light">
                      <IconArrowDownCircle size={20} />
                    </ThemeIcon>
                    <Text size="xs" fw={600} mt={4} c="blue">
                      Soltar aquí
                    </Text>
                  </>
                ) : (
                  <>
                    <IconInbox size={26} stroke={1.5} />
                    <Text size="xs" c="dimmed">
                      Sin órdenes
                    </Text>
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </ScrollArea>
      </Paper>
    );
  };

  return (
    <ScrollArea
      pb="md"
      offsetScrollbars
      type="auto"
      scrollbarSize={10}
      styles={{
        viewport: { paddingBottom: 8 },
      }}
    >
      <Group
        align="flex-start"
        wrap="nowrap"
        gap="16px"
        style={{
          width: "max-content",
          minWidth: "100%",
          paddingBottom: 4,
        }}
      >
        {KANBAN_COLUMNS.map(renderColumn)}
      </Group>
    </ScrollArea>
  );
}
