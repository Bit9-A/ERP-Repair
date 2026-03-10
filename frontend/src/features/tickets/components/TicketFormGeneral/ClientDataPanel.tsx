import {
  Accordion,
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
} from "@mantine/core";
import { IconSearch, IconUserCheck, IconUserPlus, IconBuildingStore } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";

interface ClientDataPanelProps {
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
}

export function ClientDataPanel({
  form,
  state,
  queries,
  actions,
}: ClientDataPanelProps) {
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

  return (
    <Accordion.Item value="sucursal">
      <Accordion.Control>
        <Text fw={600}>1. Datos de Sucursal</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          {/* Sucursal Selector */}
          <Select
            label="Sucursal de Reparación"
            placeholder="Seleccione la sucursal"
            required
            data={sucursalOptions}
            {...form.getInputProps("sucursalId")}
            leftSection={<IconBuildingStore size={16} />}
            rightSection={loadingSucursales ? <Loader size={14} /> : undefined}
            searchable
            mb="xs"
            disabled={loadingSucursales}
          />

          {/* Cédula lookup field */}
          <Text fw={600}>2. Datos de Cliente</Text>
          <TextInput
            label="Cédula del Cliente"
            placeholder="V-12345678"
            required
            error={form.errors.clienteId}
            value={cedula}
            onChange={(e) => {
              const val = e.currentTarget.value;
              setCedula(val);
              // Reset new-client fields when cedula changes
              setClienteNombre("");
              setClienteTelefono("");
              setClienteCorreo("");
            }}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchingClient ? (
                <Loader size={14} />
              ) : foundClient ? (
                <IconUserCheck size={16} color="var(--mantine-color-green-6)" />
              ) : undefined
            }
            description={
              cedula.length >= 3 && !searchingClient
                ? foundClient
                  ? "✅ Cliente encontrado"
                  : "Cliente no registrado — completa los datos abajo"
                : "Escribe al menos 3 caracteres"
            }
          />

          {/* Client found card */}
          {foundClient && cedula.length >= 3 && (
            <Paper
              p="sm"
              radius="md"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <IconUserCheck
                    size={18}
                    color="var(--mantine-color-green-6)"
                  />
                  <div>
                    <Text size="sm" fw={600}>
                      {foundClient.nombre}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {foundClient.cedula} • {foundClient.telefono}
                      {foundClient.correo ? ` • ${foundClient.correo}` : ""}
                    </Text>
                  </div>
                </Group>
                <Badge variant="light" color="green" size="sm">
                  {foundClient._count?.tickets ?? 0} tickets
                </Badge>
              </Group>
            </Paper>
          )}

          {/* New client form (when not found) */}
          {!foundClient && cedula.length >= 3 && !searchingClient && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(59, 130, 246, 0.05)",
                border: "1px dashed rgba(59, 130, 246, 0.2)",
              }}
            >
              <Group gap="xs" mb="sm">
                <IconUserPlus size={16} color="var(--mantine-color-blue-6)" />
                <Text size="sm" fw={600}>
                  Nuevo Cliente
                </Text>
              </Group>
              <SimpleGrid cols={{ base: 1, sm: 3 }}>
                <TextInput
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  required
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.currentTarget.value)}
                  size="sm"
                />
                <TextInput
                  label="Teléfono"
                  placeholder="0414-1234567"
                  required
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.currentTarget.value)}
                  size="sm"
                />
                <TextInput
                  label="Correo (opcional)"
                  placeholder="email@ejemplo.com"
                  value={clienteCorreo}
                  onChange={(e) => setClienteCorreo(e.currentTarget.value)}
                  size="sm"
                />
              </SimpleGrid>
              <Button
                mt="sm"
                size="sm"
                leftSection={<IconUserPlus size={14} />}
                disabled={!clienteNombre.trim() || !clienteTelefono.trim()}
                loading={createClient.isPending}
                onClick={async () => {
                  try {
                    const newClient = await createClient.mutateAsync({
                      nombre: clienteNombre.trim(),
                      cedula: cedula.trim(),
                      telefono: clienteTelefono.trim(),
                      correo: clienteCorreo.trim() || undefined,
                    });
                    form.setFieldValue("clienteId", newClient.id);
                  } catch {
                    // notification handled in parent or here
                  }
                }}
              >
                Registrar Cliente
              </Button>
            </Paper>
          )}
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
