import { Badge, Paper, Table, Text, Group } from "@mantine/core";
import { PAYMENT_METHODS } from "../../../lib/constants";
import { IconPackage, IconReportMoney } from "@tabler/icons-react";

interface PaymentRow {
  id: string;
  referencia: string;
  cliente: string;
  monto_usd: number;
  moneda: string;
  monto_local: number;
  metodo: string;
  fecha: string;
}

const PAYMENT_COLORS: Record<string, string> = {
  EFECTIVO: "brand",
  TRANSFERENCIA: "blue",
  PAGO_MOVIL: "cyan",
  ZELLE: "violet",
};

const DEMO_PAYMENTS: PaymentRow[] = [
  {
    id: "pay1",
    referencia: "T-001",
    cliente: "María López",
    monto_usd: 50,
    moneda: "USD",
    monto_local: 50,
    metodo: "EFECTIVO",
    fecha: "24/02/2026",
  },
  {
    id: "pay2",
    referencia: "T-002",
    cliente: "Juan Pérez",
    monto_usd: 32.5,
    moneda: "VES",
    monto_local: 1316.25,
    metodo: "PAGO_MOVIL",
    fecha: "24/02/2026",
  },
  {
    id: "pay3",
    referencia: "V-001",
    cliente: "Ana Torres",
    monto_usd: 63,
    moneda: "USD",
    monto_local: 63,
    metodo: "ZELLE",
    fecha: "23/02/2026",
  },
  {
    id: "pay4",
    referencia: "T-006",
    cliente: "Carmen Rivas",
    monto_usd: 16,
    moneda: "COP",
    monto_local: 66400,
    metodo: "TRANSFERENCIA",
    fecha: "22/02/2026",
  },
  {
    id: "pay5",
    referencia: "V-003",
    cliente: "Miguel Sánchez",
    monto_usd: 45,
    moneda: "USD",
    monto_local: 45,
    metodo: "EFECTIVO",
    fecha: "21/02/2026",
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
        <Group gap="xs"> {/* <-- Este Group crea el espacio */}
          <IconReportMoney size={18} color="#3B82F6" />
          <Text size="sm" fw={600} c="gray.1">
            Pagos Recientes
          </Text>
        </Group>
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
            <Table.Th>Ref.</Table.Th>
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
                  {pay.referencia}
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
                  color={PAYMENT_COLORS[pay.metodo] || "gray"}
                >
                  {(PAYMENT_METHODS as Record<string, string>)[pay.metodo] ||
                    pay.metodo}
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
