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
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconLayoutKanban,
  IconList,
  IconSearch,
} from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketListView } from "../components/TicketListView";
import { TicketForm } from "../components/TicketForm";
import { DeliveryModal } from "../components/DeliveryModal";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion, EstadoTicket } from "../../../types";
import {
  useRepairs,
  useCreateRepair,
  useUpdateRepair,
} from "../../../services";

export function KanbanPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const [selectedTicket, setSelectedTicket] = useState<TicketReparacion | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<string>("kanban");

  const [deliveryTicket, setDeliveryTicket] = useState<TicketReparacion | null>(
    null,
  );
  const [deliveryOpened, { open: openDelivery, close: closeDelivery }] =
    useDisclosure(false);

  // -- API hooks --
  const { data: tickets = [], isLoading } = useRepairs();
  const createRepair = useCreateRepair();
  const updateRepair = useUpdateRepair();

  const filteredTickets = tickets.filter(
    (t) =>
      t.equipo?.toLowerCase().includes(search.toLowerCase()) ||
      t.falla_reportada?.toLowerCase().includes(search.toLowerCase()) ||
      t.id?.toLowerCase().includes(search.toLowerCase()),
  );

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
    // If moving to ENTREGADO, intercept and open payment modal
    if (newEstado === "ENTREGADO") {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        setDeliveryTicket(ticket);
        openDelivery();
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

  return (
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="md">
          <Title order={3}>Reparaciones</Title>
          <Badge variant="light" color="brand" size="lg">
            {tickets.length} orden
          </Badge>
        </Group>

        <Group gap="sm">
          <TextInput
            placeholder="Buscar orden, equipo..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            w={{ base: "100%", md: 250 }}
          />

          {/* View toggle */}
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

      {/* View content */}
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
    </Stack>
  );
}
