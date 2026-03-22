import { useState, useEffect } from "react";
import { Group, Text, Divider, TextInput, Loader, Paper, Badge, SimpleGrid, Button } from "@mantine/core";
import { IconSearch, IconUserCheck, IconUserPlus } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useClientByCedula, useCreateClient } from "../../../../services";

interface ClientSectionProps {
  onClientSelect: (id: string | undefined) => void;
}

export function ClientSection({ onClientSelect }: ClientSectionProps) {
  const [cedula, setCedula] = useState("");
  const [newNombre, setNewNombre] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newCorreo, setNewCorreo] = useState("");
  
  const { data: foundClient, isFetching: searchingClient } = useClientByCedula(cedula);
  const createClient = useCreateClient();

  // Auto-set clienteId when found
  useEffect(() => {
    onClientSelect(foundClient?.id);
  }, [foundClient, onClientSelect]);

  const handleCreateClient = async () => {
    try {
      const newClient = await createClient.mutateAsync({
        nombre: newNombre.trim(),
        cedula: cedula.trim(),
        telefono: newTelefono.trim(),
        correo: newCorreo.trim() || undefined,
      });
      onClientSelect(newClient.id);
      notifications.show({
        title: "Cliente registrado",
        message: `${newClient.nombre} fue creado exitosamente`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo crear el cliente",
        color: "red",
      });
    }
  };

  return (
    <>
      <Divider
        label={
          <Group gap={6}>
            <IconSearch size={14} />
            <Text size="sm" fw={600}>
              Cliente (Opcional)
            </Text>
          </Group>
        }
        labelPosition="left"
      />

      {/* Cédula lookup */}
      <TextInput
        label="Cédula del Cliente"
        placeholder="V-12345678"
        value={cedula}
        onChange={(e) => {
          setCedula(e.currentTarget.value);
          setNewNombre("");
          setNewTelefono("");
          setNewCorreo("");
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
        size="sm"
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
              <IconUserCheck size={18} color="var(--mantine-color-green-6)" />
              <div>
                <Text size="sm" fw={600}>{foundClient.nombre}</Text>
                <Text size="xs" c="dimmed">
                  {foundClient.cedula} • {foundClient.telefono}
                  {foundClient.correo ? ` • ${foundClient.correo}` : ""}
                </Text>
              </div>
            </Group>
            <Badge variant="filled" color="green" size="sm">
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
            <Text size="sm" fw={600}>Nuevo Cliente</Text>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <TextInput
              label="Nombre completo"
              placeholder="Juan Pérez"
              required
              value={newNombre}
              onChange={(e) => setNewNombre(e.currentTarget.value)}
              size="sm"
            />
            <TextInput
              label="Teléfono"
              placeholder="0414-1234567"
              required
              value={newTelefono}
              onChange={(e) => setNewTelefono(e.currentTarget.value)}
              size="sm"
            />
            <TextInput
              label="Correo (opcional)"
              placeholder="email@ejemplo.com"
              value={newCorreo}
              onChange={(e) => setNewCorreo(e.currentTarget.value)}
              size="sm"
            />
          </SimpleGrid>
          <Button
            mt="sm"
            size="sm"
            leftSection={<IconUserPlus size={14} />}
            disabled={!newNombre.trim() || !newTelefono.trim()}
            loading={createClient.isPending}
            onClick={handleCreateClient}
          >
            Registrar Cliente
          </Button>
        </Paper>
      )}
    </>
  );
}
