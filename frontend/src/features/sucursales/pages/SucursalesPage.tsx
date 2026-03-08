import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Stack,
  Title,
  Group,
  Button,
  Text,
  Paper,
  SimpleGrid,
  Badge,
  ActionIcon,
  Tooltip,
  Loader,
  Box,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconPlus,
  IconArrowsExchange,
  IconStar,
  IconStarFilled,
  IconBuildingStore,
  IconCheck,
  IconX,
  IconUsers,
  IconShoppingCart,
  IconPackage,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import {
  useSucursales,
  useSetSucursalPrincipal,
  useDeleteSucursal,
} from "../../../services";
import type { Sucursal } from "../../../types";
import { SucursalFormModal } from "../components/SucursalFormModal";
import { TransferModal } from "../components/TransferModal";

// ── Main Page ────────────────────────────────────────────────────────────────
export function SucursalesPage() {
  const navigate = useNavigate();
  const { data: sucursales = [], isLoading } = useSucursales();
  const setPrincipal = useSetSucursalPrincipal();
  const deleteSucursal = useDeleteSucursal();

  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);
  const [editData, setEditData] = useState<Sucursal | null>(null);
  const [transferOpened, { open: openTransfer, close: closeTransfer }] =
    useDisclosure(false);

  const handleEdit = (s: Sucursal) => {
    setEditData(s);
    openForm();
  };

  const handleNew = () => {
    setEditData(null);
    openForm();
  };

  const handleViewInventario = (sucursal: Sucursal) => {
    navigate(`/inventario?sucursalId=${sucursal.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta sucursal? Esta acción no se puede deshacer."))
      return;
    try {
      await deleteSucursal.mutateAsync(id);
      notifications.show({ message: "Sucursal eliminada", color: "orange" });
    } catch {
      notifications.show({
        message: "No se pudo eliminar la sucursal",
        color: "red",
      });
    }
  };

  const handleSetPrincipal = async (id: string, nombre: string) => {
    try {
      await setPrincipal.mutateAsync(id);
      notifications.show({
        message: `${nombre} ahora es la sucursal principal`,
        color: "yellow",
      });
    } catch {
      notifications.show({
        message: "Error al cambiar sucursal principal",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Title order={2}>Sucursales</Title>
        </Group>
        <Group gap="sm">
          <Button
            variant="light"
            color="blue"
            leftSection={<IconArrowsExchange size={16} />}
            onClick={openTransfer}
          >
            Trasladar Mercancia
          </Button>
          <Button leftSection={<IconPlus size={16} />} onClick={handleNew}>
            Nueva Sucursal
          </Button>
        </Group>
      </Group>

      {/* Loading */}
      {isLoading && (
        <Group justify="center" py="xl">
          <Loader size="md" />
        </Group>
      )}

      {/* Grid of branch cards */}
      {!isLoading && sucursales.length === 0 && (
        <Paper
          p="xl"
          radius="lg"
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border-subtle)",
            textAlign: "center",
          }}
        >
          <ThemeIcon
            size="xl"
            radius="xl"
            variant="light"
            color="brand"
            mb="md"
          >
            <IconBuildingStore size={28} />
          </ThemeIcon>
          <Text c="dimmed">No hay sucursales registradas aún.</Text>
          <Button
            mt="md"
            leftSection={<IconPlus size={14} />}
            onClick={handleNew}
          >
            Crear primera sucursal
          </Button>
        </Paper>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {sucursales.map((s) => (
          <Paper
            key={s.id}
            radius="lg"
            p="lg"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Active indicator */}
            <Box
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: s.activa
                  ? "linear-gradient(90deg, var(--primary), #22c55e)"
                  : "var(--mantine-color-gray-6)",
              }}
            />

            <Group justify="space-between" align="flex-start" mb="md">
              <Box>
                <Group gap="xs" mb={4}>
                  <ThemeIcon
                    size="md"
                    radius="md"
                    variant="light"
                    color="brand"
                  >
                    <IconBuilding size={16} />
                  </ThemeIcon>
                  <Text fw={700} size="md">
                    {s.nombre}
                  </Text>
                  {s.principal && (
                    <Badge
                      size="xs"
                      color="yellow"
                      variant="light"
                      leftSection={<IconStarFilled size={10} />}
                    >
                      Principal
                    </Badge>
                  )}
                </Group>
                {s.direccion && (
                  <Text size="xs" c="dimmed" ml={32}>
                    {s.direccion}
                  </Text>
                )}
              </Box>
              <Badge
                variant="filled"
                color={s.activa ? "green" : "gray"}
                size="sm"
                leftSection={
                  s.activa ? <IconCheck size={10} /> : <IconX size={10} />
                }
              >
                {s.activa ? "Activa" : "Inactiva"}
              </Badge>
            </Group>

            <Divider mb="md" />

            {/* Stats */}
            <SimpleGrid cols={3} spacing="xs" mb="md">
              <Box ta="center">
                <ThemeIcon
                  size="sm"
                  variant="light"
                  color="blue"
                  mx="auto"
                  mb={4}
                >
                  <IconUsers size={12} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Usuarios
                </Text>
                <Text fw={700} size="sm">
                  {s._count?.usuarios ?? "—"}
                </Text>
              </Box>
              <Box ta="center">
                <ThemeIcon
                  size="sm"
                  variant="light"
                  color="violet"
                  mx="auto"
                  mb={4}
                >
                  <IconShoppingCart size={12} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Ventas
                </Text>
                <Text fw={700} size="sm">
                  {s._count?.ventas ?? "—"}
                </Text>
              </Box>
              <Box ta="center">
                <ThemeIcon
                  size="sm"
                  variant="light"
                  color="orange"
                  mx="auto"
                  mb={4}
                >
                  <IconPackage size={12} />
                </ThemeIcon>
                <Text size="xs" c="dimmed">
                  Tickets
                </Text>
                <Text fw={700} size="sm">
                  {s._count?.tickets ?? "—"}
                </Text>
              </Box>
            </SimpleGrid>

            {/* Actions */}
            <Group gap="xs" mt="xs">
              <Button
                variant="light"
                size="xs"
                leftSection={<IconPackage size={14} />}
                onClick={() => handleViewInventario(s)}
                flex={1}
              >
                Ver Inventario
              </Button>
              <Tooltip label="Editar">
                <ActionIcon
                  variant="subtle"
                  color="blue"
                  onClick={() => handleEdit(s)}
                >
                  <IconEdit size={16} />
                </ActionIcon>
              </Tooltip>
              {!s.principal && (
                <Tooltip label="Hacer principal">
                  <ActionIcon
                    variant="subtle"
                    color="yellow"
                    onClick={() => handleSetPrincipal(s.id, s.nombre)}
                  >
                    <IconStar size={16} />
                  </ActionIcon>
                </Tooltip>
              )}
              <Tooltip label="Eliminar">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleDelete(s.id)}
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Modals */}
      <SucursalFormModal
        opened={formOpened}
        onClose={closeForm}
        editData={editData}
      />

      <TransferModal opened={transferOpened} onClose={closeTransfer} />
    </Stack>
  );
}
