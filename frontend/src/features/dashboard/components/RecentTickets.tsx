import {
  Paper,
  Table,
  Text,
  Group,
  Avatar,
  LoadingOverlay,
  Stack,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import { TicketStatusBadge } from "../../../components/ui/StatusBadge";
import { useRepairs } from "../../../services";

export function RecentTickets() {
  const { data: repairs = [], isLoading } = useRepairs();

  // Show the 5 most recent tickets
  const recentTickets = [...repairs]
    .sort(
      (a, b) =>
        new Date(b.fecha_ingreso).getTime() -
        new Date(a.fecha_ingreso).getTime(),
    )
    .slice(0, 5);

  return (
    <Paper
      p="md"
      radius="lg"
      pos="relative"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <LoadingOverlay visible={isLoading} />

      <Text size="sm" fw={600} c="gray.1" mb="md">
        Tickets Recientes
      </Text>

      {recentTickets.length === 0 && !isLoading ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No hay tickets registrados
        </Text>
      ) : (
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
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Equipo</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Fecha</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recentTickets.map((ticket) => (
              <Table.Tr key={ticket.id}>
                <Table.Td>
                  <Group gap="xs">
                    <Avatar size="sm" radius="xl" color="dark.5">
                      <IconUser size={14} />
                    </Avatar>
                    <Text size="sm" c="gray.2">
                      {ticket.cliente?.nombre || "Sin cliente"}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="gray.3">
                    {ticket.marca} {ticket.modelo}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <TicketStatusBadge status={ticket.estado} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed" ff="monospace">
                    {new Date(ticket.fecha_ingreso).toLocaleDateString("es-VE")}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}
