import {
  Group,
  Text,
  Divider,
  Paper,
  Stack,
  NumberInput,
} from "@mantine/core";
import { IconCurrencyDollar } from "@tabler/icons-react";
import type { CartItem } from "./hooks/useSaleCart";

interface SummarySectionProps {
  cart: CartItem[];
  subtotal: number;
  descuento: number;
  setDescuento: (val: number) => void;
  total: number;
  editableRates: Record<string, number>;
  setEditableRates: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  getRate: (codigo: string) => number;
}

export function SummarySection({
  cart,
  subtotal,
  descuento,
  setDescuento,
  total,
  editableRates,
  setEditableRates,
  getRate,
}: SummarySectionProps) {
  if (cart.length === 0) return null;

  return (
    <>
      <Divider
        label={
          <Group gap={6}>
            <IconCurrencyDollar size={14} />
            <Text size="sm" fw={600}>
              Resumen
            </Text>
          </Group>
        }
        labelPosition="left"
      />
      <Paper
        p="md"
        radius="md"
        style={{
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(34,197,94,0.05))",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Subtotal ({cart.reduce((s, i) => s + i.cantidad, 0)} items)
            </Text>
            <Text size="sm" ff="monospace" fw={600}>
              ${subtotal.toFixed(2)}
            </Text>
          </Group>
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Descuento
            </Text>
            <NumberInput
              value={descuento}
              onChange={(v) => setDescuento(Number(v) || 0)}
              min={0}
              max={subtotal}
              decimalScale={2}
              fixedDecimalScale
              prefix="-$"
              size="xs"
              hideControls
              w={100}
              styles={{
                input: {
                  textAlign: "right",
                  fontFamily: "monospace",
                  color: "var(--mantine-color-red-6)",
                },
              }}
            />
          </Group>
          <Divider />
          <Group justify="space-between">
            <Text size="md" fw={700}>
              TOTAL
            </Text>
            <Text
              size="xl"
              fw={900}
              ff="monospace"
              style={{ color: "var(--primary)" }}
            >
              ${total.toFixed(2)}
            </Text>
          </Group>

          {/* Tasas editables */}
          <Divider variant="dashed" />
          <Text size="xs" fw={600} c="dimmed">
            Tasas de Cambio (editables)
          </Text>
          {Object.entries(editableRates).map(([codigo, tasa]) => (
            <Group key={codigo} justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                {codigo}/USD
              </Text>
              <Group gap="xs" align="center" wrap="nowrap">
                <NumberInput
                  value={tasa}
                  onChange={(v) =>
                    setEditableRates((prev) => ({
                      ...prev,
                      [codigo]: Number(v) || prev[codigo],
                    }))
                  }
                  min={0.01}
                  decimalScale={2}
                  fixedDecimalScale
                  size="xs"
                  hideControls
                  w={100}
                  styles={{
                    input: {
                      textAlign: "right",
                      fontFamily: "monospace",
                      fontWeight: 700,
                    },
                  }}
                />
                <Text size="xs" c="dimmed" w={28} ta="left">
                  {codigo}
                </Text>
              </Group>
            </Group>
          ))}
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              Total VES
            </Text>
            <Text size="xs" ff="monospace" fw={600} c="blue">
              Bs.{" "}
              {(total * getRate("VES")).toLocaleString("es-VE", {
                minimumFractionDigits: 2,
              })}
            </Text>
          </Group>
          {editableRates["COP"] && (
            <Group justify="space-between" align="center">
              <Text size="xs" c="dimmed">
                Total COP
              </Text>
              <Text size="xs" ff="monospace" fw={600} c="yellow">
                ${" "}
                {(total * getRate("COP")).toLocaleString("es-CO", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                COP
              </Text>
            </Group>
          )}
        </Stack>
      </Paper>
    </>
  );
}
