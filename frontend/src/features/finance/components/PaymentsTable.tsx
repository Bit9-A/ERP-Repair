import { Badge, Paper, Table, Text, Group } from "@mantine/core";
import { PAYMENT_METHODS } from "../../../lib/constants";
import type { MetodoPago } from "../../../types";

interface PaymentRow {
  id: number;
  ticketId: string;
  cliente: string;
  monto_usd: number;
  moneda: string;
  monto_local: number;
  metodo: MetodoPago;
  fecha: string;
}

const PAYMENT_COLORS: Record<MetodoPago, string> = {
  EFECTIVO: "brand",
  TRANSFERENCIA: "blue",
  PUNTO_VENTA: "violet",
  PAGO_MOVIL: "cyan",
};

const DEMO_PAYMENTS: PaymentRow[] = [
  {
    id: 1,
    ticketId: "T-001",
    cliente: "María López",
    monto_usd: 50,
    moneda: "USD",
    monto_local: 50,
    metodo: "EFECTIVO",
    fecha: "20/02/2026",
  },
  {
    id: 2,
    ticketId: "T-002",
    cliente: "Juan Pérez",
    monto_usd: 32.5,
    moneda: "VES",
    monto_local: 1316.25,
    metodo: "PAGO_MOVIL",
    fecha: "19/02/2026",
  },
  {
    id: 3,
    ticketId: "T-006",
    cliente: "Ana Torres",
    monto_usd: 63,
    moneda: "USD",
    monto_local: 63,
    metodo: "TRANSFERENCIA",
    fecha: "18/02/2026",
  },
  {
    id: 4,
    ticketId: "T-007",
    cliente: "Carmen Rivas",
    monto_usd: 16,
    moneda: "COP",
    monto_local: 66400,
    metodo: "PUNTO_VENTA",
    fecha: "17/02/2026",
  },
  {
    id: 5,
    ticketId: "T-008",
    cliente: "Miguel Sánchez",
    monto_usd: 45,
    moneda: "USD",
    monto_local: 45,
    metodo: "EFECTIVO",
    fecha: "15/02/2026",
  },
];

export function PaymentsTable() {
  return (
    <Paper
      radius="lg"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        overflow: "hidden",
      }}
    >
      <Group justify="space-between" p="md" pb="sm">
        <Text size="sm" fw={600} c="gray.1">
          Pagos Recientes
        </Text>
      </Group>

      <Table
        highlightOnHover
        horizontalSpacing="md"
        verticalSpacing="sm"
        styles={{
          th: {
            color: "#94A3B8",
            fontSize: "12px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
          td: { borderColor: "rgba(255, 255, 255, 0.04)" },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>#Ticket</Table.Th>
            <Table.Th>Cliente</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Equiv. USD</Table.Th>
            <Table.Th>Moneda</Table.Th>
            <Table.Th style={{ textAlign: "right" }}>Monto Local</Table.Th>
            <Table.Th>Método</Table.Th>
            <Table.Th>Fecha</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {DEMO_PAYMENTS.map((pay) => (
            <Table.Tr key={pay.id}>
              <Table.Td>
                <Text ff="monospace" size="sm" fw={600} c="gray.1">
                  {pay.ticketId}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="gray.2">
                  {pay.cliente}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" fw={700} c="brand.6">
                  ${pay.monto_usd.toFixed(2)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="outline" size="xs" color="gray">
                  {pay.moneda}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" c="gray.3">
                  {pay.monto_local.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </Table.Td>
              <Table.Td>
                <Badge
                  variant="light"
                  size="sm"
                  color={PAYMENT_COLORS[pay.metodo]}
                >
                  {PAYMENT_METHODS[pay.metodo]}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed" ff="monospace">
                  {pay.fecha}
                </Text>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
