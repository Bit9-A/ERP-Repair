import { useState, useMemo } from "react";
import {
  Button,
  Group,
  Stack,
  LoadingOverlay,
  SegmentedControl,
  TextInput,
  Select,
  Tabs,
  Text,
  SimpleGrid,
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
  IconUsers,
  IconUserPlus,
} from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketListView } from "../components/TicketListView";
import { HistoryTable } from "../components/HistoryTable";
import { TicketForm } from "../components/TicketForm";
import { DeliveryModal } from "../components/DeliveryModal";
import { RepairClosureModal } from "../components/RepairClosureModal";
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "../../../services/hooks/useClients";
import type { Cliente } from "../../../services/clients.service";
import { ClientTable } from "../../clients/components/ClientTable";
import { ClientForm, type ClientFormValues } from "../../clients/components/ClientForm";
import { ClientHistoryDrawer } from "../../clients/components/ClientHistoryDrawer";
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

  // Active Main Tab state (supports ?tab=clientes)
  const tabFromUrl = searchParams.get("tab") || "activos";
  const [activeMainTab, setActiveMainTab] = useState<string>(tabFromUrl);

  // Client Directory & Device History states
  const [clientSearch, setClientSearch] = useState("");
  const [clientModalOpened, { open: openClientModal, close: closeClientModal }] = useDisclosure(false);
  const [clientHistoryOpened, { open: openClientHistory, close: closeClientHistory }] = useDisclosure(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [historyClient, setHistoryClient] = useState<Cliente | null>(null);

  // API hooks
  const { data: tickets = [], isLoading } = useRepairs();
  const createRepair = useCreateRepair();
  const updateRepair = useUpdateRepair();

  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const lower = clientSearch.toLowerCase();

    // Match client IDs whose tickets match device brand, model, imei or fault
    const clientIdsMatchingDevice = new Set(
      tickets
        .filter(
          (t) =>
            t.marca?.toLowerCase().includes(lower) ||
            t.modelo?.toLowerCase().includes(lower) ||
            t.equipo?.toLowerCase().includes(lower) ||
            t.imei?.toLowerCase().includes(lower) ||
            t.falla?.toLowerCase().includes(lower),
        )
        .map((t) => t.clienteId)
        .filter(Boolean),
    );

    return clients.filter(
      (c) =>
        c.nombre.toLowerCase().includes(lower) ||
        c.cedula.toLowerCase().includes(lower) ||
        c.telefono.includes(lower) ||
        clientIdsMatchingDevice.has(c.id),
    );
  }, [clients, clientSearch, tickets]);

  const handleNewClient = () => {
    setEditingClient(null);
    openClientModal();
  };

  const handleEditClient = (client: Cliente) => {
    setEditingClient(client);
    openClientModal();
  };

  const handleDeleteClient = async (client: Cliente) => {
    try {
      await deleteClient.mutateAsync(client.id);
      notifications.show({
        title: "Cliente eliminado",
        message: `${client.nombre} ha sido eliminado.`,
        color: "red",
      });
    } catch (e: any) {
      notifications.show({
        title: "Error al eliminar",
        message: e.response?.data?.error || "Error desconocido",
        color: "red",
      });
    }
  };

  const handleSubmitClient = async (values: ClientFormValues) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          nombre: values.nombre,
          telefono: values.telefono,
          correo: values.correo,
        });
        notifications.show({
          title: "Cliente actualizado",
          message: "Los datos se guardaron correctamente.",
          color: "green",
        });
      } else {
        await createClient.mutateAsync({
          nombre: values.nombre,
          cedula: values.cedula,
          telefono: values.telefono,
          correo: values.correo,
        });
        notifications.show({
          title: "Cliente registrado",
          message: `${values.nombre} ha sido agregado.`,
          color: "green",
        });
      }
      closeClientModal();
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e.response?.data?.error || "Revisa los datos.",
        color: "red",
      });
    }
  };

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

      {/* ── Executive Header (70% Sirac + 30% Sigepat) ── */}
      <div className="relative overflow-hidden rounded-[24px] p-6 lg:p-7 bg-gradient-to-r from-[#0b1320] via-[#131f33] to-[#18263d] text-white shadow-xl border border-[#1e324f]">
        {/* SIGEPAT watermark decorative icon */}
        <IconTool className="absolute -right-6 -bottom-6 w-48 h-48 text-blue-400/[0.04] pointer-events-none rotate-12" />

        <Group justify="space-between" align="center" wrap="wrap" gap="md" className="relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30 uppercase tracking-widest font-sirac-title">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                MÓDULO DE OPERACIONES
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-sirac-title border border-white/5">
                {tickets.length} ACTIVAS
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold font-sirac-title text-white tracking-wide uppercase">
              Taller de Reparaciones
            </h1>
            <p className="text-xs text-slate-300/80 mt-0.5 font-sirac-sub">
              Flujo de servicio técnico, inspección de dispositivos, repuestos y liquidación
            </p>
          </div>

          <Group gap="sm">
            <Button
              variant="default"
              size="sm"
              leftSection={<IconDownload size={15} />}
              loading={isExporting}
              onClick={handleExport}
              className="bg-[#18263d]/80 hover:bg-[#18263d] text-white border-[#294163] rounded-xl text-xs font-semibold h-9 px-3.5 transition-all font-sirac-title tracking-wide"
            >
              Exportar
            </Button>

            <Button
              size="sm"
              leftSection={<IconPlus size={16} />}
              onClick={() => {
                setSelectedTicket(null);
                openForm();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 text-xs font-bold h-9 px-4 transition-all font-sirac-title tracking-wider uppercase"
            >
              Nueva Orden
            </Button>
          </Group>
        </Group>

        {/* ── Stat Cards Grid (70% Sirac / 30% Sigepat) ── */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mt="lg" className="relative z-10">
          {/* Total Activas */}
          <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                  TOTAL ACTIVAS
                </Text>
                <Text size="xl" fw={800} className="font-heading text-slate-900 dark:text-white text-2xl">
                  {metrics.total}
                </Text>
              </Stack>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <IconTool size={18} />
              </div>
            </Group>
          </div>

          {/* En Taller */}
          <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                  EN REVISIÓN / ESPERA
                </Text>
                <Text size="xl" fw={800} className="font-heading text-blue-600 dark:text-blue-400 text-2xl">
                  {metrics.enTaller}
                </Text>
              </Stack>
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <IconClockHour4 size={18} />
              </div>
            </Group>
          </div>

          {/* Listas para entrega */}
          <div className="rounded-2xl p-4 bg-white/95 dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs transition-all hover:border-blue-400/40">
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text size="xs" fw={700} className="font-sirac-title text-slate-500 dark:text-slate-400 text-[10.5px] uppercase tracking-[0.14em]">
                  LISTAS PARA ENTREGA
                </Text>
                <Text size="xl" fw={800} className="font-heading text-emerald-600 dark:text-emerald-400 text-2xl">
                  {metrics.reparados}
                </Text>
              </Stack>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <IconCircleCheck size={18} />
              </div>
            </Group>
          </div>

          {/* Abandono o Alerta (+60d) */}
          <div
            className={`rounded-2xl p-4 border shadow-xs transition-all ${
              metrics.abandonoOAlerta > 0
                ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50"
                : "bg-white/95 dark:bg-[#131f33] border-slate-200/90 dark:border-[#1e324f]"
            }`}
          >
            <Group justify="space-between" align="flex-start">
              <Stack gap={2}>
                <Text
                  size="xs"
                  fw={700}
                  className={`font-sirac-title text-[10.5px] uppercase tracking-[0.14em] ${
                    metrics.abandonoOAlerta > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  EN RIESGO (+60 DÍAS)
                </Text>
                <Text
                  size="xl"
                  fw={800}
                  className={`font-heading text-2xl ${
                    metrics.abandonoOAlerta > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  {metrics.abandonoOAlerta}
                </Text>
              </Stack>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  metrics.abandonoOAlerta > 0
                    ? "bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400"
                    : "bg-slate-100 dark:bg-[#18263d] border border-slate-200/60 dark:border-[#294163] text-slate-400"
                }`}
              >
                <IconAlertTriangle size={18} />
              </div>
            </Group>
          </div>
        </SimpleGrid>
      </div>

      {/* ── Main Tabs: Activos vs Historial vs Clientes/Equipos ── */}
      <Tabs value={activeMainTab} onChange={(v) => setActiveMainTab(v || "activos")} radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="activos"
            leftSection={<IconLayoutKanban size={16} />}
            className="font-sirac-title text-xs uppercase tracking-wider font-bold"
          >
            Tablero Operativo
          </Tabs.Tab>
          <Tabs.Tab
            value="historial"
            leftSection={<IconArchive size={16} />}
            className="font-sirac-title text-xs uppercase tracking-wider font-bold"
          >
            Historial de Entregados
          </Tabs.Tab>
          <Tabs.Tab
            value="clientes"
            leftSection={<IconUsers size={16} />}
            className="font-sirac-title text-xs uppercase tracking-wider font-bold"
          >
            Directorio &amp; Historial por Equipo / Cliente ({clients.length})
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

        <Tabs.Panel value="clientes">
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <TextInput
                placeholder="Buscar por cliente, teléfono, cédula, modelo de equipo o IMEI..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.currentTarget.value)}
                leftSection={<IconSearch size={16} />}
                w={{ base: "100%", sm: 420 }}
                size="sm"
                styles={{
                  input: {
                    borderRadius: "12px",
                  },
                }}
              />

              <Button
                size="sm"
                leftSection={<IconUserPlus size={16} />}
                onClick={handleNewClient}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md text-xs font-bold h-9 px-4 font-sirac-title tracking-wider uppercase"
              >
                Nuevo Cliente
              </Button>
            </Group>

            {isLoadingClients ? (
              <Group justify="center" p="xl">
                <LoadingOverlay visible />
              </Group>
            ) : (
              <div className="rounded-2xl border border-slate-200/90 dark:border-[#1e324f] bg-white dark:bg-[#131f33] overflow-hidden shadow-xs">
                <ClientTable
                  clients={filteredClients}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                  onViewHistory={(client) => {
                    setHistoryClient(client);
                    openClientHistory();
                  }}
                />
              </div>
            )}
          </Stack>
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

      {/* ── Modal de Registro / Edición de Cliente ── */}
      <ClientForm
        opened={clientModalOpened}
        onClose={closeClientModal}
        onSubmit={handleSubmitClient}
        initialData={editingClient}
      />

      {/* ── Drawer de Historial Técnico del Equipo / Cliente ── */}
      <ClientHistoryDrawer
        opened={clientHistoryOpened}
        onClose={closeClientHistory}
        cliente={historyClient}
      />
    </Stack>
  );
}
