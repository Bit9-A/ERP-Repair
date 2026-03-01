import {
  Table,
  Badge,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Paper,
  ScrollArea,
} from "@mantine/core";
import {
  IconEye,
  IconClock,
  IconAlertTriangle,
  IconDeviceMobile,
} from "@tabler/icons-react";
import { TICKET_STATUS } from "../../../lib/constants";
import type { EstadoTicket, TicketReparacion } from "../../../types";
import dayjs from "dayjs";

interface TicketListViewProps {
  tickets: TicketReparacion[];
  onTicketClick?: (ticket: TicketReparacion) => void;
}

const STATUS_COLORS: Record<string, string> = {
  RECIBIDO: "gray",
  EN_REVISION: "blue",
  ESPERANDO_REPUESTO: "orange",
  REPARADO: "green",
  ENTREGADO: "grape",
  ABANDONO: "red",
};

export function TicketListView({
  tickets,
  onTicketClick,
}: TicketListViewProps) {
  const rows = tickets.map((ticket) => {
    const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), "day");
    const esAlerta = diasTranscurridos >= 60;
    const esCritico = diasTranscurridos >= 90;
    const status = TICKET_STATUS[ticket.estado as EstadoTicket];
    const color = STATUS_COLORS[ticket.estado] || "gray";

    return (
      <Table.Tr
        key={ticket.id}
        onClick={() => onTicketClick?.(ticket)}
        style={{
          cursor: "pointer",
          backgroundColor: esCritico ? "rgba(239, 68, 68, 0.06)" : undefined,
          transition: "background 150ms ease",
        }}
        className="ticket-list-row"
      >
        <Table.Td>
          <Text size="sm" fw={600} ff="monospace" c="gray.3">
            #T-{ticket.id.substring(0, 6)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500} c="gray.1">
            {ticket.cliente?.nombre || "Sin cliente"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap={6} wrap="nowrap">
            <IconDeviceMobile size={14} />
            <Text size="sm" c="gray.2">
              {ticket.marca} {ticket.modelo}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="xs" c="dimmed" lineClamp={1} maw={200}>
            {ticket.falla}
          </Text>
        </Table.Td>
        <Table.Td>
          <Badge variant="light" color={color} size="sm">
            {status?.label || ticket.estado}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap={4} wrap="nowrap">
            {esAlerta && (
              <IconAlertTriangle
                size={14}
                color={
                  esCritico
                    ? "var(--mantine-color-red-6)"
                    : "var(--mantine-color-yellow-6)"
                }
              />
            )}
            <IconClock size={12} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {diasTranscurridos}d
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Text size="sm" ff="monospace" fw={700} c="brand.4">
            ${ticket.precio_total_usd?.toFixed(2) || "0.00"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Tooltip label="Ver / Editar">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onTicketClick?.(ticket);
              }}
            >
              <IconEye size={14} />
            </ActionIcon>
          </Tooltip>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper
      radius="lg"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}
    >
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          verticalSpacing="sm"
          horizontalSpacing="md"
          styles={{
            tr: {
              borderBottom: "1px solid var(--border-subtle)",
            },
            th: {
              color: "var(--mantine-color-gray-5)",
              fontWeight: 600,
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "2px solid var(--border-subtle)",
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ticket</Table.Th>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Equipo</Table.Th>
              <Table.Th>Falla</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Tiempo</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed" py="xl" size="sm">
                    No hay tickets registrados
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
