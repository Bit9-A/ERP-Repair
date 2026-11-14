import { useState, useMemo } from "react";
import {
  Stack,
  SimpleGrid,
  Text,
  Paper,
  Group,
  ThemeIcon,
  Divider,
  Button,
  Alert,
  Badge,
  Switch,
  Checkbox,
} from "@mantine/core";
import {
  IconChecklist,
  IconAlertTriangle,
  IconCheck,
  IconShieldCheck,
  IconSparkles,
  IconPower,
  IconAlertCircle,
  IconRefresh,
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

// Claves que son banderas de defecto (true = tiene falla/daño)
const DEFECT_FLAGS = new Set([
  "carcasa_rota",
  "tornilleria_faltante",
  "pantalla_fallas_internas",
  "uso_diario_desgaste",
]);

export function Step4ChecklistPanel({ form }: Step4ChecklistPanelProps) {
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

  // Toggle Maestro: ¿El equipo entra apagado?
  const isPoweredOffInitial = form.values.checklist.encendido === false && Boolean(form.values.checklist.riesgos_explicados);
  const [equipoApagado, setEquipoApagado] = useState(isPoweredOffInitial);

  // Determinar si una clave específica tiene anomalía
  const isItemInAnomaly = (key: string): boolean => {
    const rawVal = (form.values.checklist as any)?.[key];
    if (DEFECT_FLAGS.has(key)) {
      // Para banderas de defecto: true significa que tiene daño
      return Boolean(rawVal);
    }
    // Para componentes funcionales: false o undefined significa que NO funciona (anomalía)
    // Pero si el formulario apenas se abrió y es false por default, verificamos si está marcado como falla
    return rawVal === false;
  };

  // Alternar anomalía de un ítem (Gestión por excepción: un clic marca que está dañado)
  const toggleItemAnomaly = (key: string) => {
    const isCurrentlyAnomaly = isItemInAnomaly(key);
    if (DEFECT_FLAGS.has(key)) {
      // Invertir bandera de defecto
      form.setFieldValue(`checklist.${key}` as any, !isCurrentlyAnomaly);
    } else {
      // Para funcionales: si ya es anomalía (false), ponerlo en true (OK); si está OK, ponerlo en false (Anomalía)
      form.setFieldValue(`checklist.${key}` as any, isCurrentlyAnomaly ? true : false);
    }
  };

  // Contar anomalías detectadas
  const anomalyCount = useMemo(() => {
    let count = 0;
    checklistGroups.forEach((g) => {
      g.items.forEach((item) => {
        if (isItemInAnomaly(item.key)) {
          count++;
        }
      });
    });
    return count;
  }, [checklistGroups, form.values.checklist]);

  // Manejador del toggle de Equipo Apagado
  const handleToggleEquipoApagado = (checked: boolean) => {
    setEquipoApagado(checked);
    if (checked) {
      form.setFieldValue("checklist.encendido", false);
      form.setFieldValue("checklist.riesgos_explicados", true);
      // Si la falla no menciona apagado, sugerir agregarlo
      const curFalla = (form.values.falla || "").trim();
      if (!curFalla.toLowerCase().includes("apagado") && !curFalla.toLowerCase().includes("no enciende")) {
        form.setFieldValue("falla", curFalla ? `${curFalla}, Equipo recibido apagado / No enciende` : "Equipo recibido apagado / No enciende");
      }
    } else {
      form.setFieldValue("checklist.encendido", true);
    }
  };

  // Restablecer todo a OK (0 anomalías)
  const handleResetToAllGood = () => {
    setEquipoApagado(false);
    checklistGroups.forEach((g) => {
      g.items.forEach((item) => {
        if (DEFECT_FLAGS.has(item.key)) {
          form.setFieldValue(`checklist.${item.key}` as any, false);
        } else {
          form.setFieldValue(`checklist.${item.key}` as any, true);
        }
      });
    });
  };

  return (
    <Stack gap="lg">
      {/* ── 1. Toggle Maestro de Cobertura Legal (Equipo Apagado) ── */}
      <Paper
        p="md"
        radius="md"
        withBorder
        className={`transition-all border ${
          equipoApagado
            ? "bg-amber-500/10 border-amber-500/40 shadow-xs"
            : "bg-slate-50 dark:bg-[#131f33]/70 border-slate-200 dark:border-[#1e324f]"
        }`}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
            <ThemeIcon
              size="lg"
              radius="md"
              color={equipoApagado ? "amber" : "gray"}
              variant={equipoApagado ? "filled" : "light"}
            >
              <IconPower size={20} strokeWidth={2.5} />
            </ThemeIcon>
            <div>
              <div className="flex items-center gap-2">
                <Text fw={800} size="sm" className="font-sirac-title text-slate-900 dark:text-white">
                  Equipo Apagado / Sin Encendido
                </Text>
                {equipoApagado && (
                  <Badge color="amber" variant="filled" size="xs" className="font-sirac-title uppercase font-bold">
                    Salvaguarda Activa
                  </Badge>
                )}
              </div>
              <Text size="xs" c="dimmed" className="font-sirac-title">
                {equipoApagado
                  ? "Se activa automáticamente la cláusula de exención por imposibilidad de test en mostrador"
                  : "Activa si el equipo llega sin batería, en corto o sin posibilidad de encender en recepción"}
              </Text>
            </div>
          </Group>

          <Switch
            size="md"
            color="amber"
            checked={equipoApagado}
            onChange={(e) => handleToggleEquipoApagado(e.currentTarget.checked)}
            label={equipoApagado ? "Recibido Apagado (Protegido)" : "El equipo enciende"}
            className="font-sirac-title text-xs font-bold"
          />
        </Group>

        {/* Banner de protección legal inmediata */}
        {equipoApagado && (
          <Alert
            icon={<IconShieldCheck size={18} />}
            title="Cláusula de Protección Legal Activa"
            color="amber"
            radius="md"
            mt="md"
            styles={{
              root: {
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px dashed rgba(245, 158, 11, 0.4)",
              },
            }}
          >
            <Text size="xs" className="font-sirac-title leading-relaxed">
              <strong>Constancia de Recepción Inoperativa:</strong> El cliente reconoce y acepta que el equipo
              se recibe completamente apagado, imposibilitando la verificación previa de pantalla, touch, cámaras,
              micrófonos y circuitos periféricos. El taller queda deslindado de responsabilidad por daños ocultos
              o preexistentes no detectables en la recepción física.
            </Text>
          </Alert>
        )}
      </Paper>

      {/* ── 2. Inspección por Excepción (Solo Marcar lo Roto / Anomalías) ── */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          opacity: equipoApagado ? 0.75 : 1,
        }}
      >
        <Stack gap="md">
          {/* Encabezado y Contador de Anomalías */}
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color={anomalyCount > 0 ? "rose" : "teal"} variant="light">
                <IconChecklist size={20} />
              </ThemeIcon>
              <div>
                <div className="flex items-center gap-2">
                  <Text fw={700} size="sm" className="font-heading">
                    Checklist de Recepción (Por Excepción)
                  </Text>
                  <Badge
                    variant="filled"
                    color={anomalyCount > 0 ? "rose" : "teal"}
                    size="xs"
                    className="font-sirac-title font-bold"
                  >
                    {anomalyCount === 0
                      ? "🟢 0 anomalías (Equipo íntegro)"
                      : `⚠️ ${anomalyCount} anomalía(s) marcada(s)`}
                  </Badge>
                </div>
                <Text size="xs" c="dimmed">
                  Por defecto todo está <span className="text-emerald-500 font-bold">OK</span>. Toca únicamente los componentes que presenten <span className="text-rose-500 font-bold">daño o falla</span>.
                </Text>
              </div>
            </Group>

            <Button
              variant="light"
              color="gray"
              size="xs"
              leftSection={<IconRefresh size={14} />}
              onClick={handleResetToAllGood}
              className="font-sirac-title text-xs font-bold cursor-pointer"
            >
              Restablecer a Todo OK
            </Button>
          </Group>

          <Divider color="var(--border-subtle)" />

          {/* Grupos de Componentes para la Categoría */}
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
                    const isAnomaly = isItemInAnomaly(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => toggleItemAnomaly(item.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 font-sirac-title ${
                          isAnomaly
                            ? "bg-rose-50 dark:bg-rose-950/30 border-rose-500 dark:border-rose-500/70 shadow-xs scale-101"
                            : "bg-white dark:bg-[#0b1320] border-slate-200 dark:border-[#243f5d] hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ThemeIcon
                            size="xs"
                            radius="xl"
                            color={isAnomaly ? "rose" : "teal"}
                            variant={isAnomaly ? "filled" : "light"}
                          >
                            {isAnomaly ? <IconAlertCircle size={11} strokeWidth={3} /> : <IconCheck size={11} strokeWidth={3} />}
                          </ThemeIcon>
                          <span
                            className={`text-xs font-bold ${
                              isAnomaly
                                ? "text-rose-900 dark:text-rose-200"
                                : "text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {/* Badge de estado */}
                        <Badge
                          size="xs"
                          color={isAnomaly ? "rose" : "teal"}
                          variant={isAnomaly ? "filled" : "subtle"}
                          className="shrink-0 font-sirac-title font-bold text-[10px]"
                        >
                          {isAnomaly ? "FALLA" : "OK"}
                        </Badge>
                      </button>
                    );
                  })}
                </SimpleGrid>
              </div>
            ))}
          </div>
        </Stack>
      </Paper>

      {/* ── 3. Cláusula de Responsabilidad Técnica ── */}
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
            Se notificó al cliente sobre los riesgos inherentes de apertura, fragilidad de pantallas,
            desgaste previo de flexes y posibles fallas en placas con sulfato o microfisuras.
          </Text>
          <Checkbox
            label="Riesgos explicados y aceptados por el cliente"
            fw={700}
            color="orange"
            {...form.getInputProps("checklist.riesgos_explicados", {
              type: "checkbox",
            })}
            className="font-sirac-title text-xs cursor-pointer"
          />
        </Group>
      </Alert>
    </Stack>
  );
}
