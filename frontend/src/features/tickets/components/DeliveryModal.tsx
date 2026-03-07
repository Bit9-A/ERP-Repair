import { useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Button,
  Select,
  NumberInput,
  Text,
  Divider,
  Paper,
  TextInput,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useEntregarTicket, useMonedas } from "../../../services";
import { notifications } from "@mantine/notifications";
import type { TicketReparacion } from "../../../types";

interface DeliveryModalProps {
  opened: boolean;
  onClose: () => void;
  ticket: TicketReparacion | null;
  onSuccess: () => void;
}

export function DeliveryModal({
  opened,
  onClose,
  ticket,
  onSuccess,
}: DeliveryModalProps) {
  const { data: monedas = [] } = useMonedas();
  const entregarMutation = useEntregarTicket();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [monedaId, setMonedaId] = useState<string>("");
  const [metodo, setMetodo] = useState<string>("EFECTIVO");
  const [referencia, setReferencia] = useState<string>("");

  const monedaOptions = monedas.map((m) => ({ value: m.id, label: m.codigo }));
  const METODOS = [
    "EFECTIVO",
    "ZELLE",
    "PAGO_MOVIL",
    "TRANSFERENCIA",
    "PUNTO_DE_VENTA",
    "BINANCE",
  ];

  const activeMonedaId = monedaId || (monedas.length > 0 ? monedas[0].id : "");
  const selectedMoneda = monedas.find((m) => m.id === activeMonedaId);
  const precioTotalUsd = ticket?.precio_total_usd || 0;

  // Calculate exact requested amount
  const montoLocalConvertido =
    precioTotalUsd * (selectedMoneda?.tasa_cambio || 1);

  const handleSubmit = async () => {
    if (!ticket || !activeMonedaId) return;

    try {
      await entregarMutation.mutateAsync({
        id: ticket.id,
        pagos: [
          {
            monedaId: activeMonedaId,
            monto_moneda_local: montoLocalConvertido,
            metodo,
            referencia,
          },
        ],
      });
      notifications.show({
        title: "Éxito",
        message: "Ticket entregado y pago registrado.",
        color: "green",
      });
      onSuccess();
      onClose();

      // Reset state for next open
      setMonedaId("");
      setMetodo("EFECTIVO");
      setReferencia("");
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "No se pudo procesar la entrega.",
        color: "red",
      });
    }
  };

  if (!ticket) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Entregar Ticket #T-${ticket.id.substring(0, 6)}`}
      size="lg"
      fullScreen={isMobile}
      radius={isMobile ? 0 : "md"}
    >
      <Stack gap="md">
        <Paper withBorder p="md" bg="blue.0">
          <Group justify="space-between">
            <Text fw={700} size="lg">
              Total a Pagar:
            </Text>
            <Text fw={700} size="xl" c="blue">
              ${precioTotalUsd.toFixed(2)}
            </Text>
          </Group>
        </Paper>

        <Divider label="Detalle de Pago Único" labelPosition="center" />

        <Group align="flex-end" grow>
          <Select
            label="Moneda"
            data={monedaOptions}
            value={activeMonedaId}
            onChange={(v) => setMonedaId(v || activeMonedaId)}
            required
            allowDeselect={false}
          />
          <NumberInput
            label="Monto Equivalente"
            value={Number(montoLocalConvertido.toFixed(2))}
            disabled
            readOnly
          />
          <Select
            label="Método de Pago"
            data={METODOS}
            value={metodo}
            onChange={(v) => {
              setMetodo(v || "EFECTIVO");
              if (v === "EFECTIVO") setReferencia("");
            }}
            required
            allowDeselect={false}
          />
        </Group>

        {metodo !== "EFECTIVO" && (
          <TextInput
            label="Referencia / N° Comprobante"
            placeholder="Ej: 12345678"
            value={referencia}
            onChange={(e) => setReferencia(e.currentTarget.value)}
            required
          />
        )}

        <Group justify="flex-end" mt="xl">
          <Button variant="subtle" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            color="green"
            onClick={handleSubmit}
            loading={entregarMutation.isPending}
          >
            Confirmar Entrega y Pago
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
