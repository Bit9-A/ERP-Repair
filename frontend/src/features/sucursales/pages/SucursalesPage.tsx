import { useState } from "react";
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
  Modal,
  TextInput,
  Textarea,
  Switch,
  Loader,
  Box,
  Divider,
  Table,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconPlus,
  IconEdit,
  IconTrash,
  IconPackage,
  IconUsers,
  IconShoppingCart,
  IconCheck,
  IconX,
  IconBuildingStore,
  IconArrowsExchange,
} from "@tabler/icons-react";
import {
  useSucursales,
  useCreateSucursal,
  useUpdateSucursal,
  useDeleteSucursal,
  useSucursalInventario,
} from "../../../services";
import type { Sucursal } from "../../../types";
import { TransferModal } from "../components/TransferModal";

// ── Sub-component: Sucursal Inventory Modal ──────────────────────────────────
function InventarioModal({
  sucursal,
  opened,
  onClose,
}: {
  sucursal: Sucursal;
  opened: boolean;
  onClose: () => void;
}) {
  const { data: inventario = [], isLoading } = useSucursalInventario(
    opened ? sucursal.id : "",
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Inventario — ${sucursal.nombre}`}
      size="xl"
    >
      {isLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : inventario.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">
          No hay productos en esta sucursal aún.
        </Text>
      ) : (
        <Table
          horizontalSpacing="sm"
          verticalSpacing="sm"
          styles={{
            th: {
              color: "var(--text-secondary)",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            td: {
              borderColor: "var(--border-subtle)",
              paddingTop: "14px",
              paddingBottom: "14px",
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Producto</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Stock</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Precio</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {inventario.map((sp) => (
              <Table.Tr key={sp.productoId}>
                <Table.Td>
                  <Text size="xs" ff="monospace" c="dimmed">
                    {sp.producto?.sku}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{sp.producto?.nombre}</Text>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <Badge
                    color={
                      sp.stock === 0
                        ? "red"
                        : sp.stock <= 3
                          ? "yellow"
                          : "green"
                    }
                    variant="filled"
                    size="sm"
                  >
                    {sp.stock} u.
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "right" }}>
                  <Text size="sm" ff="monospace">
                    ${sp.producto?.precio_usd?.toFixed(2)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}

// ── Sub-component: Sucursal Form Modal ───────────────────────────────────────
interface SucursalFormValues {
  nombre: string;
  direccion: string;
  activa: boolean;
}

function SucursalFormModal({
  opened,
  onClose,
  editData,
}: {
  opened: boolean;
  onClose: () => void;
  editData?: Sucursal | null;
}) {
  const isEditing = !!editData;
  const createSucursal = useCreateSucursal();
  const updateSucursal = useUpdateSucursal();

  const form = useForm<SucursalFormValues>({
    initialValues: {
      nombre: editData?.nombre ?? "",
      direccion: editData?.direccion ?? "",
      activa: editData?.activa ?? true,
    },
  });

  // Sync when editData changes
  useState(() => {
    if (opened) {
      form.setValues({
        nombre: editData?.nombre ?? "",
        direccion: editData?.direccion ?? "",
        activa: editData?.activa ?? true,
      });
    }
  });

  const handleSubmit = async (values: SucursalFormValues) => {
    try {
      if (isEditing && editData) {
        await updateSucursal.mutateAsync({ id: editData.id, data: values });
        notifications.show({ message: "Sucursal actualizada", color: "green" });
      } else {
        await createSucursal.mutateAsync(values);
        notifications.show({ message: "Sucursal creada", color: "green" });
      }
      form.reset();
      onClose();
    } catch {
      notifications.show({ message: "Error al guardar", color: "red" });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Editar Sucursal" : "Nueva Sucursal"}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            placeholder="Ej: Sucursal Centro"
            required
            {...form.getInputProps("nombre")}
          />
          <Textarea
            label="Dirección"
            placeholder="Dirección completa (opcional)"
            autosize
            minRows={2}
            {...form.getInputProps("direccion")}
          />
          {isEditing && (
            <Switch
              label="Sucursal activa"
              {...form.getInputProps("activa", { type: "checkbox" })}
            />
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createSucursal.isPending || updateSucursal.isPending}
            >
              {isEditing ? "Guardar Cambios" : "Crear Sucursal"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function SucursalesPage() {
  const { data: sucursales = [], isLoading } = useSucursales();
  const deleteSucursal = useDeleteSucursal();

  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);
  const [editData, setEditData] = useState<Sucursal | null>(null);
  const [inventarioSucursal, setInventarioSucursal] = useState<Sucursal | null>(
    null,
  );
  const [invOpened, { open: openInv, close: closeInv }] = useDisclosure(false);
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

  const handleViewInventario = (s: Sucursal) => {
    setInventarioSucursal(s);
    openInv();
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

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconBuilding size={24} color="var(--primary)" />
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

      {inventarioSucursal && (
        <InventarioModal
          sucursal={inventarioSucursal}
          opened={invOpened}
          onClose={closeInv}
        />
      )}

      <TransferModal opened={transferOpened} onClose={closeTransfer} />
    </Stack>
  );
}
