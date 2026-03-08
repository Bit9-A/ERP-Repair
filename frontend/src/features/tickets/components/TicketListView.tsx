import {
  Table,
  Group,
  Text,
  ActionIcon,
  Tooltip,
  Paper,
  ScrollArea,
  Menu,
  Stack,
  Card,
  Badge,
  Box,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconEye,
  IconClock,
  IconAlertTriangle,
  IconDeviceMobile,
  IconDotsVertical,
  IconArrowRight,
} from "@tabler/icons-react";
import { TICKET_STATUS, KANBAN_COLUMNS } from "../../../lib/constants";
import type { EstadoTicket, TicketReparacion } from "../../../types";
import dayjs from "dayjs";

interface TicketListViewProps {
  tickets: TicketReparacion[];
  onTicketClick?: (ticket: TicketReparacion) => void;
  onMoveTicket?: (ticketId: string, newEstado: EstadoTicket) => void;
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
  onMoveTicket,
}: TicketListViewProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const rows = tickets.map((ticket) => {
    const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), "day");
    const esAlerta = diasTranscurridos >= 60;
    const esCritico = diasTranscurridos >= 90;
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
          <Text size="sm" fw={600} ff="monospace" c="dimmed">
            #T-{ticket.id.substring(0, 6)}
          </Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500}>
            {ticket.cliente?.nombre || "Sin cliente"}
          </Text>
        </Table.Td>
        <Table.Td>
          <Group gap={6} wrap="nowrap">
            <IconDeviceMobile size={14} />
            <Text size="sm">
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
          {/* Menú de estado (ahora usamos un Menu nativo) */}
          <Menu
            shadow="md"
            width={200}
            position="bottom-start"
            withinPortal
            disabled={ticket.estado === "ENTREGADO"}
          >
            <Menu.Target>
              <Badge
                color={color}
                variant="filled"
                style={{
                  cursor:
                    ticket.estado === "ENTREGADO" ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {TICKET_STATUS[ticket.estado].label}
              </Badge>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Menu.Label>Mover Orden A:</Menu.Label>
              {KANBAN_COLUMNS.filter((col) => col !== ticket.estado).map(
                (col) => (
                  <Menu.Item
                    key={col}
                    leftSection={<IconArrowRight size={14} />}
                    onClick={() =>
                      onMoveTicket &&
                      onMoveTicket(ticket.id, col as EstadoTicket)
                    }
                  >
                    {TICKET_STATUS[col as EstadoTicket].label}
                  </Menu.Item>
                ),
              )}
            </Menu.Dropdown>
          </Menu>
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

  const renderMobileCards = () => {
    if (tickets.length === 0) {
      return (
        <Text ta="center" c="dimmed" py="xl" size="sm">
          No hay tickets registrados
        </Text>
      );
    }

    return (
      <Stack gap="sm">
        {tickets.map((ticket) => {
          const diasTranscurridos = dayjs().diff(
            dayjs(ticket.fecha_ingreso),
            "day",
          );
          const esAlerta = diasTranscurridos >= 60;
          const esCritico = diasTranscurridos >= 90;
          const colorEstado = STATUS_COLORS[ticket.estado] || "gray";

          return (
            <Card
              key={ticket.id}
              padding="md"
              radius="md"
              className="ticket-card-hover"
              onClick={() => onTicketClick?.(ticket)}
              style={{
                cursor: "pointer",
                background: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                borderLeft: `3px solid var(--mantine-color-${colorEstado}-filled)`,
                backgroundColor: esCritico
                  ? "rgba(239, 68, 68, 0.04)"
                  : undefined,
                boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
                transition: "all 0.2s ease",
              }}
            >
              <Group justify="space-between" mb="xs" align="flex-start">
                <Stack gap={2}>
                  <Text size="xs" fw={700} c="dimmed">
                    #T-{ticket.id.substring(0, 6)}
                  </Text>
                  {esAlerta && (
                    <Badge
                      color="red"
                      variant="light"
                      size="xs"
                      leftSection={<IconAlertTriangle size={10} />}
                    >
                      {esCritico ? "ABANDONO" : `${diasTranscurridos} DÍAS`}
                    </Badge>
                  )}
                </Stack>
                {onMoveTicket && (
                  <Menu
                    shadow="md"
                    width={200}
                    position="bottom-end"
                    withinPortal
                    disabled={ticket.estado === "ENTREGADO"}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconDotsVertical size={16} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                      <Menu.Label>Mover Orden A:</Menu.Label>
                      {KANBAN_COLUMNS.filter(
                        (col) => col !== ticket.estado,
                      ).map((col) => (
                        <Menu.Item
                          key={col}
                          leftSection={<IconArrowRight size={14} />}
                          onClick={() =>
                            onMoveTicket(ticket.id, col as EstadoTicket)
                          }
                        >
                          {TICKET_STATUS[col].label}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>

              <Stack gap={4} mb="sm">
                <Text size="sm" fw={700} lineClamp={1}>
                  {ticket.cliente?.nombre || "Sin cliente"}
                </Text>
                <Group gap={5}>
                  <IconDeviceMobile
                    size={14}
                    style={{ color: "var(--text-muted)" }}
                  />
                  <Text size="sm" fw={600} c="dimmed">
                    {ticket.marca} {ticket.modelo}
                  </Text>
                </Group>
                <Text size="xs" c="dimmed" lineClamp={2} mt={2}>
                  {ticket.falla}
                </Text>
              </Stack>

              <Group justify="space-between" mt="auto">
                <Badge color={colorEstado} variant="filled" size="sm">
                  {TICKET_STATUS[ticket.estado].label}
                </Badge>

                <Group gap="sm">
                  <Group gap={4}>
                    <IconClock
                      size={12}
                      style={{ color: "var(--mantine-color-dimmed)" }}
                    />
                    <Text size="xs" c="dimmed">
                      {dayjs(ticket.fecha_ingreso).format("DD/MMM")}
                    </Text>
                  </Group>
                  <Text size="sm" ff="monospace" fw={700} c="brand.4">
                    ${ticket.precio_total_usd?.toFixed(2) || "0.00"}
                  </Text>
                </Group>
              </Group>
            </Card>
          );
        })}
      </Stack>
    );
  };

  if (isMobile) {
    return <Box pb="xl">{renderMobileCards()}</Box>;
  }

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
