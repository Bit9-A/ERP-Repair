import { Group, ScrollArea } from "@mantine/core";
import { KanbanColumn } from "./KanbanColumn";
import { KANBAN_COLUMNS } from "../../../lib/constants";
import type { EstadoTicket, TicketReparacion } from "../types/tickets.types";
import dayjs from "dayjs";

interface KanbanBoardProps {
  tickets: TicketReparacion[];
  onTicketClick?: (ticket: TicketReparacion) => void;
}

export function KanbanBoard({ tickets, onTicketClick }: KanbanBoardProps) {

  // --- LÓGICA DE INTELIGENCIA DE NEGOCIO (PRO) ---
  const processedTickets = tickets.map(ticket => {
    // Calculamos los días basándonos en la fecha_ingreso de nuestro nuevo tipo
    const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), 'day');

    // Regla de los 90 días: Forzamos el estado a ABANDONO (en mayúsculas como definimos)
    // Excluimos los equipos que ya fueron ENTREGADOS
    if (diasTranscurridos >= 90 && ticket.estado !== 'ENTREGADO') {
      return {
        ...ticket,
        estado: 'ABANDONO' as EstadoTicket,
        esUrgente: true // Esta propiedad la usará la TicketCard para ponerse roja
      };
    }

    // Regla de los 60 días: Alerta preventiva
    if (diasTranscurridos >= 60 && ticket.estado !== 'ENTREGADO') {
      return {
        ...ticket,
        esUrgente: true
      };
    }

    return ticket;
  });

  // Agrupamos los tickets por columna usando los estados profesionales
  const grouped = KANBAN_COLUMNS.reduce(
    (acc, col) => {
      acc[col] = processedTickets.filter((t) => t.estado === col);
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
        style={{ minWidth: 1400, padding: "10px 0" }}
      >
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col}
            estado={col}
            // Pasamos los tickets ya procesados con la lógica de abandono aplicada
            tickets={grouped[col] || []}
            onTicketClick={onTicketClick}
          // Aquí la columna de ABANDONO podría recibir un estilo especial si quisieras
          />
        ))}
      </Group>
    </ScrollArea>
  );
}