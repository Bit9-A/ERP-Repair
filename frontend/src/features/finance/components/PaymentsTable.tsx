import {
  Badge,
  Paper,
  Table,
  Text,
  Group,
  Stack,
  LoadingOverlay,
  Title,
} from "@mantine/core";
import { usePagos } from "../../../services";
import { IconReportMoney, IconReceiptOff } from "@tabler/icons-react";

const PAYMENT_COLORS: Record<string, string> = {
  EFECTIVO: "brand",
  TRANSFERENCIA: "blue",
  PAGO_MOVIL: "cyan",
  ZELLE: "violet",
};

interface PaymentsTableProps {
  periodo?: "dia" | "semana" | "mes";
}

export function PaymentsTable({ periodo }: PaymentsTableProps) {
  const { data: pagos = [], isLoading } = usePagos(periodo);

  return (
    <Paper
      radius="lg"
      pos="relative"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
        minHeight: 200,
      }}
    >
      <LoadingOverlay visible={isLoading} />
      <Group justify="space-between" p="md" pb="sm">
        <Group gap="xs">
          <IconReportMoney size={18} color="#3B82F6" />
          <Text size="sm" fw={700}>
            Pagos Recientes
          </Text>
        </Group>
      </Group>

      {pagos.length === 0 && !isLoading ? (
        <Group justify="center" p="xl" style={{ opacity: 0.5 }}>
          <IconReceiptOff size={32} />
          <Title order={5}>No hay pagos registrados hoy</Title>
        </Group>
      ) : (
        <Table
          highlightOnHover
          striped
          horizontalSpacing="md"
          verticalSpacing="sm"
          styles={{
            th: {
              color: "var(--text-primary)",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            td: {
              borderColor: "var(--border-subtle)",
              paddingTop: "14px",
              paddingBottom: "14px",
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Ref.</Table.Th>
              <Table.Th>Origen</Table.Th>
              <Table.Th>Cliente</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Equiv. USD</Table.Th>
              <Table.Th>Moneda</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Monto Local</Table.Th>
              <Table.Th>Método</Table.Th>
              <Table.Th>Fecha</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pagos.map((pay) => (
              <Table.Tr key={pay.id}>
                <Table.Td>
                  <Text ff="monospace" size="sm" fw={600}>
                    {pay.venta?.numero
                      ? `V-${pay.venta.numero}`
                      : pay.ticket?.id
                        ? `T-${pay.ticket.id.substring(0, 6)}`
                        : "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {pay.venta ? (
                    <Badge color="green" size="xs" variant="light">
                      Venta
                    </Badge>
                  ) : pay.ticket ? (
                    <Badge color="blue" size="xs" variant="light">
                      Reparación
                    </Badge>
                  ) : (
                    <Badge color="gray" size="xs" variant="light">
                      Otro
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm" fw={500}>
                      {pay.venta?.cliente?.nombre ??
                        pay.ticket?.cliente?.nombre ??
                        "Sin Cliente"}
                    </Text>
                    {pay.ticket && (
                      <Text size="xs" c="dimmed">
                        {pay.ticket.marca} {pay.ticket.modelo}
                      </Text>
                    )}
                    {pay.venta?.items && pay.venta.items.length > 0 && (
                      <Text size="xs" c="dimmed" truncate="end" maw={200}>
                        {pay.venta.items
                          .map(
                            (it) =>
                              `${it.producto.nombre}${it.producto.marca_comp ? ` [${it.producto.marca_comp}]` : ""}`,
                          )
                          .join(", ")}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <Text ff="monospace" size="sm" fw={800} c="brand.6">
                    ${pay.equivalente_usd.toFixed(2)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="filled" size="xs" color="gray">
                    {pay.moneda?.codigo || "—"}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <Text ff="monospace" size="sm" fw={600}>
                    {pay.monto_moneda_local.toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={PAYMENT_COLORS[pay.metodo] || "gray"}
                    size="xs"
                    variant="filled"
                  >
                    {pay.metodo.replace("_", " ")}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" fw={500}>
                    {new Date(pay.fecha_pago).toLocaleString("es-VE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
