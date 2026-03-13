import { useState } from "react";
import {
  Button,
  Group,
  Stack,
  Title,
  LoadingOverlay,
  SegmentedControl,
  Badge,
  TextInput,
  Select,
  Tabs,
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

export function KanbanPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const [selectedTicket, setSelectedTicket] = useState<TicketReparacion | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<string>("kanban");

  // -- List Filters state --
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

  // -- WhatsApp / Closure Modal state --
  const [closureTicket, setClosureTicket] = useState<TicketReparacion | null>(null);
  const [closureOpened, { open: openClosure, close: closeClosure }] = useDisclosure(false);

  // -- API hooks --
  const { data: tickets = [], isLoading } = useRepairs();
  const createRepair = useCreateRepair();
  const updateRepair = useUpdateRepair();

  let filteredTickets = tickets.filter(
    (t) =>
      t.equipo?.toLowerCase().includes(search.toLowerCase()) ||
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

  // Callback exitoso del PDF Cierre Modal
  const handleConfirmClosure = async (ticketId: string, _: string[]) => {
    try {
      await updateRepair.mutateAsync({ id: ticketId, estado: "REPARADO" });
      notifications.show({
        title: "Equipo Reparado",
        message: "Se movió al Kanban como exitoso y generaste el acta digital.",
        color: "green",
      });
      // Importante cerrar modal
      closeClosure();
      setClosureTicket(null);
    } catch (e) {
      notifications.show({title: "Error", message: "Error configurando estado.", color: "red"});
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get all history (paginated theoretically, but 9999 ensures almost all for export)
      // and combine with active tickets so nothing is missed.
      const historyRes = await repairsService.getHistory(1, 9999, "");
      const allTicketsMap = new Map<string, TicketReparacion>();
      
      tickets.forEach(t => allTicketsMap.set(t.id, t));
      historyRes.data.forEach(t => allTicketsMap.set(t.id, t));
      
      const combinedTickets = Array.from(allTicketsMap.values());

      await exportTicketsExcel(combinedTickets, currentUser?.nombre);
      notifications.show({
        title: "Exportación exitosa",
        message: "El archivo de reparaciones ha sido generado con totales e historial",
        color: "green",
      });
    } catch (err) {
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
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="md">
          <Title order={3}>Reparaciones</Title>
          <Badge variant="light" color="brand" size="lg">
            {tickets.length} activas
          </Badge>
        </Group>

        <Group gap="sm">
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            leftSection={<IconDownload size={16} />}
            loading={isExporting}
            onClick={handleExport}
          >
            Exportar
          </Button>

          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              setSelectedTicket(null);
              openForm();
            }}
          >
            Nueva Orden
          </Button>
        </Group>
      </Group>

      <Tabs defaultValue="activos" keepMounted={false} radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="activos"
            leftSection={<IconLayoutKanban size={16} />}
          >
            Ordenes Activas
          </Tabs.Tab>
          <Tabs.Tab value="historial" leftSection={<IconArchive size={16} />}>
            Historial (Entregados)
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="activos">
          <Stack gap="md">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Group gap="sm">
                <TextInput
                  placeholder="Buscar orden, equipo..."
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                  leftSection={<IconSearch size={16} />}
                  w={{ base: "100%", md: 250 }}
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
                          Tarjetas
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
            </Group>

            {viewMode === "list" && (
              <Group gap="sm" mb="xs" align="flex-end">
                <Select
                  label="Estado"
                  placeholder="Todos los estados"
                  value={filterEstado}
                  onChange={(v) => setFilterEstado(v || "ALL")}
                  data={[
                    { value: "ALL", label: "Todos los Estados" },
                    ...Object.entries(TICKET_STATUS)
                      .filter(([key]) => key !== "ENTREGADO") // Entregados are now in History
                      .map(([value, { label }]) => ({
                        value,
                        label,
                      })),
                  ]}
                  leftSection={<IconFilter size={14} />}
                  w={{ base: "100%", sm: 200 }}
                />
                <Select
                  label="Ordenar por"
                  value={sortBy}
                  onChange={(v) => setSortBy(v || "NEWEST")}
                  data={[
                    { value: "NEWEST", label: "Más recientes primero" },
                    { value: "OLDEST", label: "Más antiguos primero" },
                    { value: "PRICE_HIGH", label: "Mayor precio" },
                    { value: "PRICE_LOW", label: "Menor precio" },
                  ]}
                  leftSection={<IconSortAscending size={14} />}
                  w={{ base: "100%", sm: 220 }}
                />
              </Group>
            )}

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

      <TicketForm
        opened={formOpened}
        onClose={() => {
          closeForm();
          setSelectedTicket(null);
        }}
        initialData={selectedTicket}
        onSubmit={handleNewTicket}
      />

      <DeliveryModal
        opened={deliveryOpened}
        onClose={() => {
          closeDelivery();
          setDeliveryTicket(null);
        }}
        ticket={deliveryTicket}
        onSuccess={() => {
          // Modal handles its own mutation and invalidation.
          // Success means the board will auto-refresh via React Query.
        }}
      />

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
