import {
  Card,
  Text,
  Group,
  Badge,
  Stack,
  Menu,
  ActionIcon,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceLaptop,
  IconDeviceTv,
  IconDeviceGamepad2,
  IconDeviceDesktop,
  IconDeviceWatch,
  IconDevices,
  IconClock,
  IconAlertTriangle,
  IconLock,
  IconFingerprint,
  IconDotsVertical,
  IconArrowRight,
  IconUser,
  IconFlame,
} from "@tabler/icons-react";
import type { TicketReparacion, EstadoTicket } from "../../../types";
import { KANBAN_COLUMNS, TICKET_STATUS } from "../../../lib/constants";
import dayjs from "dayjs";

interface TicketCardProps {
  ticket: TicketReparacion;
  onClick?: (ticket: TicketReparacion) => void;
  onMoveTicket?: (newEstado: EstadoTicket) => void;
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  RECIBIDO: "#64748b",
  EN_REVISION: "#3b82f6",
  ESPERANDO_REPUESTO: "#f59e0b",
  REPARADO: "#10b981",
  ENTREGADO: "#8b5cf6",
  ABANDONO: "#f43f5e",
};

function getDeviceIcon(tipo?: string) {
  const t = tipo?.toLowerCase() || "";
  if (t.includes("tablet") || t.includes("ipad")) return IconDeviceTablet;
  if (t.includes("laptop") || t.includes("notebook")) return IconDeviceLaptop;
  if (t.includes("tv") || t.includes("televisor") || t.includes("monitor")) return IconDeviceTv;
  if (t.includes("consola") || t.includes("playstation") || t.includes("xbox") || t.includes("nintendo")) return IconDeviceGamepad2;
  if (t.includes("pc") || t.includes("escritorio") || t.includes("computador")) return IconDeviceDesktop;
  if (t.includes("watch") || t.includes("reloj")) return IconDeviceWatch;
  if (t.includes("smartphone") || t.includes("celular") || t.includes("telefono")) return IconDeviceMobile;
  return IconDevices;
}

export function TicketCard({ ticket, onClick, onMoveTicket }: TicketCardProps) {
  const diasTranscurridos = dayjs().diff(dayjs(ticket.fecha_ingreso), "day");
  const esAlerta = diasTranscurridos >= 60;
  const esCritico = diasTranscurridos >= 90;
  const colorEstado = STATUS_BORDER_COLORS[ticket.estado] || "#64748b";
  const DeviceIcon = getDeviceIcon(ticket.tipo_equipo);

  const clientName = ticket.cliente?.nombre || "Sin cliente";
  const initial = clientName.charAt(0).toUpperCase();

  return (
    <Card
      padding="sm"
      radius="md"
      onClick={() => onClick?.(ticket)}
      style={{
        cursor: "pointer",
        background: esCritico
          ? "rgba(239, 68, 68, 0.05)"
          : "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderLeft: `4px solid ${colorEstado}`,
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className="ticket-card-hover group hover:shadow-md hover:-translate-y-0.5"
    >
      <Stack gap="xs">
        {/* ── Top Bar: ID, Urgency & Context Menu ── */}
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <Text
              size="xs"
              fw={700}
              className="font-mono text-xs"
              c="dimmed"
            >
              #T-{ticket.id.substring(0, 6)}
            </Text>

            {esCritico ? (
              <Badge
                color="red"
                variant="filled"
                size="xs"
                leftSection={<IconFlame size={11} />}
              >
                ABANDONO ({diasTranscurridos}d)
              </Badge>
            ) : esAlerta ? (
              <Badge
                color="orange"
                variant="light"
                size="xs"
                leftSection={<IconAlertTriangle size={11} />}
              >
                {diasTranscurridos} DÍAS
              </Badge>
            ) : null}
          </Group>

          <Group gap={4} wrap="nowrap">
            {ticket.precio_total_usd > 0 && (
              <Badge variant="light" color="blue" size="xs" className="font-heading font-bold">
                ${ticket.precio_total_usd.toFixed(2)}
              </Badge>
            )}

            {onMoveTicket && (
              <Menu shadow="md" width={210} position="bottom-end" withinPortal>
                <Menu.Target>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Mover estado"
                  >
                    <IconDotsVertical size={14} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
                  <Menu.Label>Mover a Estado:</Menu.Label>
                  {KANBAN_COLUMNS.filter((col) => col !== ticket.estado).map(
                    (col) => (
                      <Menu.Item
                        key={col}
                        leftSection={<IconArrowRight size={14} />}
                        onClick={() => onMoveTicket(col)}
                      >
                        {TICKET_STATUS[col].label}
                      </Menu.Item>
                    ),
                  )}
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>

        {/* ── Equipment info ── */}
        <div>
          <Group gap={6} align="center" wrap="nowrap">
            <ThemeIcon size="sm" radius="sm" color="blue" variant="light">
              <DeviceIcon size={13} />
            </ThemeIcon>
            <Text size="sm" fw={700} className="font-heading" lineClamp={1}>
              {ticket.marca} {ticket.modelo}
            </Text>
          </Group>

          {ticket.tipo_equipo && (
            <Text size="xs" c="dimmed" mt={1}>
              {ticket.tipo_equipo}
              {ticket.imei ? ` • ${ticket.imei}` : ""}
            </Text>
          )}
        </div>

        {/* ── Falla reportada (resumen) ── */}
        {ticket.falla && (
          <Text
            size="xs"
            c="dimmed"
            lineClamp={2}
            style={{
              lineHeight: 1.35,
              background: "var(--bg-elevated)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            {ticket.falla}
          </Text>
        )}

        {/* ── Security badges (PIN / Pattern) ── */}
        {(ticket.clave || ticket.patron_visual) && (
          <Group gap={6} wrap="nowrap">
            {ticket.clave && (
              <Box
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-strong)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                }}
              >
                <IconLock size={11} style={{ color: "var(--text-muted)" }} />
                <Text size="xs" fw={700} className="font-mono text-[11px]">
                  {ticket.clave}
                </Text>
              </Box>
            )}

            {ticket.patron_visual && (
              <Box
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "var(--bg-elevated)",
                  border: "1px dashed var(--border-strong)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                }}
              >
                <IconFingerprint size={11} style={{ color: "var(--text-muted)" }} />
                <Text size="xs" fw={700} className="font-mono text-[11px]">
                  {ticket.patron_visual}
                </Text>
              </Box>
            )}
          </Group>
        )}

        {/* ── Footer: Cliente & Tiempo ── */}
        <Group
          justify="space-between"
          align="center"
          pt={4}
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <Group gap={5} wrap="nowrap">
            <Box
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(59, 130, 246, 0.15)",
                color: "var(--mantine-color-blue-6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {initial || <IconUser size={10} />}
            </Box>
            <Text size="xs" fw={600} lineClamp={1} maw={140}>
              {clientName}
            </Text>
          </Group>

          <Group gap={3} wrap="nowrap">
            <IconClock size={11} style={{ color: "var(--text-muted)" }} />
            <Text size="xs" c="dimmed" className="text-[11px]">
              {dayjs(ticket.fecha_ingreso).format("DD/MM")}
            </Text>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}
