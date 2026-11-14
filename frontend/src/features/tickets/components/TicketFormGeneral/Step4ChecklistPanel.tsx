import { useMemo } from "react";
import {
  Stack,
  Checkbox,
  SimpleGrid,
  Text,
  Paper,
  Group,
  ThemeIcon,
  Divider,
  Button,
  Alert,
  Badge,
} from "@mantine/core";
import {
  IconChecklist,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconArrowRight,
  IconSparkles,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import {
  getChecklistForCategory,
  DEVICE_CATEGORIES,
} from "../../data/deviceCatalog";

interface Step4ChecklistPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  onProceedNext?: () => void;
}

export function Step4ChecklistPanel({ form, onProceedNext }: Step4ChecklistPanelProps) {
  const currentType = form.values.tipo_equipo || "Smartphone";

  // Identificar la categoría activa
  const activeCategoryId = useMemo(() => {
    const match = DEVICE_CATEGORIES.find((c) => c.id === currentType);
    return match ? match.id : "Otro";
  }, [currentType]);

  // Grupos de checklist adaptados a la categoría real del equipo
  const checklistGroups = useMemo(() => {
    return getChecklistForCategory(activeCategoryId);
  }, [activeCategoryId]);

  // Contar cuántos ítems están marcados actualmente
  const totalItemsCount = useMemo(() => {
    return checklistGroups.reduce((acc, g) => acc + g.items.length, 0);
  }, [checklistGroups]);

  const checkedCount = useMemo(() => {
    let count = 0;
    checklistGroups.forEach((g) => {
      g.items.forEach((item) => {
        if ((form.values.checklist as any)?.[item.key]) {
          count++;
        }
      });
    });
    return count;
  }, [checklistGroups, form.values.checklist]);

  // Acción para marcar todo el checklist contextual como OK
  const handleCheckAllGood = () => {
    checklistGroups.forEach((g) => {
      g.items.forEach((item) => {
        form.setFieldValue(`checklist.${item.key}` as any, true);
      });
    });
    form.setFieldValue("checklist.riesgos_explicados", true);
  };

  // Acción para limpiar todo el checklist
  const handleResetChecklist = () => {
    checklistGroups.forEach((g) => {
      g.items.forEach((item) => {
        form.setFieldValue(`checklist.${item.key}` as any, false);
      });
    });
    form.setFieldValue("checklist.riesgos_explicados", false);
  };

  return (
    <Stack gap="lg">
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="md">
          {/* ── Encabezado y Acciones Rápidas ── */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="teal" variant="light">
                <IconChecklist size={20} />
              </ThemeIcon>
              <div>
                <div className="flex items-center gap-2">
                  <Text fw={700} size="sm" className="font-heading">
                    Inspección y Test Inicial de Recepción
                  </Text>
                  <Badge variant="filled" color="teal" size="xs" className="font-sirac-title uppercase font-bold">
                    {activeCategoryId}
                  </Badge>
                  <Badge variant="outline" color="blue" size="xs" className="font-sirac-title font-bold">
                    {checkedCount} / {totalItemsCount} OK
                  </Badge>
                </div>
                <Text size="xs" c="dimmed">
                  Puntos de inspección adaptados para <span className="font-bold text-teal-500">{activeCategoryId}</span>
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <Button
                variant="light"
                color="teal"
                size="xs"
                leftSection={<IconCheck size={14} />}
                onClick={handleCheckAllGood}
                className="font-sirac-title text-xs font-bold cursor-pointer"
              >
                Marcar Todo Operativo (100% OK)
              </Button>
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<IconX size={14} />}
                onClick={handleResetChecklist}
                className="font-sirac-title text-xs font-bold cursor-pointer"
              >
                Limpiar Todo
              </Button>
            </Group>
          </Group>

          <Divider color="var(--border-subtle)" />

          {/* ── Grupos de Checklist Contextuales (Adaptados según categoría) ── */}
          <div className="space-y-4">
            {checklistGroups.map((group, groupIdx) => (
              <div
                key={groupIdx}
                className="p-3 rounded-2xl border border-slate-200 dark:border-[#1e324f] bg-slate-50/60 dark:bg-[#131f33]/60 space-y-2.5"
              >
                <div className="flex items-center gap-1.5">
                  <IconSparkles size={14} className={`text-${group.color}-500`} />
                  <Text size="xs" fw={800} tt="uppercase" c={group.color} lts={0.5} className="font-sirac-title">
                    {group.titulo}
                  </Text>
                </div>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="xs">
                  {group.items.map((item) => {
                    const isChecked = Boolean((form.values.checklist as any)?.[item.key]);
                    return (
                      <div
                        key={item.key}
                        onClick={() => form.setFieldValue(`checklist.${item.key}` as any, !isChecked)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isChecked
                            ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600/50 shadow-xs"
                            : "bg-white dark:bg-[#0b1320] border-slate-200 dark:border-[#243f5d] hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div
                            color="teal"
                            size="xs"
                            styles={{
                              input: { cursor: "pointer" },
                            }}
                          />
                          <span
                            className={`text-xs font-bold font-sirac-title ${
                              isChecked
                                ? "text-emerald-900 dark:text-emerald-200"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                        {isChecked && (
                          <Badge size="xs" color="teal" variant="light" className="shrink-0 font-sirac-title font-bold">
                            OK
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </SimpleGrid>
              </div>
            ))}
          </div>
        </Stack>
      </Paper>

      {/* ── Advertencia de Riesgos Legales / Taller ── */}
      <Alert
        icon={<IconAlertTriangle size={18} />}
        title="Cláusula de Responsabilidad Técnica y Manipulación"
        color="orange"
        radius="md"
        styles={{
          root: {
            border: "1px solid rgba(245, 158, 11, 0.3)",
          },
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Text size="xs" style={{ flex: 1, minWidth: 240 }} className="font-sirac-title">
            Indica si se explicaron al cliente los riesgos inherentes a la apertura y manipulación técnica
            del equipo (pantallas frágiles, flexes con desgaste previo o componentes sulfatados).
          </Text>
          <Checkbox
            label="Riesgos explicados y aceptados por el cliente"
            fw={700}
            color="orange"
            {...form.getInputProps("checklist.riesgos_explicados", {
              type: "checkbox",
            })}
            className="font-sirac-title text-xs"
          />
        </Group>
      </Alert>

      {/* ── Inline Action: Continuar a Costos ── */}
      {onProceedNext && (
        <Group justify="flex-end" pt="xs">
          <Button
            size="sm"
            color="blue"
            rightSection={<IconArrowRight size={15} />}
            onClick={onProceedNext}
            className="font-sirac-title uppercase tracking-wider text-xs font-bold shadow-sm cursor-pointer"
          >
            Continuar a Costos &amp; Presupuesto
          </Button>
        </Group>
      )}
    </Stack>
  );
}
