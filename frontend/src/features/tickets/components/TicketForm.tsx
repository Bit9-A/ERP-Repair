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
  Paper,
  Box,
  ThemeIcon,
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

const STEPS = [
  { label: "Cliente", subtitle: "Cédula y Datos", icon: IconUser },
  { label: "Equipo", subtitle: "Tipo y Modelo", icon: IconDevices },
  { label: "Seguridad", subtitle: "PIN y Falla", icon: IconLock },
  { label: "Checklist", subtitle: "Test Inicial", icon: IconChecklist },
  { label: "Costos", subtitle: "Precios y Técnico", icon: IconCurrencyDollar },
];

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

  // Render individual step panels
  const renderStepContent = (stepIndex: number, isEdit: boolean) => {
    switch (stepIndex) {
      case 0:
        return (
          <Step1ClientPanel
            form={form}
            state={state}
            queries={queries}
            actions={actions}
            canEditSucursal={canEditSucursal}
            onProceedNext={() => setActiveStep(1)}
          />
        );
      case 1:
        return (
          <Step2EquipmentPanel
            form={form}
            state={state}
            queries={queries}
            actions={actions}
          />
        );
      case 2:
        return (
          <Step3SecurityFaultPanel
            form={form}
            initialData={initialData}
          />
        );
      case 3:
        return <Step4ChecklistPanel form={form} />;
      case 4:
        return (
          <Step5CostosPanel
            form={form}
            isEdit={isEdit}
            queries={queries}
            computed={computed}
            permissions={permissions}
          />
        );
      default:
        return null;
    }
  };

  const renderStepper = (isEdit: boolean) => (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap={isMobile ? "sm" : "lg"}>
        {/* ── MOBILE VIEW: Sleek Segment Bar & Step Badge ── */}
        {isMobile ? (
          <Box mb={4}>
            {/* Segment Progress Bars */}
            <Group gap={4} grow mb={8}>
              {STEPS.map((_, idx) => {
                const isPast = idx < activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <Box
                    key={idx}
                    onClick={() => {
                      if (isEdit || isPast) setActiveStep(idx);
                    }}
                    style={{
                      height: 5,
                      borderRadius: 3,
                      backgroundColor: isCurrent
                        ? "var(--mantine-color-blue-filled)"
                        : isPast
                        ? "var(--mantine-color-green-filled)"
                        : "var(--border-subtle)",
                      cursor: isEdit || isPast ? "pointer" : "default",
                      transition: "all 0.2s ease",
                    }}
                  />
                );
              })}
            </Group>

            {/* Step Header Pill */}
            <Paper
              p="xs"
              radius="md"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="xs" wrap="nowrap">
                  <ThemeIcon size="md" radius="md" color="blue" variant="light">
                    {(() => {
                      const Icon = STEPS[activeStep].icon;
                      return <Icon size={16} />;
                    })()}
                  </ThemeIcon>
                  <div>
                    <Text size="xs" fw={700} className="font-heading" lineClamp={1}>
                      Paso {activeStep + 1} de 5: {STEPS[activeStep].label}
                    </Text>
                    <Text size="10px" c="dimmed" lineClamp={1}>
                      {STEPS[activeStep].subtitle}
                    </Text>
                  </div>
                </Group>

                <Badge size="xs" variant="filled" color={activeStep === 4 ? "green" : "blue"}>
                  {activeStep + 1} / 5
                </Badge>
              </Group>
            </Paper>
          </Box>
        ) : (
          /* ── DESKTOP VIEW: Full Horizontal Mantine Stepper ── */
          <Stepper
            active={activeStep}
            onStepClick={(step) => {
              if (isEdit || step < activeStep) {
                setActiveStep(step);
              }
            }}
            size="sm"
            color="blue"
            orientation="horizontal"
            styles={{
              root: {
                padding: "4px 0",
              },
              step: {
                cursor: isEdit ? "pointer" : "default",
              },
              stepLabel: {
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "var(--font-heading)",
              },
              stepDescription: {
                fontSize: "11px",
              },
            }}
          >
            {STEPS.map((st, idx) => {
              const Icon = st.icon;
              return (
                <Stepper.Step
                  key={idx}
                  label={`${idx + 1}. ${st.label}`}
                  description={st.subtitle}
                  icon={<Icon size={16} />}
                />
              );
            })}
          </Stepper>
        )}

        {/* ── Active Step Panel Body ── */}
        <Box style={{ minHeight: isMobile ? "auto" : 320 }}>
          {renderStepContent(activeStep, isEdit)}
        </Box>

        {/* ── Footer Navigation Controls (Sticky on mobile for thumb reach) ── */}
        <Paper
          p={isMobile ? "xs" : undefined}
          style={{
            borderTop: "1px solid var(--border-subtle)",
            position: isMobile ? "sticky" : "static",
            bottom: isMobile ? 0 : undefined,
            background: isMobile ? "var(--bg-card)" : "transparent",
            zIndex: 20,
            marginTop: isMobile ? "8px" : "16px",
            boxShadow: isMobile ? "0 -4px 12px rgba(0, 0, 0, 0.08)" : undefined,
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Button
              variant="subtle"
              color="gray"
              size={isMobile ? "xs" : "sm"}
              onClick={onClose}
            >
              Cancelar
            </Button>

            <Group gap="xs">
              {activeStep > 0 && (
                <Button
                  variant="default"
                  size={isMobile ? "xs" : "sm"}
                  onClick={handlePrevStep}
                  leftSection={<IconArrowLeft size={14} />}
                >
                  Atrás
                </Button>
              )}

              {activeStep < 4 ? (
                <Button
                  size={isMobile ? "xs" : "sm"}
                  onClick={handleNextStep}
                  rightSection={<IconArrowRight size={14} />}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  color="green"
                  size={isMobile ? "xs" : "sm"}
                  disabled={isLocked}
                  leftSection={<IconCheck size={14} />}
                  title={
                    isLocked
                      ? "Ticket cerrado. Solo un Administrador puede modificarlo."
                      : undefined
                  }
                >
                  {isEdit ? "Actualizar Orden" : "Crear Orden"}
                </Button>
              )}

              {/* In Edit mode, allow quick save from any step */}
              {isEdit && activeStep < 4 && (
                <Button
                  type="submit"
                  variant="light"
                  color="blue"
                  size={isMobile ? "xs" : "sm"}
                  disabled={isLocked}
                >
                  Guardar
                </Button>
              )}
            </Group>
          </Group>
        </Paper>
      </Stack>
    </form>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs" align="center">
          <Text fw={700} size={isMobile ? "sm" : "lg"} className="font-heading">
            {modalTitle}
          </Text>
          {initialData?.estado && (
            <Badge variant="light" size="xs">
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
          paddingBottom: isMobile ? "0.5rem" : "1rem",
          marginBottom: isMobile ? "0.5rem" : "1rem",
        },
        body: {
          paddingTop: 0,
          paddingLeft: isMobile ? "12px" : undefined,
          paddingRight: isMobile ? "12px" : undefined,
          paddingBottom: isMobile ? "4px" : undefined,
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
              <Text fw={600} size={isMobile ? "xs" : "sm"}>
                Pasos de la Orden
              </Text>
            </Tabs.Tab>
            <Tabs.Tab
              value="repuestos"
              leftSection={<IconTool size={16} />}
              color="orange"
            >
              <Text fw={600} size={isMobile ? "xs" : "sm"}>
                Repuestos y Stock
              </Text>
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
