import {
  Modal,
  Button,
  Group,
  Stack,
  Tabs,
  Text,
  Accordion,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconListDetails, IconTool } from "@tabler/icons-react";
import type { TicketReparacion } from "../../../types";
import type { TicketFormValues } from "../types/tickets.types";
import { useTicketForm } from "../hooks/useTicketForm";
import { useAuthStore } from "../../auth/store/auth.store";

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

  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = useAuthStore((state) => state.user);
  const isLocked = initialData?.estado === "ENTREGADO" && user?.rol !== "ADMIN";
  // Non-admin users with a branch assigned cannot change the sucursal
  const canEditSucursal = user?.rol === "ADMIN" || !user?.sucursalId;

  const renderGeneralForm = (isEdit: boolean) => (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Accordion
          multiple
          defaultValue={["sucursal", "cliente", "equipo", "estado", "costos"]}
        >
          <ClientDataPanel
            form={form}
            state={state}
            queries={queries}
            actions={actions}
            canEditSucursal={canEditSucursal}
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
          <Button
            type="submit"
            disabled={isLocked}
            title={
              isLocked
                ? "Ticket cerrado. Solo un Administrador puede modificarlo."
                : undefined
            }
          >
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
      title={<Text fw={700} size="lg" aria-level={1}>{modalTitle}</Text>}
      size="xl"
      fullScreen={isMobile}
      radius={isMobile ? 0 : "md"}
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      shadow="xl"
      transitionProps={{ transition: 'pop' }}
      styles={{
        header: {
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1rem',
          marginBottom: '1rem'
        },
        body: {
          paddingTop: 0
        }
      }}
      aria-labelledby="ticket-form-modal-title"
      aria-describedby="ticket-form-modal-description"
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
