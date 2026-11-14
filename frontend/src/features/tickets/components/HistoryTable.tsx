import { useState, useEffect } from "react";
import {
  Table,
  Badge,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Pagination,
  Stack,
  TextInput,
  Paper,
  LoadingOverlay,
  Card,
  Box,
  Button,
} from "@mantine/core";
import { useDebouncedValue, useMediaQuery } from "@mantine/hooks";
import { IconSearch, IconEye } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRepairsHistory } from "../../../services";
import { TICKET_STATUS } from "../../../lib/constants";
import type { TicketReparacion } from "../../../types";

interface HistoryTableProps {
  onTicketClick: (ticket: TicketReparacion) => void;
}

export function HistoryTable({ onTicketClick }: HistoryTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useRepairsHistory(page, 50, debouncedSearch);

  const tickets = data?.data || [];
  const meta = data?.meta;

  return (
    <Stack gap="md" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <TextInput
        placeholder="Buscar por equipo, marca, modelo, o cliente..."
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        leftSection={<IconSearch size={16} />}
        w={{ base: "100%", md: 400 }}
      />

      {!isMobile ? (
        <Paper withBorder>
          <Table
            stickyHeader
            stickyHeaderOffset={60}
            striped
            highlightOnHover
            verticalSpacing="sm"
          >
            <Table.Thead className="bg-slate-50/80 dark:bg-[#18263d]/60">
              <Table.Tr>
                <Table.Th>Orden / ID</Table.Th>
                <Table.Th>Dispositivo &amp; Modelo</Table.Th>
                <Table.Th>Cliente &amp; Contacto</Table.Th>
                <Table.Th>Fecha Ingreso</Table.Th>
                <Table.Th>Fecha Entrega</Table.Th>
                <Table.Th>Estado Final</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Total Facturado</Table.Th>
                <Table.Th style={{ width: 80, textAlign: "center" }}>Acciones</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {tickets.map((ticket) => (
                <Table.Tr key={ticket.id} className="hover:bg-slate-50/80 dark:hover:bg-[#18263d]/50 transition-colors">
                  <Table.Td>
                    <Text size="xs" fw={700} ff="monospace" className="text-blue-600 dark:text-blue-400">
                      #T-{ticket.id.substring(0, 6)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" fw={700} className="font-sirac-title text-slate-900 dark:text-white">
                      {ticket.marca} {ticket.modelo}
                    </Text>
                    {ticket.imei && (
                      <Text size="10px" c="dimmed" ff="monospace">
                        IMEI: {ticket.imei}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" fw={600} className="text-slate-800 dark:text-slate-200">
                      {ticket.cliente?.nombre || "Sin cliente"}
                    </Text>
                    {ticket.cliente?.telefono && (
                      <Text size="10px" c="dimmed">
                        {ticket.cliente.telefono}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {dayjs(ticket.fecha_ingreso).format("DD/MM/YYYY")}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {ticket.fecha_entrega
                        ? dayjs(ticket.fecha_entrega).format("DD/MM/YYYY")
                        : "En laboratorio"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="gray" variant="light" size="xs" className="font-sirac-title tracking-wider uppercase text-[10px]">
                      {TICKET_STATUS[ticket.estado]?.label || ticket.estado}
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text size="xs" ff="monospace" fw={700} className="text-emerald-600 dark:text-emerald-400">
                      ${ticket.precio_total_usd?.toFixed(2) || "0.00"}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Tooltip label="Ver detalles / Imprimir">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        size="sm"
                        onClick={() => onTicketClick(ticket)}
                      >
                        <IconEye size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
              {tickets.length === 0 && !isLoading && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text c="dimmed" ta="center" py="xl">
                      No se encontraron tickets en el historial
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <Stack gap="sm">
          {tickets.map((ticket) => (
            <Card key={ticket.id} shadow="sm" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600} ff="monospace" c="dimmed">
                  #T-{ticket.id.substring(0, 6)}
                </Text>
                <Badge color="gray" variant="light">
                  {TICKET_STATUS[ticket.estado]?.label || ticket.estado}
                </Badge>
              </Group>

              <Text fw={500} size="md" mb={4}>
                {ticket.cliente?.nombre || "Sin cliente"}
              </Text>

              <Text size="sm" mb="md">
                {ticket.marca} {ticket.modelo}
              </Text>

              <Group justify="space-between" align="flex-end" wrap="nowrap">
                <Box>
                  <Text size="xs" c="dimmed" mb={2}>
                    Ingreso: {dayjs(ticket.fecha_ingreso).format("DD/MM/YYYY")}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Entrega:{" "}
                    {ticket.fecha_entrega
                      ? dayjs(ticket.fecha_entrega).format("DD/MM/YYYY")
                      : "-"}
                  </Text>
                </Box>

                <Button
                  variant="subtle"
                  color="brand"
                  size="xs"
                  leftSection={<IconEye size={14} />}
                  onClick={() => onTicketClick(ticket)}
                >
                  Detalles
                </Button>
              </Group>
            </Card>
          ))}
          {tickets.length === 0 && !isLoading && (
            <Text c="dimmed" ta="center" py="xl">
              No se encontraron tickets en el historial
            </Text>
          )}
        </Stack>
      )}

      {meta && meta.totalPages > 1 && (
        <Group justify="center" mt="md" pb="xl">
          <Pagination value={page} onChange={setPage} total={meta.totalPages} />
        </Group>
      )}
    </Stack>
  );
}
