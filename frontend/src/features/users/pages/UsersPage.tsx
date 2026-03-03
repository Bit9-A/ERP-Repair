import { useState } from "react";
import {
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  Select,
  Badge,
  Divider,
  Box,
  LoadingOverlay,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconUsers,
  IconShieldCheck,
  IconTool,
  IconDownload,
  IconFilter,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { UserTable } from "../components/UserTable";
import { UserForm } from "../components/UserForm";
import type { Usuario } from "../../../types";
import type { UserFormValues } from "../types/users.types";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../../../services";

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  // -- API hooks --
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const filtered = users.filter(
    (u) =>
      (u.nombre.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (!roleFilter || roleFilter === "all" || u.rol === roleFilter),
  );

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.rol === "ADMIN").length;
  const totalTecnicos = users.filter((u) => u.rol === "TECNICO").length;

  const handleEdit = (user: Usuario) => {
    setEditUser(user);
    openForm();
  };

  const handleNew = () => {
    setEditUser(null);
    openForm();
  };

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (editUser) {
        await updateUser.mutateAsync({
          id: editUser.id,
          nombre: values.nombre,
          email: values.email,
          rol: values.rol,
          porcentaje_comision_base: values.porcentaje_comision_base,
        });
        notifications.show({
          title: "Usuario actualizado",
          message: `${values.nombre} fue actualizado correctamente`,
          color: "green",
        });
      } else {
        await createUser.mutateAsync({
          nombre: values.nombre,
          email: values.email,
          password: values.password,
          rol: values.rol,
          porcentaje_comision_base: values.porcentaje_comision_base,
        });
        notifications.show({
          title: "Usuario creado",
          message: `${values.nombre} fue creado correctamente`,
          color: "green",
        });
      }
      closeForm();
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo guardar el usuario",
        color: "red",
      });
    }
  };

  const handleDelete = async (user: Usuario) => {
    if (!confirm(`¿Eliminar a ${user.nombre}?`)) return;
    try {
      await deleteUser.mutateAsync(user.id);
      notifications.show({
        title: "Usuario eliminado",
        message: `${user.nombre} fue eliminado`,
        color: "orange",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo eliminar el usuario",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconUsers size={24} color="var(--primary)" />
          <Title order={2}>Gestión de Usuarios</Title>
        </Group>
        <Group gap="sm">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconDownload size={16} />}
            size="sm"
          >
            Exportar
          </Button>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleNew}
            size="sm"
          >
            Nuevo Usuario
          </Button>
        </Group>
      </Group>

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard
          title="Total Usuarios"
          value={totalUsers}
          icon={<IconUsers size={20} />}
          accentColor="var(--primary)"
        />
        <StatCard
          title="Administradores"
          value={totalAdmins}
          icon={<IconShieldCheck size={20} />}
          accentColor="var(--warning)"
        />
        <StatCard
          title="Técnicos"
          value={totalTecnicos}
          icon={<IconTool size={20} />}
          accentColor="var(--success)"
        />
      </SimpleGrid>

      {/* Table Section */}
      <Paper
        radius="lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
          overflow: "hidden",
        }}
      >
        {/* Table header with search + filters */}
        <Box p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconUsers size={18} color="var(--primary)" />
              <Text size="sm" fw={600}>
                Listado de Usuarios
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Mostrando {filtered.length} de {totalUsers} usuarios
            </Text>
          </Group>

          <Group gap="md">
            <TextInput
              placeholder="Buscar por nombre o email..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
              styles={{
                input: {
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
            <Select
              placeholder="Filtrar por rol"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: "all", label: "Todos" },
                { value: "ADMIN", label: "Administrador" },
                { value: "TECNICO", label: "Técnico" },
              ]}
              value={roleFilter}
              onChange={setRoleFilter}
              clearable
              w={180}
              size="sm"
              styles={{
                input: {
                  background: "rgba(255, 255, 255, 0.04)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
          </Group>
        </Box>

        <Divider color="dark.6" />

        {/* Table */}
        <UserTable
          users={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {filtered.length === 0 && !isLoading && (
          <Text ta="center" c="dimmed" py="xl">
            No se encontraron usuarios
          </Text>
        )}

        {/* Footer */}
        <Divider color="dark.6" />
        <Group justify="space-between" p="md">
          <Group gap="xs">
            <Badge variant="filled" color="brand" size="xs">
              {isLoading ? "Cargando..." : "Sincronizado"}
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* User Form Modal */}
      <UserForm
        opened={formOpened}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editUser}
      />
    </Stack>
  );
}
