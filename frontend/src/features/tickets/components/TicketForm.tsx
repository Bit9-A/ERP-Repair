import {
  Modal,
  Button,
  Group,
  Stack,
  Tabs,
  Text,
  Accordion,
} from "@mantine/core";
import { IconListDetails, IconTool } from "@tabler/icons-react";
import type { TicketReparacion } from "../../../types";
import type { TicketFormValues } from "../types/tickets.types";
import { useTicketForm } from "../hooks/useTicketForm";

import { ClientDataPanel } from "./TicketFormGeneral/ClientDataPanel";
import { EquipmentDataPanel } from "./TicketFormGeneral/EquipmentDataPanel";
import { ChecklistDataPanel } from "./TicketFormGeneral/ChecklistDataPanel";
import { CostosDataPanel } from "./TicketFormGeneral/CostosDataPanel";
import { RepuestosTab } from "./RepuestosTab";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
  initialData?: TicketReparacion | null;
}

export function TicketForm({
  opened,
  onClose,
  onSubmit,
  initialData,
}: TicketFormProps) {
  // Extract all the complex logic and hooks
  const { form, handleSubmit, state, queries, actions, computed, permissions } =
    useTicketForm({
      initialData,
      opened,
      onSubmit,
    });

  const modalTitle = initialData
    ? `Editar Ticket #T-${initialData.id.substring(0, 6)}`
    : "Nueva Orden de Reparación";

  const renderGeneralForm = (isEdit: boolean) => (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Accordion
          multiple
          defaultValue={["cliente", "equipo", "estado", "costos"]}
        >
          <ClientDataPanel
            form={form}
            state={state}
            queries={queries}
            actions={actions}
          />
          <EquipmentDataPanel
            form={form}
            initialData={initialData}
            state={state}
            queries={queries}
            actions={actions}
          />
          <ChecklistDataPanel form={form} />
          <CostosDataPanel
            form={form}
            isEdit={isEdit}
            queries={queries}
            computed={computed}
            permissions={permissions}
          />
        </Accordion>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEdit ? "Actualizar Ticket" : "Crear Ticket"}
          </Button>
        </Group>
      </Stack>
    </form>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={modalTitle}
      size="xl"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      {initialData ? (
        <Tabs defaultValue="general" mb="md">
          <Tabs.List grow>
            <Tabs.Tab
              value="general"
              leftSection={<IconListDetails size={16} />}
              color="blue"
            >
              <Text fw={600}>Información General</Text>
            </Tabs.Tab>
            <Tabs.Tab
              value="repuestos"
              leftSection={<IconTool size={16} />}
              color="orange"
            >
              <Text fw={600}>Repuestos</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" pt="sm">
            {renderGeneralForm(true)}
          </Tabs.Panel>

          <Tabs.Panel value="repuestos" pt="sm">
            <RepuestosTab ticketId={initialData.id} />
          </Tabs.Panel>
        </Tabs>
      ) : (
        renderGeneralForm(false)
      )}
    </Modal>
  );
}
