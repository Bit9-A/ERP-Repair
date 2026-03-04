import {
  Container,
  Group,
  Title,
  Button,
  TextInput,
  Paper,
  Stack,
  Loader,
} from "@mantine/core";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";
import { useState, useMemo } from "react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from "../../../services/hooks/useClients";
import type { Cliente } from "../../../services/clients.service";
import { ClientTable } from "../components/ClientTable";
import { ClientForm, type ClientFormValues } from "../components/ClientForm";

export function ClientsPage() {
  const [search, setSearch] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);

  const { data: clients = [], isLoading } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const lower = search.toLowerCase();
    return clients.filter(
      (c) =>
        c.nombre.toLowerCase().includes(lower) ||
        c.cedula.toLowerCase().includes(lower) ||
        c.telefono.includes(lower),
    );
  }, [clients, search]);

  const handleNew = () => {
    setEditingClient(null);
    open();
  };

  const handleEdit = (client: Cliente) => {
    setEditingClient(client);
    open();
  };

  const handleDelete = async (client: Cliente) => {
    try {
      await deleteClient.mutateAsync(client.id);
      notifications.show({
        title: "Cliente eliminado",
        message: `${client.nombre} ha sido eliminado.`,
        color: "red",
      });
    } catch (e: any) {
      notifications.show({
        title: "Error al eliminar",
        message: e.response?.data?.error || "Error desconocido",
        color: "red",
      });
    }
  };

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      if (editingClient) {
        await updateClient.mutateAsync({
          id: editingClient.id,
          nombre: values.nombre,
          telefono: values.telefono,
          correo: values.correo,
        });
        notifications.show({
          title: "Cliente actualizado",
          message: "Los datos se guardaron correctamente.",
          color: "green",
        });
      } else {
        await createClient.mutateAsync({
          nombre: values.nombre,
          cedula: values.cedula,
          telefono: values.telefono,
          correo: values.correo,
        });
        notifications.show({
          title: "Cliente registrado",
          message: `${values.nombre} ha sido agregado.`,
          color: "green",
        });
      }
      close();
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e.response?.data?.error || "Revisa los datos.",
        color: "red",
      });
    }
  };

  return (
    <Container fluid p="md">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Title order={2}>Clientes</Title>
          <Group>
            <TextInput
              placeholder="Buscar por nombre, cédula o teléfono..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ width: 300 }}
            />
            <Button
              leftSection={<IconUserPlus size={16} />}
              onClick={handleNew}
            >
              Nuevo Cliente
            </Button>
          </Group>
        </Group>

        {/* Content */}
        {isLoading ? (
          <Group justify="center" p="xl">
            <Loader size="lg" />
          </Group>
        ) : (
          <Paper withBorder radius="md" p="0" style={{ overflow: "hidden" }}>
            <ClientTable
              clients={filteredClients}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Paper>
        )}
      </Stack>

      <ClientForm
        opened={opened}
        onClose={close}
        onSubmit={handleSubmit}
        initialData={editingClient}
      />
    </Container>
  );
}
