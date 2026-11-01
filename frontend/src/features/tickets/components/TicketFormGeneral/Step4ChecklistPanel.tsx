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
} from "@mantine/core";
import {
  IconChecklist,
  IconAlertTriangle,
  IconScreenShare,
  IconBatteryCharging,
  IconWifi,
  IconCamera,
  IconTool,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";

interface Step4ChecklistPanelProps {
  form: UseFormReturnType<TicketFormValues>;
}

export function Step4ChecklistPanel({ form }: Step4ChecklistPanelProps) {
  const handleCheckAllGood = () => {
    form.setFieldValue("checklist.encendido", true);
    form.setFieldValue("checklist.touch", true);
    form.setFieldValue("checklist.bateria", true);
    form.setFieldValue("checklist.puerto_carga", true);
    form.setFieldValue("checklist.senal", true);
    form.setFieldValue("checklist.conectividad_wifi_bt", true);
    form.setFieldValue("checklist.camaras", true);
    form.setFieldValue("checklist.audio", true);
    form.setFieldValue("checklist.botones", true);
    form.setFieldValue("checklist.flash_linterna", true);
    form.setFieldValue("checklist.biometria", true);
    form.setFieldValue("checklist.sensor_proximidad", true);
    form.setFieldValue("checklist.riesgos_explicados", true);
  };

  const handleResetChecklist = () => {
    form.setFieldValue("checklist", {
      camaras: false,
      touch: false,
      senal: false,
      encendido: false,
      botones: false,
      bateria: false,
      carcasa_rota: false,
      accesorios_sim_sd: false,
      funda: false,
      uso_diario_desgaste: false,
      biometria: false,
      audio: false,
      sensor_proximidad: false,
      puerto_carga: false,
      conectividad_wifi_bt: false,
      flash_linterna: false,
      pantalla_fallas_internas: false,
      tornilleria_faltante: false,
      riesgos_explicados: false,
    });
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
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="teal" variant="light">
                <IconChecklist size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" className="font-heading">
                  Inspección y Test Inicial de Recepción
                </Text>
                <Text size="xs" c="dimmed">
                  Verifica el estado físico y operativo de los componentes clave al recibir el equipo
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
              >
                Buen Estado General
              </Button>
              <Button
                variant="subtle"
                color="gray"
                size="xs"
                leftSection={<IconX size={14} />}
                onClick={handleResetChecklist}
              >
                Limpiar Todo
              </Button>
            </Group>
          </Group>

          <Divider color="var(--border-subtle)" />

          {/* ── Categoría 1: Pantalla y Display ── */}
          <div>
            <Group gap="xs" mb="xs">
              <IconScreenShare size={16} color="var(--mantine-color-blue-6)" />
              <Text size="xs" fw={700} tt="uppercase" c="blue" lts={0.5}>
                Pantalla & Visualización
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
              <Checkbox
                label="Touch / Digitalizador funcional"
                {...form.getInputProps("checklist.touch", { type: "checkbox" })}
              />
              <Checkbox
                label="Pantalla con fallas internas / manchas"
                {...form.getInputProps("checklist.pantalla_fallas_internas", {
                  type: "checkbox",
                })}
              />
            </SimpleGrid>
          </div>

          {/* ── Categoría 2: Energía y Encendido ── */}
          <div>
            <Group gap="xs" mb="xs">
              <IconBatteryCharging size={16} color="var(--mantine-color-green-6)" />
              <Text size="xs" fw={700} tt="uppercase" c="green" lts={0.5}>
                Energía & Encendido
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <Checkbox
                label="Enciende (Power / Boot)"
                {...form.getInputProps("checklist.encendido", { type: "checkbox" })}
              />
              <Checkbox
                label="Batería retiene carga"
                {...form.getInputProps("checklist.bateria", { type: "checkbox" })}
              />
              <Checkbox
                label="Puerto de carga operativo"
                {...form.getInputProps("checklist.puerto_carga", {
                  type: "checkbox",
                })}
              />
            </SimpleGrid>
          </div>

          {/* ── Categoría 3: Conectividad y Sensores ── */}
          <div>
            <Group gap="xs" mb="xs">
              <IconWifi size={16} color="var(--mantine-color-indigo-6)" />
              <Text size="xs" fw={700} tt="uppercase" c="indigo" lts={0.5}>
                Conectividad & Sensores
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
              <Checkbox
                label="Señal móvil / Antenas"
                {...form.getInputProps("checklist.senal", { type: "checkbox" })}
              />
              <Checkbox
                label="Wi-Fi y Bluetooth"
                {...form.getInputProps("checklist.conectividad_wifi_bt", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Biometría (Huella/FaceID)"
                {...form.getInputProps("checklist.biometria", { type: "checkbox" })}
              />
              <Checkbox
                label="Sensor de proximidad"
                {...form.getInputProps("checklist.sensor_proximidad", {
                  type: "checkbox",
                })}
              />
            </SimpleGrid>
          </div>

          {/* ── Categoría 4: Multimedia y Botones ── */}
          <div>
            <Group gap="xs" mb="xs">
              <IconCamera size={16} color="var(--mantine-color-violet-6)" />
              <Text size="xs" fw={700} tt="uppercase" c="violet" lts={0.5}>
                Multimedia & Botones
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
              <Checkbox
                label="Cámaras (Frontal/Trasera)"
                {...form.getInputProps("checklist.camaras", { type: "checkbox" })}
              />
              <Checkbox
                label="Audio (Altavoz/Auricular)"
                {...form.getInputProps("checklist.audio", { type: "checkbox" })}
              />
              <Checkbox
                label="Botones de volumen y power"
                {...form.getInputProps("checklist.botones", { type: "checkbox" })}
              />
              <Checkbox
                label="Flash / Linterna"
                {...form.getInputProps("checklist.flash_linterna", {
                  type: "checkbox",
                })}
              />
            </SimpleGrid>
          </div>

          {/* ── Categoría 5: Cosmética y Accesorios ── */}
          <div>
            <Group gap="xs" mb="xs">
              <IconTool size={16} color="var(--mantine-color-gray-6)" />
              <Text size="xs" fw={700} tt="uppercase" c="dimmed" lts={0.5}>
                Estado Físico & Accesorios
              </Text>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
              <Checkbox
                label="Carcasa o tapa rota"
                {...form.getInputProps("checklist.carcasa_rota", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Tornillería faltante"
                {...form.getInputProps("checklist.tornilleria_faltante", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Bandeja SIM / MicroSD presente"
                {...form.getInputProps("checklist.accesorios_sim_sd", {
                  type: "checkbox",
                })}
              />
              <Checkbox
                label="Trae funda / forro protector"
                {...form.getInputProps("checklist.funda", { type: "checkbox" })}
              />
              <Checkbox
                label="Desgaste por uso diario"
                {...form.getInputProps("checklist.uso_diario_desgaste", {
                  type: "checkbox",
                })}
              />
            </SimpleGrid>
          </div>
        </Stack>
      </Paper>

      {/* ── Advertencia de Riesgos Legales / Taller ── */}
      <Alert
        icon={<IconAlertTriangle size={18} />}
        title="Cláusula de Responsabilidad Técnica"
        color="orange"
        radius="md"
        styles={{
          root: {
            border: "1px solid rgba(245, 158, 11, 0.3)",
          },
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap">
          <Text size="xs" style={{ flex: 1, minWidth: 240 }}>
            Indica si se explicaron al cliente los riesgos inherentes a la manipulación técnica
            (pantallas frágiles, desgaste de flexes internos o cortocircuitos previos).
          </Text>
          <Checkbox
            label="Riesgos explicados y aceptados por el cliente"
            fw={700}
            color="orange"
            {...form.getInputProps("checklist.riesgos_explicados", {
              type: "checkbox",
            })}
          />
        </Group>
      </Alert>
    </Stack>
  );
}

