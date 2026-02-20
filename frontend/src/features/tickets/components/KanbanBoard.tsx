import { Group, ScrollArea } from "@mantine/core";
import { KanbanColumn } from "./KanbanColumn";
import { KANBAN_COLUMNS } from "../../../lib/constants";
import type { EstadoTicket, TicketReparacion } from "../../../types";

interface KanbanBoardProps {
  tickets: TicketReparacion[];
  onTicketClick?: (ticket: TicketReparacion) => void;
}

export function KanbanBoard({ tickets, onTicketClick }: KanbanBoardProps) {
  // Group tickets by status
  const grouped = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = tickets.filter((t) => t.estado === col);
      return acc;
    },
    {} as Record<EstadoTicket, TicketReparacion[]>,
  );

  return (
    <ScrollArea type="auto" offsetScrollbars>
      <Group
        gap="md"
        align="flex-start"
        wrap="nowrap"
        style={{ minWidth: 1400, padding: "4px 0" }}
      >
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col}
            estado={col}
            tickets={grouped[col]}
            onTicketClick={onTicketClick}
          />
        ))}
      </Group>
    </ScrollArea>
  );
}
