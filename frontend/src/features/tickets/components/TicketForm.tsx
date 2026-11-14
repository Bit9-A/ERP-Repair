import { useState } from "react";
import {
  Modal,
  Button,
  Group,
  Tabs,
  Text,
  Stepper,
  Badge,
  Paper,
  Box,
  ThemeIcon,
  ActionIcon,
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
  IconTools,
  IconX,
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
            onProceedNext={handleNextStep}
          />
        );
      case 1:
        return (
          <Step2EquipmentPanel
            form={form}
            state={state}
            queries={queries}
            actions={actions}
            onProceedNext={handleNextStep}
          />
        );
      case 2:
        return (
          <Step3SecurityFaultPanel
            form={form}
            initialData={initialData}
            onProceedNext={handleNextStep}
          />
        );
      case 3:
        return (
          <Step4ChecklistPanel
            form={form}
            onProceedNext={handleNextStep}
          />
        );
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
    <form onSubmit={form.onSubmit(handleSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Progress Indicators: Desktop Stepper vs Mobile Segment Bar ── */}
      {isMobile ? (
        <div className="shrink-0 px-4 pt-3 pb-2.5 bg-slate-50/80 dark:bg-[#131f33]/70 border-b border-slate-200/80 dark:border-[#1e324f]">
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
            radius="lg"
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
                    return <Icon size={16} strokeWidth={2.5} />;
                  })()}
                </ThemeIcon>
                <div>
                  <Text size="xs" fw={800} className="font-heading" lineClamp={1}>
                    Paso {activeStep + 1} de 5: {STEPS[activeStep].label}
                  </Text>
                  <Text size="10px" c="dimmed" lineClamp={1}>
                    {STEPS[activeStep].subtitle}
                  </Text>
                </div>
              </Group>

              <Badge size="xs" variant="filled" color={activeStep === 4 ? "green" : "blue"} radius="xl">
                {activeStep + 1} / 5
              </Badge>
            </Group>
          </Paper>
        </div>
      ) : (
        /* ── DESKTOP VIEW: Sleek Signature Stepper Bar ── */
        <div className="shrink-0 px-6 pt-3 pb-2 bg-slate-50/80 dark:bg-[#131f33]/70 border-b border-slate-200/80 dark:border-[#1e324f]">
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
                padding: "4px 0 10px 0",
              },
              step: {
                cursor: isEdit ? "pointer" : "default",
              },
              stepLabel: {
                fontSize: "12px",
                fontWeight: 800,
                fontFamily: "'Titillium Web', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              },
              stepDescription: {
                fontSize: "10.5px",
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
                  icon={<Icon size={15} strokeWidth={2.2} />}
                />
              );
            })}
          </Stepper>
        </div>
      )}

      {/* ── Active Step Panel Body (Dedicated Scrollable Area!) ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {renderStepContent(activeStep, isEdit)}
      </div>

      {/* ── STICKY FOOTER CONTROLS: Always Visible on Screen ── */}
      <div className="shrink-0 bg-white/95 dark:bg-[#0b1320]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-[#1e324f] px-4 sm:px-6 py-3.5 z-20">
        <Group justify="space-between" align="center" wrap="wrap" gap="xs">
          <Button
            variant="subtle"
            color="gray"
            radius="xl"
            size={isMobile ? "xs" : "sm"}
            onClick={onClose}
            className="font-sirac-title text-xs font-bold"
          >
            Cancelar
          </Button>

          <Group gap="xs">
            {activeStep > 0 && (
              <Button
                variant="default"
                radius="xl"
                size={isMobile ? "xs" : "sm"}
                onClick={handlePrevStep}
                leftSection={<IconArrowLeft size={15} strokeWidth={2.5} />}
                className="font-sirac-title text-xs font-bold"
              >
                Paso Anterior
              </Button>
            )}

            {activeStep < 4 ? (
              <Button
                color="blue"
                radius="xl"
                size={isMobile ? "xs" : "sm"}
                onClick={handleNextStep}
                rightSection={<IconArrowRight size={15} strokeWidth={2.5} />}
                className="shadow-md shadow-blue-900/40 font-sirac-title tracking-wider text-xs font-bold uppercase"
              >
                Siguiente Paso: {STEPS[activeStep + 1].label}
              </Button>
            ) : (
              <Button
                type="submit"
                color="green"
                radius="xl"
                size={isMobile ? "xs" : "sm"}
                disabled={isLocked}
                leftSection={<IconCheck size={16} strokeWidth={2.5} />}
                className="shadow-md shadow-emerald-900/40 font-sirac-title tracking-wider text-xs font-bold uppercase"
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
                radius="xl"
                size={isMobile ? "xs" : "sm"}
                disabled={isLocked}
                className="font-sirac-title text-xs font-bold"
              >
                Guardar Cambios
              </Button>
            )}
          </Group>
        </Group>
      </div>
    </form>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size="xl"
      fullScreen={isMobile}
      radius={isMobile ? 0 : 28}
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{
        backgroundOpacity: 0.6,
        blur: 5,
      }}
      shadow="2xl"
      transitionProps={{ transition: "pop", duration: 250 }}
      styles={{
        content: {
          borderRadius: isMobile ? 0 : "24px",
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
          maxHeight: isMobile ? "100vh" : "90vh",
          display: "flex",
          flexDirection: "column",
        },
        body: {
          padding: 0,
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        },
      }}
    >
      {/* ── Signature SIRAC/SIGEPAT Hero Header ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0b1320] via-[#131f33] to-[#18263d] text-white p-4 sm:p-5 border-b border-[#1e324f] shrink-0">
        {/* Subtle accent top border line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-amber-400 to-emerald-400" />

        {/* Watermark Background Icon */}
        <div className="absolute -top-3 -right-3 text-white/[0.04] pointer-events-none rotate-12">
          <IconTools size={110} strokeWidth={1.5} />
        </div>

        <Group justify="space-between" align="center" style={{ position: "relative", zIndex: 1 }}>
          <Group gap="sm" align="center">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs">
              <IconTool size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 font-sirac-title">
                  Paso {activeStep + 1} de 5 • {STEPS[activeStep].label}
                </span>
                {initialData?.estado && (
                  <Badge variant="filled" size="xs" color="blue" radius="xl">
                    {initialData.estado}
                  </Badge>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-bold font-sirac-title tracking-wide text-white mt-0.5">
                {modalTitle}
              </h2>
            </div>
          </Group>

          {/* Floating Glass Close Button */}
          <ActionIcon
            variant="subtle"
            radius="xl"
            size="md"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <IconX size={18} strokeWidth={2.5} />
          </ActionIcon>
        </Group>
      </div>

      {/* ── Modal Content: Stepper or Tabs ── */}
      {initialData ? (
        <Tabs defaultValue="general" radius="xl" className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <Tabs.List grow px={isMobile ? "md" : "xl"} pt="xs" className="shrink-0 bg-slate-50/70 dark:bg-[#131f33]/70 border-b border-slate-200/80 dark:border-[#1e324f]">
            <Tabs.Tab
              value="general"
              leftSection={<IconListDetails size={16} strokeWidth={2.2} />}
              color="blue"
            >
              <Text fw={700} size={isMobile ? "xs" : "sm"} className="font-sirac-title">
                Pasos de la Orden
              </Text>
            </Tabs.Tab>
            <Tabs.Tab
              value="repuestos"
              leftSection={<IconTool size={16} strokeWidth={2.2} />}
              color="orange"
            >
              <Text fw={700} size={isMobile ? "xs" : "sm"} className="font-sirac-title">
                Repuestos y Stock
              </Text>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="general" className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {renderStepper(true)}
          </Tabs.Panel>

          <Tabs.Panel value="repuestos" p={isMobile ? "md" : "xl"} className="flex-1 overflow-y-auto">
            <RepuestosTab ticketId={initialData.id} />
          </Tabs.Panel>
        </Tabs>
      ) : (
        renderStepper(false)
      )}
    </Modal>
  );
}
