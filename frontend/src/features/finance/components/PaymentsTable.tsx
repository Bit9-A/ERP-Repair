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
          <Table.Thead className="bg-slate-50/70 dark:bg-[#18263d]/50">
            <Table.Tr>
              <Table.Th>Nro. Ref.</Table.Th>
              <Table.Th>Origen</Table.Th>
              <Table.Th>Cliente &amp; Concepto</Table.Th>
              <Table.Th>Método de Pago</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Monto Percibido ($)</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Moneda Local</Table.Th>
              <Table.Th>Fecha &amp; Hora</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pagos.map((pay) => (
              <Table.Tr key={pay.id} className="hover:bg-slate-50/80 dark:hover:bg-[#18263d]/50 transition-colors">
                {/* 1. Nro. Referencia */}
                <Table.Td>
                  <Text ff="monospace" size="xs" fw={700} className="text-blue-600 dark:text-blue-400">
                    {pay.venta?.numero
                      ? `V-${pay.venta.numero}`
                      : pay.ticket?.id
                        ? `T-${pay.ticket.id.substring(0, 6)}`
                        : "—"}
                  </Text>
                </Table.Td>

                {/* 2. Origen */}
                <Table.Td>
                  {pay.venta ? (
                    <Badge color="green" size="xs" variant="light" className="font-sirac-title uppercase tracking-wider text-[10px]">
                      Venta
                    </Badge>
                  ) : pay.ticket ? (
                    <Badge color="blue" size="xs" variant="light" className="font-sirac-title uppercase tracking-wider text-[10px]">
                      Taller
                    </Badge>
                  ) : (
                    <Badge color="gray" size="xs" variant="light" className="font-sirac-title uppercase tracking-wider text-[10px]">
                      Otro
                    </Badge>
                  )}
                </Table.Td>

                {/* 3. Cliente & Concepto */}
                <Table.Td>
                  <Stack gap={1}>
                    <Text size="xs" fw={700} className="font-sirac-title text-slate-800 dark:text-slate-100">
                      {pay.venta?.cliente?.nombre ??
                        pay.ticket?.cliente?.nombre ??
                        "Cliente Particular"}
                    </Text>
                    {pay.ticket && (
                      <Text size="10px" c="dimmed">
                        {pay.ticket.marca} {pay.ticket.modelo}
                      </Text>
                    )}
                    {pay.venta?.items && pay.venta.items.length > 0 && (
                      <Text size="10px" c="dimmed" truncate="end" maw={220}>
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

                {/* 4. Método de Pago */}
                <Table.Td>
                  <Badge
                    color={PAYMENT_COLORS[pay.metodo] || "gray"}
                    size="xs"
                    variant="filled"
                    className="font-sirac-title uppercase tracking-wider text-[10px]"
                  >
                    {pay.metodo.replace("_", " ")}
                  </Badge>
                </Table.Td>

                {/* 5. Monto Percibido ($) */}
                <Table.Td style={{ textAlign: "right" }}>
                  <Text ff="monospace" size="xs" fw={800} className="text-emerald-600 dark:text-emerald-400">
                    $ {pay.equivalente_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </Table.Td>

                {/* 6. Moneda Local */}
                <Table.Td style={{ textAlign: "right" }}>
                  <Group gap={4} justify="flex-end">
                    <Text ff="monospace" size="xs" fw={600} className="text-slate-700 dark:text-slate-300">
                      {pay.monto_moneda_local.toLocaleString("es-VE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                    <Badge variant="outline" size="xs" color="gray" className="text-[9px]">
                      {pay.moneda?.codigo || "BS"}
                    </Badge>
                  </Group>
                </Table.Td>

                {/* 7. Fecha & Hora */}
                <Table.Td>
                  <Text size="xs" c="dimmed" className="font-sirac-sub">
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
