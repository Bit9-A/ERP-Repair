import { useState } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  SimpleGrid,
  Text,
  Paper,
  Group,
  Switch,
  Popover,
  ThemeIcon,
  Button,
} from "@mantine/core";
import {
  IconLock,
  IconFingerprint,
  IconAlertCircle,
  IconNotes,
  IconShieldCheck,
  IconShieldLock,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import { PatternCanvas } from "../PatternCanvas";

interface Step3SecurityFaultPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  initialData?: any;
}

export function Step3SecurityFaultPanel({
  form,
  initialData,
}: Step3SecurityFaultPanelProps) {
  const hasExistingLock = Boolean(
    form.values.clave?.trim() || form.values.patron_visual?.trim()
  );
  const [hasPassword, setHasPassword] = useState<boolean>(
    hasExistingLock || (initialData?.clave || initialData?.patron_visual ? true : false)
  );

  const handleTogglePassword = (checked: boolean) => {
    setHasPassword(checked);
    if (!checked) {
      form.setFieldValue("clave", "");
      form.setFieldValue("patron_visual", "");
    }
  };

  return (
    <Stack gap="lg">
      {/* ── Seguridad y Desbloqueo ── */}
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
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon
                size="lg"
                radius="md"
                variant="light"
                color={hasPassword ? "indigo" : "gray"}
              >
                {hasPassword ? <IconShieldLock size={20} /> : <IconShieldCheck size={20} />}
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" className="font-heading">
                  Seguridad y Bloqueo de Pantalla
                </Text>
                <Text size="xs" c="dimmed">
                  ¿El equipo requiere PIN, contraseña o patrón para pruebas técnicas?
                </Text>
              </div>
            </Group>

            <Switch
              size="md"
              checked={hasPassword}
              onChange={(e) => handleTogglePassword(e.currentTarget.checked)}
              label={hasPassword ? "Tiene contraseña / bloqueo" : "Sin contraseña"}
              color="indigo"
            />
          </Group>

          {hasPassword && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(99, 102, 241, 0.05)",
                border: "1px dashed rgba(99, 102, 241, 0.25)",
              }}
            >
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label="PIN / Contraseña alfanumérica"
                  placeholder="Ej: 1234 o MiClave2024"
                  leftSection={<IconLock size={16} />}
                  {...form.getInputProps("clave")}
                />

                <Popover width={300} position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <TextInput
                      label="Patrón Visual de Puntos"
                      placeholder="Click para dibujar patrón"
                      readOnly
                      leftSection={<IconFingerprint size={16} />}
                      style={{ cursor: "pointer" }}
                      value={form.values.patron_visual || ""}
                      rightSection={
                        form.values.patron_visual ? (
                          <Button
                            variant="subtle"
                            size="compact-xs"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setFieldValue("patron_visual", "");
                            }}
                          >
                            Limpiar
                          </Button>
                        ) : undefined
                      }
                      description={
                        form.values.patron_visual
                          ? `Secuencia guardada: ${form.values.patron_visual}`
                          : "Haz clic para trazar el patrón 3x3"
                      }
                    />
                  </Popover.Target>
                  <Popover.Dropdown bg="gray.9">
                    <Text size="xs" fw={700} mb="xs" c="white" ta="center">
                      {initialData
                        ? "PATRÓN GUARDADO (ANIMACIÓN)"
                        : "DIBUJA EL PATRÓN EN LOS PUNTOS"}
                    </Text>
                    <PatternCanvas
                      mode={initialData ? "view" : "draw"}
                      value={form.values.patron_visual || ""}
                      onPatternComplete={(pattern) =>
                        form.setFieldValue("patron_visual", pattern)
                      }
                      aria-label="Dibujo de Patrón de desbloqueo"
                    />
                  </Popover.Dropdown>
                </Popover>
              </SimpleGrid>
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* ── Falla Reportada y Observaciones ── */}
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
          <div>
            <Text fw={700} size="sm" className="font-heading">
              Diagnóstico y Falla Reportada
            </Text>
            <Text size="xs" c="dimmed">
              Describe en detalle lo manifestado por el cliente y el estado físico de recepción
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Textarea
              label="Falla Reportada por el Cliente"
              placeholder="Ej: No enciende tras caída, o la pantalla parpadea en verde..."
              required
              minRows={4}
              leftSection={<IconAlertCircle size={16} />}
              {...form.getInputProps("falla")}
              error={form.errors.falla}
              description="Mínimo 5 caracteres explicando el problema"
            />

            <Textarea
              label="Observaciones Físicas y de Recepción"
              placeholder="Ej: Pantalla rayada en esquina superior, falta botón de volumen..."
              minRows={4}
              leftSection={<IconNotes size={16} />}
              {...form.getInputProps("observaciones")}
              description="Detalles de golpes, rayones o componentes externos faltantes"
            />
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  );
}
