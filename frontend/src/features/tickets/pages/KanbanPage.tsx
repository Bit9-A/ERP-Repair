import { useState } from "react";
import {
  Button,
  Group,
  Stack,
  Title,
  LoadingOverlay,
  SegmentedControl,
  Badge,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconLayoutKanban, IconList } from "@tabler/icons-react";
import { KanbanBoard } from "../components/KanbanBoard";
import { TicketListView } from "../components/TicketListView";
import { TicketForm } from "../components/TicketForm";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion, EstadoTicket } from "../../../types";
import {
  useRepairs,
  useCreateRepair,
  useUpdateRepair,
} from "../../../services";

export function KanbanPage() {
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const [selectedTicket, setSelectedTicket] = useState<TicketReparacion | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<string>("kanban");

  // -- API hooks --
  const { data: tickets = [], isLoading } = useRepairs();
  const createRepair = useCreateRepair();
  const updateRepair = useUpdateRepair();

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
          tickets={tickets}
          onTicketClick={handleEditTicket}
          onMoveTicket={handleMoveTicket}
        />
      ) : (
        <TicketListView
          tickets={tickets}
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
    </Stack>
  );
}
