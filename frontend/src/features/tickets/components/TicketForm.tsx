import { useState } from "react";
import {
  Modal,
  Button,
  Group,
  Stack,
  Tabs,
  Text,
  Stepper,
  Badge,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconListDetails,
  IconTool,
  IconUser,
  IconDevices,
  IconLock,
  IconChecklist,
  IconCurrencyDollar,
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
} from "@tabler/icons-react";
import type { TicketReparacion } from "../../../types";
import type { TicketFormValues } from "../types/tickets.types";
import { useTicketForm } from "../hooks/useTicketForm";
import { useAuthStore } from "../../auth/store/auth.store";

import { Step1ClientPanel } from "./TicketFormGeneral/Step1ClientPanel";
import { Step2EquipmentPanel } from "./TicketFormGeneral/Step2EquipmentPanel";
import { Step3SecurityFaultPanel } from "./TicketFormGeneral/Step3SecurityFaultPanel";
import { Step4ChecklistPanel } from "./TicketFormGeneral/Step4ChecklistPanel";
import { Step5CostosPanel } from "./TicketFormGeneral/Step5CostosPanel";
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
  const isMobile = useMediaQuery("(max-width: 768px)");
  const user = useAuthStore((state) => state.user);
  const [activeStep, setActiveStep] = useState(0);

  // Extract all form logic and reactive mutations
  const { form, handleSubmit, state, queries, actions, computed, permissions } =
    useTicketForm({
      initialData,
      opened,
      onSubmit,
    });

  const modalTitle = initialData
    ? `Editar Orden #T-${initialData.id.substring(0, 6)}`
    : "Nueva Orden de Reparación";

  const isLocked = initialData?.estado === "ENTREGADO" && user?.rol !== "ADMIN";
  const canEditSucursal = user?.rol === "ADMIN" || !user?.sucursalId;

  // Validate step fields before advancing
  const handleNextStep = () => {
    if (activeStep === 0) {
      if (!form.values.clienteId || form.values.clienteId.trim().length === 0) {
        form.setFieldError("clienteId", "Debes seleccionar o dar de alta al cliente para continuar");
        notifications.show({
          title: "Cliente requerido",
          message: "Busca un cliente por su cédula o regístralo antes de avanzar.",
          color: "orange",
        });
        return;
      }
    }

    if (activeStep === 1) {
      let hasError = false;
      if (!form.values.marca || form.values.marca.trim().length === 0) {
        form.setFieldError("marca", "La marca es requerida");
        hasError = true;
      }
      if (!form.values.modelo || form.values.modelo.trim().length === 0) {
        form.setFieldError("modelo", "El modelo es requerido");
        hasError = true;
      }
      if (hasError) {
        notifications.show({
          title: "Datos del equipo requeridos",
          message: "Especifica la marca y modelo del dispositivo.",
          color: "orange",
        });
        return;
      }
    }

    if (activeStep === 2) {
      if (!form.values.falla || form.values.falla.trim().length < 5) {
        form.setFieldError("falla", "Indica la falla con al menos 5 caracteres");
        notifications.show({
          title: "Falla reportada requerida",
          message: "Describe el problema manifestado por el cliente.",
          color: "orange",
        });
        return;
      }
    }

    setActiveStep((current) => (current < 4 ? current + 1 : current));
  };

  const handlePrevStep = () => {
    setActiveStep((current) => (current > 0 ? current - 1 : current));
  };

  const renderStepper = (isEdit: boolean) => (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="lg">
        {/* ── Visual Stepper Navigation ── */}
        <Stepper
          active={activeStep}
          onStepClick={(step) => {
            // Permit free click in edit mode, or if the step was already unlocked
            if (isEdit || step < activeStep) {
              setActiveStep(step);
            }
          }}
          size={isMobile ? "xs" : "sm"}
          color="blue"
          orientation={isMobile ? "vertical" : "horizontal"}
          styles={{
            root: {
              padding: "4px 0",
            },
            step: {
              cursor: isEdit ? "pointer" : "default",
            },
            stepLabel: {
              fontSize: isMobile ? "12px" : "13px",
              fontWeight: 700,
              fontFamily: "var(--font-heading)",
            },
            stepDescription: {
              fontSize: "11px",
            },
          }}
        >
          <Stepper.Step
            label="1. Cliente"
            description="Cédula y Datos"
            icon={<IconUser size={16} />}
          >
            <Step1ClientPanel
              form={form}
              state={state}
              queries={queries}
              actions={actions}
              canEditSucursal={canEditSucursal}
              onProceedNext={() => setActiveStep(1)}
            />
          </Stepper.Step>

          <Stepper.Step
            label="2. Equipo"
            description="Tipo y Hardware"
            icon={<IconDevices size={16} />}
          >
            <Step2EquipmentPanel
              form={form}
              state={state}
              queries={queries}
              actions={actions}
            />
          </Stepper.Step>

          <Stepper.Step
            label="3. Seguridad"
            description="PIN y Falla"
            icon={<IconLock size={16} />}
          >
            <Step3SecurityFaultPanel
              form={form}
              initialData={initialData}
            />
          </Stepper.Step>

          <Stepper.Step
            label="4. Checklist"
            description="Test de Entrada"
            icon={<IconChecklist size={16} />}
          >
            <Step4ChecklistPanel form={form} />
          </Stepper.Step>

          <Stepper.Step
            label="5. Costos"
            description="Precios y Comisión"
            icon={<IconCurrencyDollar size={16} />}
          >
            <Step5CostosPanel
              form={form}
              isEdit={isEdit}
              queries={queries}
              computed={computed}
              permissions={permissions}
            />
          </Stepper.Step>
        </Stepper>

        {/* ── Footer Navigation Controls ── */}
        <Group
          justify="space-between"
          align="center"
          pt="md"
          style={{
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancelar
          </Button>

          <Group gap="sm">
            {activeStep > 0 && (
              <Button
                variant="default"
                onClick={handlePrevStep}
                leftSection={<IconArrowLeft size={16} />}
              >
                Paso Anterior
              </Button>
            )}

            {activeStep < 4 ? (
              <Button
                onClick={handleNextStep}
                rightSection={<IconArrowRight size={16} />}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                color="green"
                disabled={isLocked}
                leftSection={<IconCheck size={16} />}
                title={
                  isLocked
                    ? "Ticket cerrado. Solo un Administrador puede modificarlo."
                    : undefined
                }
              >
                {isEdit ? "Actualizar Orden" : "Crear Orden de Reparación"}
              </Button>
            )}

            {/* In Edit mode, allow quick save from any step */}
            {isEdit && activeStep < 4 && (
              <Button
                type="submit"
                variant="light"
                color="blue"
                disabled={isLocked}
              >
                Guardar Cambios
              </Button>
            )}
          </Group>
        </Group>
      </Stack>
    </form>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={700} size="lg" className="font-heading">
            {modalTitle}
          </Text>
          {initialData?.estado && (
            <Badge variant="light" size="sm">
              {initialData.estado}
            </Badge>
          )}
        </Group>
      }
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
      transitionProps={{ transition: "pop" }}
      styles={{
        header: {
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "1rem",
          marginBottom: "1rem",
        },
        body: {
          paddingTop: 0,
        },
      }}
    >
      {initialData ? (
        <Tabs defaultValue="general" mb="md">
          <Tabs.List grow mb="md">
            <Tabs.Tab
              value="general"
              leftSection={<IconListDetails size={16} />}
              color="blue"
            >
              <Text fw={600}>Pasos de la Orden</Text>
            </Tabs.Tab>
            <Tabs.Tab
              value="repuestos"
              leftSection={<IconTool size={16} />}
              color="orange"
            >
              <Text fw={600}>Repuestos y Stock</Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general">
            {renderStepper(true)}
          </Tabs.Panel>

          <Tabs.Panel value="repuestos">
            <RepuestosTab ticketId={initialData.id} />
          </Tabs.Panel>
        </Tabs>
      ) : (
        renderStepper(false)
      )}
    </Modal>
  );
}
