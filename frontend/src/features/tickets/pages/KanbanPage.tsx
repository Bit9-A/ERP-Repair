import { useState, useMemo } from "react";
import {
  Button,
  Group,
  Stack,
  LoadingOverlay,
  SegmentedControl,
  Badge,
  TextInput,
  Select,
  Tabs,
  Paper,
  Text,
  SimpleGrid,
  ThemeIcon,
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconLayoutKanban,
  IconList,
  IconSearch,
  IconFilter,
  IconSortAscending,
  IconArchive,
  IconDownload,
  IconTool,
  IconClockHour4,
  IconCircleCheck,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketListView } from "../components/TicketListView";
import { HistoryTable } from "../components/HistoryTable";
import { TicketForm } from "../components/TicketForm";
import { DeliveryModal } from "../components/DeliveryModal";
import { RepairClosureModal } from "../components/RepairClosureModal";
import { TICKET_STATUS } from "../../../lib/constants";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion, EstadoTicket } from "../../../types";
import {
  useRepairs,
  useCreateRepair,
  useUpdateRepair,
} from "../../../services";
import * as repairsService from "../../../services/repairs.service";
import { useAuthStore } from "../../auth/store/auth.store";
import { exportTicketsExcel } from "../../../services/excel/exportTicketsExcel";
import dayjs from "dayjs";

export function KanbanPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const [selectedTicket, setSelectedTicket] = useState<TicketReparacion | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<string>("kanban");

  // List Filters state
  const [filterEstado, setFilterEstado] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");
  const [isExporting, setIsExporting] = useState(false);

  // User details for Excel export
  const currentUser = useAuthStore((s) => s.user);

  const [deliveryTicket, setDeliveryTicket] = useState<TicketReparacion | null>(
    null,
  );
  const [deliveryOpened, { open: openDelivery, close: closeDelivery }] =
    useDisclosure(false);

  // WhatsApp / Closure Modal state
  const [closureTicket, setClosureTicket] = useState<TicketReparacion | null>(null);
  const [closureOpened, { open: openClosure, close: closeClosure }] = useDisclosure(false);

  // API hooks
  const { data: tickets = [], isLoading } = useRepairs();
  const createRepair = useCreateRepair();
  const updateRepair = useUpdateRepair();

  // Metrics summary
  const metrics = useMemo(() => {
    let enTaller = 0;
    let reparados = 0;
    let abandonoOAlerta = 0;

    tickets.forEach((t) => {
      const dias = dayjs().diff(dayjs(t.fecha_ingreso), "day");
      if (t.estado === "REPARADO") reparados++;
      else if (t.estado === "EN_REVISION" || t.estado === "ESPERANDO_REPUESTO") enTaller++;

      if (t.estado === "ABANDONO" || dias >= 60) {
        abandonoOAlerta++;
      }
    });

    return {
      total: tickets.length,
      enTaller,
      reparados,
      abandonoOAlerta,
    };
  }, [tickets]);

  let filteredTickets = tickets.filter(
    (t) =>
      t.equipo?.toLowerCase().includes(search.toLowerCase()) ||
      t.marca?.toLowerCase().includes(search.toLowerCase()) ||
      t.modelo?.toLowerCase().includes(search.toLowerCase()) ||
      t.cliente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      t.falla?.toLowerCase().includes(search.toLowerCase()) ||
      t.falla_reportada?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase()),
  );

  if (viewMode === "list") {
    if (filterEstado !== "ALL") {
      filteredTickets = filteredTickets.filter(
        (t) => t.estado === filterEstado,
      );
    }

    filteredTickets = [...filteredTickets].sort((a, b) => {
      if (sortBy === "NEWEST") {
        return (
          new Date(b.fecha_ingreso).getTime() -
          new Date(a.fecha_ingreso).getTime()
        );
      }
      if (sortBy === "OLDEST") {
        return (
          new Date(a.fecha_ingreso).getTime() -
          new Date(b.fecha_ingreso).getTime()
        );
      }
      if (sortBy === "PRICE_HIGH") {
        return (b.precio_total_usd || 0) - (a.precio_total_usd || 0);
      }
      if (sortBy === "PRICE_LOW") {
        return (a.precio_total_usd || 0) - (b.precio_total_usd || 0);
      }
      return 0;
    });
  }

  const handleNewTicket = async (values: TicketFormValues) => {
    try {
      if (selectedTicket) {
        await updateRepair.mutateAsync({ id: selectedTicket.id, ...values });
        notifications.show({
          title: "Ticket actualizado",
          message: "El ticket fue actualizado correctamente",
          color: "green",
        });
      } else {
        await createRepair.mutateAsync(values);
        notifications.show({
          title: "Ticket creado",
          message: "El ticket fue registrado correctamente",
          color: "green",
        });
      }
      closeForm();
      setSelectedTicket(null);
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo guardar el ticket",
        color: "red",
      });
    }
  };

  const handleEditTicket = (ticket: TicketReparacion) => {
    setSelectedTicket(ticket);
    openForm();
  };

  // Drag & drop → update ticket estado
  const handleMoveTicket = async (
    ticketId: string,
    newEstado: EstadoTicket,
  ) => {
    const ticket = tickets.find((t) => t.id === ticketId);

    // If moving to ENTREGADO, intercept and open payment modal
    if (newEstado === "ENTREGADO") {
      if (ticket) {
        setDeliveryTicket(ticket);
        openDelivery();
      }
      return;
    }

    // Interceptar también REPARADO para generar acta PDF
    if (newEstado === "REPARADO") {
      if (ticket) {
        setClosureTicket(ticket);
        openClosure();
      }
      return;
    }

    try {
      await updateRepair.mutateAsync({ id: ticketId, estado: newEstado });
      notifications.show({
        title: "Estado actualizado",
        message: `Orden de reparación movida a ${newEstado.replace(/_/g, " ")}`,
        color: "green",
        autoClose: 2000,
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo actualizar el estado",
        color: "red",
      });
    }
  };

  const handleConfirmClosure = async (ticketId: string, _: string[]) => {
    try {
      await updateRepair.mutateAsync({ id: ticketId, estado: "REPARADO" });
      notifications.show({
        title: "Equipo Reparado",
        message: "Se movió al Kanban como exitoso y generaste el acta digital.",
        color: "green",
      });
      closeClosure();
      setClosureTicket(null);
    } catch {
      notifications.show({
        title: "Error",
        message: "Error al actualizar estado.",
        color: "red",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const historyRes = await repairsService.getHistory(1, 9999, "");
      const allTicketsMap = new Map<string, TicketReparacion>();

      tickets.forEach((t) => allTicketsMap.set(t.id, t));
      historyRes.data.forEach((t) => allTicketsMap.set(t.id, t));

      const combinedTickets = Array.from(allTicketsMap.values());

      await exportTicketsExcel(combinedTickets, currentUser?.nombre);
      notifications.show({
        title: "Exportación exitosa",
        message: "El archivo de reparaciones ha sido generado con totales e historial",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "Hubo un problema al generar el archivo Excel",
        color: "red",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Stack gap="lg" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {/* ── Executive Header ── */}
      <Paper
        p="lg"
        radius="lg"
        withBorder
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-subtle)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <div>
            <Group gap="xs" align="center">
              <Text size="xl" fw={800} className="font-heading tracking-tight">
                Taller de Reparaciones
              </Text>
              <Badge variant="light" color="blue" size="md">
                {tickets.length} activas
              </Badge>
            </Group>
            <Text size="xs" c="dimmed" mt={2}>
              Flujo de servicio técnico, inspección de dispositivos, repuestos y liquidación
            </Text>
          </div>

          <Group gap="sm">
            <Button
              variant="default"
              size="sm"
              leftSection={<IconDownload size={15} />}
              loading={isExporting}
              onClick={handleExport}
            >
              Exportar
            </Button>

            <Button
              size="sm"
              color="blue"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setSelectedTicket(null);
                openForm();
              }}
              style={{
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
              }}
            >
              Nueva Orden
            </Button>
          </Group>
        </Group>

        {/* ── Stat Cards Grid ── */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="lg">
          {/* Total Activas */}
          <Paper
            p="md"
            radius="md"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={600} c="dimmed">
                  TOTAL ACTIVAS
                </Text>
                <Text size="xl" fw={800} className="font-heading">
                  {metrics.total}
                </Text>
              </Stack>
              <ThemeIcon size="md" radius="md" color="blue" variant="light">
                <IconTool size={18} />
              </ThemeIcon>
            </Group>
          </Paper>

          {/* En Taller */}
          <Paper
            p="md"
            radius="md"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={600} c="dimmed">
                  EN REVISIÓN / ESPERA
                </Text>
                <Text size="xl" fw={800} className="font-heading" c="blue">
                  {metrics.enTaller}
                </Text>
              </Stack>
              <ThemeIcon size="md" radius="md" color="blue" variant="light">
                <IconClockHour4 size={18} />
              </ThemeIcon>
            </Group>
          </Paper>

          {/* Listas para entrega */}
          <Paper
            p="md"
            radius="md"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={600} c="dimmed">
                  LISTAS PARA ENTREGA
                </Text>
                <Text size="xl" fw={800} className="font-heading" c="green">
                  {metrics.reparados}
                </Text>
              </Stack>
              <ThemeIcon size="md" radius="md" color="green" variant="light">
                <IconCircleCheck size={18} />
              </ThemeIcon>
            </Group>
          </Paper>

          {/* Abandono o Alerta (+60d) */}
          <Paper
            p="md"
            radius="md"
            style={{
              background: metrics.abandonoOAlerta > 0
                ? "rgba(239, 68, 68, 0.05)"
                : "var(--bg-elevated)",
              border: metrics.abandonoOAlerta > 0
                ? "1px solid rgba(239, 68, 68, 0.2)"
                : "1px solid var(--border-subtle)",
            }}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={600} c={metrics.abandonoOAlerta > 0 ? "red" : "dimmed"}>
                  EN RIESGO (+60 DÍAS)
                </Text>
                <Text
                  size="xl"
                  fw={800}
                  className="font-heading"
                  c={metrics.abandonoOAlerta > 0 ? "red" : "dimmed"}
                >
                  {metrics.abandonoOAlerta}
                </Text>
              </Stack>
              <ThemeIcon
                size="md"
                radius="md"
                color={metrics.abandonoOAlerta > 0 ? "red" : "gray"}
                variant="light"
              >
                <IconAlertTriangle size={18} />
              </ThemeIcon>
            </Group>
          </Paper>
        </SimpleGrid>
      </Paper>

      {/* ── Main Tabs: Activos vs Historial ── */}
      <Tabs defaultValue="activos" keepMounted={false} radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="activos"
            leftSection={<IconLayoutKanban size={16} />}
          >
            Tablero Operativo
          </Tabs.Tab>
          <Tabs.Tab value="historial" leftSection={<IconArchive size={16} />}>
            Historial de Entregados
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="activos">
          <Stack gap="md">
            {/* Filter and View mode toolbar */}
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Group gap="sm" style={{ flex: 1, minWidth: 260 }}>
                <TextInput
                  placeholder="Buscar por cliente, equipo, falla o #ID..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  w={{ base: "100%", sm: 320 }}
                  size="sm"
                />

                <SegmentedControl
                  value={viewMode}
                  onChange={setViewMode}
                  size="sm"
                  data={[
                    {
                      value: "kanban",
                      label: (
                        <Group gap={6} wrap="nowrap">
                          <IconLayoutKanban size={14} />
                          Tablero
                        </Group>
                      ),
                    },
                    {
                      value: "list",
                      label: (
                        <Group gap={6} wrap="nowrap">
                          <IconList size={14} />
                          Lista
                        </Group>
                      ),
                    },
                  ]}
                />
              </Group>

              {viewMode === "list" && (
                <Group gap="sm" wrap="wrap">
                  <Select
                    placeholder="Todos los Estados"
                    value={filterEstado}
                    onChange={(v) => setFilterEstado(v || "ALL")}
                    data={[
                      { value: "ALL", label: "Todos los Estados" },
                      ...Object.entries(TICKET_STATUS)
                        .filter(([key]) => key !== "ENTREGADO")
                        .map(([value, { label }]) => ({
                          value,
                          label,
                        })),
                    ]}
                    leftSection={<IconFilter size={14} />}
                    w={190}
                    size="sm"
                  />
                  <Select
                    value={sortBy}
                    onChange={(v) => setSortBy(v || "NEWEST")}
                    data={[
                      { value: "NEWEST", label: "Más recientes" },
                      { value: "OLDEST", label: "Más antiguos" },
                      { value: "PRICE_HIGH", label: "Mayor precio" },
                      { value: "PRICE_LOW", label: "Menor precio" },
                    ]}
                    leftSection={<IconSortAscending size={14} />}
                    w={170}
                    size="sm"
                  />
                </Group>
              )}
            </Group>

            {/* View Mode Component */}
            {viewMode === "kanban" ? (
              <KanbanBoard
                tickets={filteredTickets}
                onTicketClick={handleEditTicket}
                onMoveTicket={handleMoveTicket}
              />
            ) : (
              <TicketListView
                tickets={filteredTickets}
                onTicketClick={handleEditTicket}
                onMoveTicket={handleMoveTicket}
              />
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="historial">
          <HistoryTable onTicketClick={handleEditTicket} />
        </Tabs.Panel>
      </Tabs>

      {/* ── 5-Step Ticket Form Wizard Modal ── */}
      <TicketForm
        opened={formOpened}
        onClose={() => {
          closeForm();
          setSelectedTicket(null);
        }}
        initialData={selectedTicket}
        onSubmit={handleNewTicket}
      />

      {/* ── Modal de Cobro y Entrega al Cliente ── */}
      <DeliveryModal
        opened={deliveryOpened}
        onClose={() => {
          closeDelivery();
          setDeliveryTicket(null);
        }}
        ticket={deliveryTicket}
        onSuccess={() => {}}
      />

      {/* ── Modal de Acta Digital de Cierre ── */}
      <RepairClosureModal
        opened={closureOpened}
        onClose={() => {
          closeClosure();
          setClosureTicket(null);
        }}
        ticket={closureTicket}
        onConfirm={handleConfirmClosure}
      />
    </Stack>
  );
}
