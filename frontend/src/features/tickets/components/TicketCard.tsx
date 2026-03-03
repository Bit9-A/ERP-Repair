import { Card, Text, Group, Badge, Stack, Paper } from "@mantine/core";
import {
  IconDeviceMobile,
  IconClock,
  IconAlertTriangle,
  IconLock,
  IconFingerprint,
} from "@tabler/icons-react";
import type { TicketReparacion } from "../../../types";
import dayjs from "dayjs";

interface TicketCardProps {
  ticket: TicketReparacion;
  onClick?: (ticket: TicketReparacion) => void;
}

const STATUS_COLORS: Record<string, string> = {
  RECIBIDO: "gray",
  EN_REVISION: "blue",
  ESPERANDO_REPUESTO: "orange",
  REPARADO: "green",
  ENTREGADO: "grape",
  ABANDONO: "red",
};

export function TicketCard({ ticket, onClick }: TicketCardProps) {
  const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), "day");
  const esAlerta = diasTranscurridos >= 60;
  const esCritico = diasTranscurridos >= 90;
  const colorEstado = STATUS_COLORS[ticket.estado] || "gray";

  return (
    <Card
      padding="md"
      radius="md"
      className="ticket-card-hover"
      onClick={() => onClick?.(ticket)}
      style={{
        cursor: "pointer",
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderLeft: `3px solid var(--mantine-color-${colorEstado}-filled)`,
        backgroundColor: esCritico ? "var(--mantine-color-red-0)" : undefined,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header: ID y Alerta de Tiempo */}
      <Group justify="space-between" mb="xs">
        <Text size="xs" fw={700} c="dimmed">
          #T-{ticket.id.substring(0, 6)}
        </Text>
        {esAlerta && (
          <Badge
            color="red"
            variant="light"
            size="xs"
            leftSection={<IconAlertTriangle size={10} />}
          >
            {esCritico ? "ABANDONO" : `${diasTranscurridos} DÍAS`}
          </Badge>
        )}
      </Group>

      {/* Equipo: Marca y Modelo */}
      <Stack gap={2} mb="xs">
        <Group gap={5}>
          <IconDeviceMobile size={14} />
          <Text size="sm" fw={700}>
            {ticket.marca} {ticket.modelo}
          </Text>
        </Group>
        <Text size="xs" c="dimmed">
          {ticket.tipo_equipo}
          {ticket.imei ? ` • IMEI: ${ticket.imei}` : ""}
        </Text>
      </Stack>

      {/* Seguridad: Clave y Patrón */}
      <Group gap="xs" mb="xs" grow>
        <Paper
          withBorder={false}
          p="4px 8px"
          radius="sm"
          style={{
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border-strong)",
          }}
        >
          <Group gap={6} wrap="nowrap">
            <IconLock size={14} style={{ color: "var(--text-muted)" }} />
            <Text
              size="sm"
              fw={900}
              style={{
                fontFamily: "monospace",
                letterSpacing: "1px",
                color: "var(--text-primary)",
              }}
            >
              {ticket.clave || "SIN PIN"}
            </Text>
          </Group>
        </Paper>

        <Paper
          withBorder={false}
          p="4px 8px"
          radius="sm"
          style={{
            background: "var(--bg-elevated)",
            border: "1px dashed var(--border-strong)",
          }}
        >
          <Group gap={6} wrap="nowrap">
            <IconFingerprint size={14} style={{ color: "var(--text-muted)" }} />
            <Text
              size="sm"
              fw={900}
              style={{
                fontFamily: "monospace",
                letterSpacing: "1px",
                color: "var(--text-primary)",
              }}
            >
              {ticket.patron_visual || "SIN PATRÓN"}
            </Text>
          </Group>
        </Paper>
      </Group>

      {/* Footer: Cliente y tiempo */}
      <Group justify="space-between" mt="sm">
        <Text size="xs" fw={500}>
          {ticket.cliente?.nombre || "Sin cliente"}
        </Text>
        <Group gap={4}>
          <IconClock
            size={12}
            style={{ color: "var(--mantine-color-dimmed)" }}
          />
          <Text size="xs" c="dimmed">
            {dayjs(ticket.fecha_ingreso).format("DD/MM")}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
