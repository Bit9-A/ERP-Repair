import {
  Group,
  Text,
  Divider,
  Paper,
  SimpleGrid,
  Stack,
  Button,
  TextInput,
} from "@mantine/core";
import { IconReceipt } from "@tabler/icons-react";
import type { Moneda, MetodoPago } from "../../../../types";
import { PAYMENT_METHODS } from "../../../../lib/constants";

interface PaymentSectionProps {
  monedas: Moneda[];
  selectedMonedaId: string;
  setSelectedMonedaId: (id: string) => void;
  selectedMetodo: MetodoPago;
  setSelectedMetodo: (metodo: MetodoPago) => void;
  referencia: string;
  setReferencia: (ref: string) => void;
  paymentRate: number;
  selectedMonedaObj?: Moneda;
}

export function PaymentSection({
  monedas,
  selectedMonedaId,
  setSelectedMonedaId,
  selectedMetodo,
  setSelectedMetodo,
  referencia,
  setReferencia,
  paymentRate,
  selectedMonedaObj,
}: PaymentSectionProps) {
  return (
    <>
      <Divider
        label={
          <Group gap={6}>
            <IconReceipt size={14} />
            <Text size="sm" fw={600}>
              Información del Pago
            </Text>
          </Group>
        }
        labelPosition="left"
      />

      <Paper
        p="md"
        radius="md"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          {/* Divisa */}
          <Stack gap={4}>
            <Text size="sm" fw={500} c="dimmed">
              Moneda de pago
            </Text>
            <Group gap="xs">
              {monedas.map((m) => (
                <Button
                  key={m.id}
                  variant={selectedMonedaId === m.id ? "filled" : "light"}
                  color={
                    m.codigo === "USD"
                      ? "brand"
                      : m.codigo === "VES"
                        ? "blue"
                        : "yellow"
                  }
                  size="sm"
                  onClick={() => setSelectedMonedaId(m.id)}
                  style={{ flex: 1 }}
                >
                  {m.codigo}
                </Button>
              ))}
            </Group>
            <Text size="xs" c="dimmed">
              Tasa usada:{" "}
              {selectedMonedaObj?.codigo === "USD"
                ? "Base"
                : selectedMonedaObj?.codigo === "VES"
                  ? `Bs. ${paymentRate.toFixed(2)}`
                  : `$${paymentRate.toFixed(2)}`}
            </Text>
          </Stack>

          {/* Metodo */}
          <Stack gap={4}>
            <Text size="sm" fw={500} c="dimmed">
              Método de Pago
            </Text>
            <Group gap="xs">
              {PAYMENT_METHODS.filter(
                (m: { value: string; label: string }) =>
                  selectedMonedaObj?.codigo !== "USD" ||
                  (m.value !== "PAGO_MOVIL" &&
                    m.value !== "TRANSFERENCIA" &&
                    m.value !== "PUNTO_DE_VENTA")
              ).map((method: { value: string; label: string }) => (
                <Button
                  key={method.value}
                  variant={selectedMetodo === method.value ? "filled" : "outline"}
                  color="gray"
                  size="xs"
                  onClick={() => setSelectedMetodo(method.value as MetodoPago)}
                >
                  {method.label}
                </Button>
              ))}
            </Group>
            {selectedMetodo !== "EFECTIVO" && (
              <TextInput
                placeholder="Referencia o recibo (Opcional)"
                size="xs"
                value={referencia}
                onChange={(e) => setReferencia(e.currentTarget.value)}
                mt="xs"
              />
            )}
          </Stack>
        </SimpleGrid>
      </Paper>
    </>
  );
}
