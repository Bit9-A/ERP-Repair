import { Paper, Table, Text, Group, Avatar } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { TicketStatusBadge } from "../../../components/ui/StatusBadge";
import type { EstadoTicket } from "../../../types";

interface RecentTicket {
  id: string;
  cliente: string;
  equipo: string;
  estado: EstadoTicket;
  tecnico: string;
  fecha: string;
}

const DEMO_TICKETS: RecentTicket[] = [
  {
    id: "T-001",
    cliente: "María López",
    equipo: "Samsung Galaxy A54",
    estado: "EN_REVISION",
    tecnico: "Carlos",
    fecha: "20/02/2026",
  },
  {
    id: "T-002",
    cliente: "Juan Pérez",
    equipo: "iPhone 14",
    estado: "REPARADO",
    tecnico: "Ana",
    fecha: "19/02/2026",
  },
  {
    id: "T-003",
    cliente: "Rosa Martínez",
    equipo: "Xiaomi Redmi Note 12",
    estado: "ESPERANDO_REPUESTO",
    tecnico: "Carlos",
    fecha: "18/02/2026",
  },
  {
    id: "T-004",
    cliente: "Pedro García",
    equipo: "Motorola Moto G54",
    estado: "RECIBIDO",
    tecnico: "Ana",
    fecha: "18/02/2026",
  },
  {
    id: "T-005",
    cliente: "Luis Herrera",
    equipo: "Samsung Galaxy S23 Ultra",
    estado: "ENTREGADO",
    tecnico: "Carlos",
    fecha: "17/02/2026",
  },
];

export function RecentTickets() {
  return (
    <Paper
      p="md"
      radius="lg"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <Text size="sm" fw={600} c="gray.1" mb="md">
        Tickets Recientes
      </Text>

      <Table
        highlightOnHover
        horizontalSpacing="md"
        verticalSpacing="sm"
        styles={{
          tr: {
            transition: "background 200ms ease",
            cursor: "pointer",
          },
          th: {
            color: "#94A3B8",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontFamily: '"Fira Sans", sans-serif',
          },
          td: {
            borderColor: "rgba(255, 255, 255, 0.04)",
          },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#Ticket</Table.Th>
            <Table.Th>Cliente</Table.Th>
            <Table.Th>Equipo</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Técnico</Table.Th>
            <Table.Th>Fecha</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {DEMO_TICKETS.map((ticket) => (
            <Table.Tr key={ticket.id}>
              <Table.Td>
                <Text ff="monospace" size="sm" fw={600} c="gray.1">
                  {ticket.id}
                </Text>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Avatar size="sm" radius="xl" color="dark.5">
                    <IconUser size={14} />
                  </Avatar>
                  <Text size="sm" c="gray.2">
                    {ticket.cliente}
                  </Text>
                </Group>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="gray.3">
                  {ticket.equipo}
                </Text>
              </Table.Td>
              <Table.Td>
                <TicketStatusBadge status={ticket.estado} />
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="gray.3">
                  {ticket.tecnico}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed" ff="monospace">
                  {ticket.fecha}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
