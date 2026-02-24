import { Card, Text, Group, Badge, Stack, Paper } from "@mantine/core";
import { IconDeviceMobile, IconClock, IconAlertTriangle, IconLock, IconFingerprint } from "@tabler/icons-react";
import type { TicketReparacion } from "../types/tickets.types";
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
  const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), 'day');
  const esAlerta = diasTranscurridos >= 60;
  const esCritico = diasTranscurridos >= 90;
  const colorEstado = STATUS_COLORS[ticket.estado] || "gray";

  return (
    <Card
      padding="sm"
      radius="md"
      withBorder
      onClick={() => onClick?.(ticket)}
      style={{
        cursor: "pointer",
        borderLeft: `4px solid var(--mantine-color-${colorEstado}-filled)`,
        backgroundColor: esCritico ? "var(--mantine-color-red-0)" : undefined,
      }}
    >
      {/* Header: ID y Alerta de Tiempo */}
      <Group justify="space-between" mb="xs">
        <Text size="xs" fw={700} c="dimmed">#T-{ticket.id}</Text>
        {esAlerta && (
          <Badge color="red" variant="light" size="xs" leftSection={<IconAlertTriangle size={10} />}>
            {esCritico ? "ABANDONO" : `${diasTranscurridos} DÍAS`}
          </Badge>
        )}
      </Group>

      {/* Equipo: Marca y Modelo */}
      <Stack gap={2} mb="xs">
        <Group gap={5}>
          <IconDeviceMobile size={14} />
          <Text size="sm" fw={700}>{ticket.equipo.marca} {ticket.equipo.modelo}</Text>
        </Group>
        <Text size="xs" c="dimmed">{ticket.equipo.tipo} • IMEI: {ticket.equipo.imei}</Text>
      </Stack>

      {/* TAREA 1: SEGURIDAD MEJORADA (LETRAS GRANDES Y CLARAS) */}
      <Group gap="xs" mb="xs" grow>
        <Paper withBorder p="4px 8px" radius="sm" bg="gray.0" style={{ borderStyle: 'dashed' }}>
          <Group gap={6} wrap="nowrap">
            <IconLock size={14} color="var(--mantine-color-gray-6)" />
            <Text
              size="sm"
              fw={900}
              style={{
                fontFamily: 'monospace',
                letterSpacing: '1px',
                color: 'var(--mantine-color-dark-7)'
              }}
            >
              {ticket.equipo.clave || "SIN PIN"}
            </Text>
          </Group>
        </Paper>

        <Paper withBorder p="4px 8px" radius="sm" bg="gray.0" style={{ borderStyle: 'dashed' }}>
          <Group gap={6} wrap="nowrap">
            <IconFingerprint size={14} color="var(--mantine-color-gray-6)" />
            <Text
              size="sm"
              fw={900}
              style={{
                fontFamily: 'monospace',
                letterSpacing: '1px',
                color: 'var(--mantine-color-dark-7)'
              }}
            >
              {ticket.equipo.patron || "SIN PATRÓN"}
            </Text>
          </Group>
        </Paper>
      </Group>

      {/* Footer: Cliente y tiempo */}
      <Group justify="space-between" mt="sm">
        <Text size="xs" fw={500}>{ticket.cliente.nombre}</Text>
        <Group gap={4}>
          <IconClock size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text size="xs" c="dimmed">
            {dayjs(ticket.fecha_ingreso).format('DD/MM')}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}