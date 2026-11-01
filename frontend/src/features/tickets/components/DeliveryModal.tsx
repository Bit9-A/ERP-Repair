import { useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Button,
  Select,
  NumberInput,
  Text,
  Paper,
  TextInput,
  Box,
  ThemeIcon,
  ActionIcon,
  Badge,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconCheck,
  IconX,
  IconReceipt2,
  IconCash,
  IconCreditCard,
  IconBuildingBank,
  IconCurrencyDollar,
} from "@tabler/icons-react";
import { useEntregarTicket, useMonedas } from "../../../services";
import { notifications } from "@mantine/notifications";
import type { TicketReparacion } from "../../../types";

interface DeliveryModalProps {
  opened: boolean;
  onClose: () => void;
  ticket: TicketReparacion | null;
  onSuccess: () => void;
}

const METODOS_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  ZELLE: "Zelle",
  PAGO_MOVIL: "Pago Móvil",
  TRANSFERENCIA: "Transferencia Bancaria",
  PUNTO_DE_VENTA: "Punto de Venta",
  BINANCE: "Binance (USDT)",
};

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
  const metodosOptions = Object.entries(METODOS_LABELS).map(([key, label]) => ({
    value: key,
    label,
  }));

  const activeMonedaId = monedaId || (monedas.length > 0 ? monedas[0].id : "");
  const selectedMoneda = monedas.find((m) => m.id === activeMonedaId);
  const precioTotalUsd = ticket?.precio_total_usd || 0;

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
        title: "Entrega Completada",
        message: "El ticket fue marcado como entregado y el cobro registrado.",
        color: "green",
      });
      onSuccess();
      onClose();

      setMonedaId("");
      setMetodo("EFECTIVO");
      setReferencia("");
    } catch {
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
      withCloseButton={false}
      size="md"
      fullScreen={isMobile}
      radius={isMobile ? 0 : 28}
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 5,
      }}
      shadow="2xl"
      transitionProps={{ transition: "pop", duration: 250 }}
      styles={{
        content: {
          borderRadius: isMobile ? 0 : "28px",
          overflow: "hidden",
          border: "none",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.35)",
        },
        body: {
          padding: 0,
        },
      }}
    >
      {/* ── Signature Sigepat Hero Header (Emerald) ── */}
      <Box
        style={{
          background: "linear-gradient(135deg, #059669 0%, #064e3b 100%)",
          padding: isMobile ? "16px 20px" : "24px 28px",
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Giant Watermark Background Icon */}
        <Box
          style={{
            position: "absolute",
            top: -10,
            right: -10,
            opacity: 0.1,
            pointerEvents: "none",
            color: "white",
          }}
        >
          <IconCurrencyDollar size={120} strokeWidth={1.5} />
        </Box>

        <Group justify="space-between" align="flex-start" style={{ position: "relative", zIndex: 1 }}>
          <Group gap="sm" align="center">
            <ThemeIcon
              size={isMobile ? "md" : "xl"}
              radius="xl"
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(4px)",
              }}
            >
              <IconReceipt2 size={isMobile ? 18 : 22} strokeWidth={2.5} />
            </ThemeIcon>
            <div>
              <Group gap="xs" align="center">
                <Text
                  size={isMobile ? "md" : "xl"}
                  fw={900}
                  className="font-heading tracking-tight"
                  c="white"
                >
                  Cobro & Entrega de Orden
                </Text>
              </Group>
              <Text
                size="xs"
                style={{
                  color: "rgba(255, 255, 255, 0.8)",
                  marginTop: 2,
                  fontWeight: 500,
                }}
              >
                Orden #T-{ticket.id.substring(0, 6)} • {ticket.cliente?.nombre || "Cliente"}
              </Text>
            </div>
          </Group>

          {/* Floating Glass Close Button */}
          <ActionIcon
            variant="subtle"
            radius="xl"
            size="md"
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              color: "white",
              backdropFilter: "blur(4px)",
            }}
          >
            <IconX size={16} strokeWidth={2.5} />
          </ActionIcon>
        </Group>
      </Box>

      {/* ── Modal Body ── */}
      <Stack gap="lg" p={isMobile ? "md" : "xl"}>
        {/* Total a Pagar Card */}
        <Paper
          p="md"
          radius="lg"
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.25)",
          }}
        >
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon size="md" radius="md" color="green" variant="light">
                <IconCash size={18} strokeWidth={2.5} />
              </ThemeIcon>
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  TOTAL A LIQUIDAR
                </Text>
                <Text size="sm" fw={600}>
                  {ticket.marca} {ticket.modelo}
                </Text>
              </div>
            </Group>

            <Stack gap={0} align="flex-end">
              <Text size="26px" fw={900} className="font-heading" c="green">
                ${precioTotalUsd.toFixed(2)}
              </Text>
              {selectedMoneda && selectedMoneda.codigo !== "USD" && (
                <Badge variant="light" color="green" size="sm">
                  {selectedMoneda.codigo} ${montoLocalConvertido.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
                </Badge>
              )}
            </Stack>
          </Group>
        </Paper>

        {/* Método y Moneda de Pago */}
        <Paper
          p="md"
          radius="lg"
          withBorder
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <Stack gap="md">
            <Text size="xs" fw={800} tt="uppercase" c="dimmed" lts={1} className="font-heading">
              Forma de Pago del Cliente
            </Text>

            <Group grow align="flex-start">
              <Select
                label="Moneda"
                data={monedaOptions}
                value={activeMonedaId}
                onChange={(v) => setMonedaId(v || activeMonedaId)}
                required
                allowDeselect={false}
                leftSection={<IconCreditCard size={16} />}
              />
              <Select
                label="Método de Pago"
                data={metodosOptions}
                value={metodo}
                onChange={(v) => {
                  setMetodo(v || "EFECTIVO");
                  if (v === "EFECTIVO") setReferencia("");
                }}
                required
                allowDeselect={false}
                leftSection={<IconBuildingBank size={16} />}
              />
            </Group>

            <NumberInput
              label={`Monto en Moneda (${selectedMoneda?.codigo || "USD"})`}
              value={Number(montoLocalConvertido.toFixed(2))}
              decimalScale={2}
              thousandSeparator="."
              decimalSeparator=","
              prefix="$ "
              disabled
              readOnly
              styles={{
                input: {
                  fontWeight: 700,
                  fontFamily: "var(--font-heading)",
                  fontSize: "16px",
                },
              }}
            />

            {metodo !== "EFECTIVO" && (
              <TextInput
                label="Referencia / N° de Comprobante"
                placeholder="Ej: 849201"
                value={referencia}
                onChange={(e) => setReferencia(e.currentTarget.value)}
                required
                description="Número de transferencia, comprobante o captura"
              />
            )}
          </Stack>
        </Paper>

        {/* Footer Actions */}
        <Group justify="space-between" align="center" pt="xs">
          <Button
            variant="subtle"
            color="gray"
            radius="xl"
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            color="green"
            radius="xl"
            size="md"
            onClick={handleSubmit}
            loading={entregarMutation.isPending}
            leftSection={<IconCheck size={18} strokeWidth={2.5} />}
            style={{
              boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
            }}
          >
            Confirmar Entrega y Pago
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
