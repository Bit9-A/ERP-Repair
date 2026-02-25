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
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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

// -- Demo data matching new schema --
const DEMO_USERS: Usuario[] = [
  {
    id: "u1",
    nombre: "Carlos Mendoza",
    rol: "ADMIN",
    email: "carlos@tecnopro.com",
    porcentaje_comision_base: 0,
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "u2",
    nombre: "María López",
    rol: "TECNICO",
    email: "maria@tecnopro.com",
    porcentaje_comision_base: 0.4,
    createdAt: "2025-02-10T08:30:00Z",
  },
  {
    id: "u3",
    nombre: "José Ramírez",
    rol: "TECNICO",
    email: "jose@tecnopro.com",
    porcentaje_comision_base: 0.25,
    createdAt: "2025-03-05T09:15:00Z",
  },
  {
    id: "u4",
    nombre: "Ana García",
    rol: "VENDEDOR",
    email: "ana@tecnopro.com",
    porcentaje_comision_base: 0.15,
    createdAt: "2025-04-20T11:00:00Z",
  },
  {
    id: "u5",
    nombre: "Pedro Castillo",
    rol: "TECNICO",
    email: "pedro@tecnopro.com",
    porcentaje_comision_base: 0.35,
    createdAt: "2025-05-12T14:00:00Z",
  },
  {
    id: "u6",
    nombre: "Luisa Fernández",
    rol: "ADMIN",
    email: "luisa@tecnopro.com",
    porcentaje_comision_base: 0,
    createdAt: "2025-06-01T07:45:00Z",
  },
];

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [users] = useState<Usuario[]>(DEMO_USERS);
  const [editUser, setEditUser] = useState<Usuario | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

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

  const handleSubmit = (_values: UserFormValues) => {
    // TODO: API call
    closeForm();
  };

  const handleDelete = (_user: Usuario) => {
    // TODO: confirm + API call
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconUsers size={24} color="var(--primary)" />
          <Title order={2} c="gray.1">
            Gestión de Usuarios
          </Title>
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
          overflow: "hidden",
        }}
      >
        {/* Table header with search + filters */}
        <Box p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconUsers size={18} color="var(--primary)" />
              <Text size="sm" fw={600} c="gray.1">
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
                  background: "rgba(255, 255, 255, 0.04)",
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

        {filtered.length === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No se encontraron usuarios
          </Text>
        )}

        {/* Footer */}
        <Divider color="dark.6" />
        <Group justify="space-between" p="md">
          <Group gap="xs">
            <Badge variant="dot" color="brand" size="xs">
              Sincronizado
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
