import {
  Stack,
  TextInput,
  Loader,
  Paper,
  Group,
  Text,
  Badge,
  SimpleGrid,
  Button,
  Select,
  ThemeIcon,
  Box,
} from "@mantine/core";
import {
  IconSearch,
  IconUserCheck,
  IconUserPlus,
  IconBuildingStore,
  IconArrowRight,
  IconPhone,
  IconMail,
  IconId,
  IconSparkles,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";

interface Step1ClientPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  state: {
    cedula: string;
    setCedula: (val: string) => void;
    clienteNombre: string;
    setClienteNombre: (val: string) => void;
    clienteTelefono: string;
    setClienteTelefono: (val: string) => void;
    clienteCorreo: string;
    setClienteCorreo: (val: string) => void;
  };
  queries: {
    foundClient: any;
    searchingClient: boolean;
    sucursalOptions: { value: string; label: string }[];
    loadingSucursales: boolean;
  };
  actions: {
    createClient: any;
  };
  canEditSucursal?: boolean;
  onProceedNext?: () => void;
}

export function Step1ClientPanel({
  form,
  state,
  queries,
  actions,
  canEditSucursal = true,
  onProceedNext,
}: Step1ClientPanelProps) {
  const {
    cedula,
    setCedula,
    clienteNombre,
    setClienteNombre,
    clienteTelefono,
    setClienteTelefono,
    clienteCorreo,
    setClienteCorreo,
  } = state;
  const { foundClient, searchingClient, sucursalOptions, loadingSucursales } = queries;
  const { createClient } = actions;

  const handleRegisterClient = async () => {
    try {
      const newClient = await createClient.mutateAsync({
        nombre: clienteNombre.trim(),
        cedula: cedula.trim(),
        telefono: clienteTelefono.trim(),
        correo: clienteCorreo.trim() || undefined,
      });
      form.setFieldValue("clienteId", newClient.id);
      if (onProceedNext) {
        onProceedNext();
      }
    } catch {
      // Notification handled in hook
    }
  };

  return (
    <Stack gap="lg">
      {/* ── Sucursal selector ── */}
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Group align="flex-start" gap="md" wrap="nowrap">
          <ThemeIcon size="lg" radius="md" variant="light" color="indigo">
            <IconBuildingStore size={20} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Select
              label="Sucursal de Recepción"
              description={
                !canEditSucursal
                  ? "Asignada automáticamente a tu sede operativa"
                  : "Selecciona el centro de servicio donde ingresa la orden"
              }
              placeholder="Seleccionar sucursal..."
              required
              data={sucursalOptions}
              {...form.getInputProps("sucursalId")}
              leftSection={<IconBuildingStore size={16} />}
              rightSection={loadingSucursales ? <Loader size={14} /> : undefined}
              searchable
              disabled={loadingSucursales || !canEditSucursal}
            />
          </Box>
        </Group>
      </Paper>

      {/* ── Cliente Lookup Section ── */}
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
          <Group justify="space-between" align="center">
            <div>
              <Text fw={700} size="md" className="font-heading">
                Identificación del Cliente
              </Text>
              <Text size="xs" c="dimmed">
                Ingresa la cédula o documento de identidad para buscar o crear al cliente
              </Text>
            </div>
            {form.values.clienteId && (
              <Badge color="green" variant="light" size="sm" leftSection={<IconUserCheck size={12} />}>
                Cliente Vinculado
              </Badge>
            )}
          </Group>

          <TextInput
            label="Cédula / Documento"
            placeholder="Ej: V-18459123 o 1098..."
            required
            size="md"
            error={form.errors.clienteId}
            value={cedula}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setCedula(val);
              setClienteNombre("");
              setClienteTelefono("");
              setClienteCorreo("");
            }}
            leftSection={<IconSearch size={18} />}
            rightSection={
              searchingClient ? (
                <Loader size={16} />
              ) : foundClient ? (
                <IconUserCheck size={18} color="var(--mantine-color-green-6)" />
              ) : undefined
            }
          />

          {/* ── Caso A: Cliente Encontrado ── */}
          {foundClient && cedula.length >= 3 && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
              }}
            >
              <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Group gap="sm">
                  <ThemeIcon size="xl" radius="xl" color="green" variant="filled">
                    <IconUserCheck size={20} />
                  </ThemeIcon>
                  <div>
                    <Group gap="xs">
                      <Text size="md" fw={700} className="font-heading">
                        {foundClient.nombre}
                      </Text>
                      <Badge variant="filled" color="green" size="xs">
                        Registrado
                      </Badge>
                    </Group>
                    <Group gap="md" mt={2}>
                      <Group gap={4}>
                        <IconId size={13} style={{ color: "var(--text-muted)" }} />
                        <Text size="xs" c="dimmed">
                          {foundClient.cedula}
                        </Text>
                      </Group>
                      {foundClient.telefono && (
                        <Group gap={4}>
                          <IconPhone size={13} style={{ color: "var(--text-muted)" }} />
                          <Text size="xs" c="dimmed">
                            {foundClient.telefono}
                          </Text>
                        </Group>
                      )}
                      {foundClient.correo && (
                        <Group gap={4}>
                          <IconMail size={13} style={{ color: "var(--text-muted)" }} />
                          <Text size="xs" c="dimmed">
                            {foundClient.correo}
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </div>
                </Group>

                <Group gap="xs">
                  <Badge variant="light" color="blue" size="md">
                    {foundClient._count?.tickets ?? 0} reparaciones previas
                  </Badge>
                  {onProceedNext && (
                    <Button
                      size="sm"
                      color="green"
                      rightSection={<IconArrowRight size={15} />}
                      onClick={onProceedNext}
                    >
                      Continuar al Equipo
                    </Button>
                  )}
                </Group>
              </Group>
            </Paper>
          )}

          {/* ── Caso B: Cliente No Encontrado (Registro Rápido) ── */}
          {!foundClient && cedula.length >= 3 && !searchingClient && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px dashed rgba(59, 130, 246, 0.3)",
              }}
            >
              <Group gap="xs" mb="sm">
                <ThemeIcon size="md" radius="md" color="blue" variant="light">
                  <IconUserPlus size={16} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={700} c="blue">
                    Cliente no registrado — Alta rápida en el sistema
                  </Text>
                  <Text size="xs" c="dimmed">
                    Completa estos datos básicos para darlo de alta y continuar con la orden
                  </Text>
                </div>
              </Group>

              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="xs">
                <TextInput
                  label="Nombre Completo"
                  placeholder="Ej: Carlos Mendoza"
                  required
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.currentTarget.value)}
                  size="sm"
                />
                <TextInput
                  label="Teléfono Móvil"
                  placeholder="Ej: 0414-1234567"
                  required
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.currentTarget.value)}
                  size="sm"
                />
                <TextInput
                  label="Correo Electrónico (Opcional)"
                  placeholder="ejemplo@correo.com"
                  value={clienteCorreo}
                  onChange={(e) => setClienteCorreo(e.currentTarget.value)}
                  size="sm"
                />
              </SimpleGrid>

              <Group justify="flex-end" mt="md">
                <Button
                  size="sm"
                  color="blue"
                  leftSection={<IconSparkles size={15} />}
                  rightSection={<IconArrowRight size={15} />}
                  disabled={!clienteNombre.trim() || !clienteTelefono.trim()}
                  loading={createClient.isPending}
                  onClick={handleRegisterClient}
                >
                  Registrar y Continuar
                </Button>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

