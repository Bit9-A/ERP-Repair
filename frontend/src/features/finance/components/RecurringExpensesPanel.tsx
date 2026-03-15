import { useState } from "react";
import {
  Badge,
  Paper,
  Table,
  Text,
  Group,
  LoadingOverlay,
  Title,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Select,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconCalendarClock,
  IconEdit,
} from "@tabler/icons-react";
import {
  useRecurrentes,
  useCreateRecurrente,
  useDeleteRecurrente,
  useUpdateRecurrente,
} from "../../../services";
import { notifications } from "@mantine/notifications";

export function RecurringExpensesPanel() {
  const { data: recurrentes, isLoading } = useRecurrentes();
  const createMutation = useCreateRecurrente();
  const deleteMutation = useDeleteRecurrente();
  const updateMutation = useUpdateRecurrente();

  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    concepto: "",
    monto_usd: 0,
    frecuencia: "MENSUAL" as "DIARIO" | "SEMANAL" | "MENSUAL",
    categoria: "Servicios",
    proximaFecha: new Date().toISOString().split("T")[0],
  });

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      concepto: item.concepto,
      monto_usd: item.monto_usd,
      frecuencia: item.frecuencia,
      categoria: item.categoria,
      proximaFecha: new Date(item.proximaFecha).toISOString().split("T")[0],
    });
    setOpened(true);
  };

  const handleClose = () => {
    setOpened(false);
    setEditingId(null);
    setFormData({
      concepto: "",
      monto_usd: 0,
      frecuencia: "MENSUAL",
      categoria: "Servicios",
      proximaFecha: new Date().toISOString().split("T")[0],
    });
  };

  const handleSave = async () => {
    if (!formData.concepto || formData.monto_usd <= 0) {
      notifications.show({
        title: "Error",
        message: "Completa el concepto y un monto válido",
        color: "red",
      });
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: formData });
        notifications.show({
          title: "Éxito",
          message: "Programación actualizada",
          color: "green",
        });
      } else {
        await createMutation.mutateAsync(formData);
        notifications.show({
          title: "Éxito",
          message: "Gasto recurrente programado",
          color: "green",
        });
      }
      handleClose();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: editingId
          ? "No se pudo actualizar la programación"
          : "No se pudo crear la programación",
        color: "red",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta programación?")) {
      try {
        await deleteMutation.mutateAsync(id);
        notifications.show({
          title: "Eliminado",
          message: "La programación ha sido eliminada",
        });
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "No se pudo eliminar",
          color: "red",
        });
      }
    }
  };

  return (
    <Stack>
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={4}>Pagos Programados</Title>
          <Text size="sm" c="dimmed">
            Gastos que se generarán automáticamente según la frecuencia elegida.
          </Text>
        </Stack>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="filled"
          onClick={() => setOpened(true)}
        >
          Programar Gasto
        </Button>
      </Group>

      <Paper withBorder p="md" pos="relative">
        <LoadingOverlay
          visible={
            isLoading ||
            createMutation.isPending ||
            deleteMutation.isPending ||
            updateMutation.isPending
          }
        />

        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Concepto</Table.Th>
              <Table.Th>Monto (USD)</Table.Th>
              <Table.Th>Frecuencia</Table.Th>
              <Table.Th>Próximo Cobro</Table.Th>
              <Table.Th align="right">Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {recurrentes?.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Group gap="sm">
                    <IconCalendarClock size={16} color="gray" />
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {item.concepto}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.categoria}
                      </Text>
                    </Stack>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={700} c="red">
                    ${item.monto_usd.toFixed(2)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      item.frecuencia === "DIARIO"
                        ? "blue"
                        : item.frecuencia === "SEMANAL"
                          ? "cyan"
                          : "violet"
                    }
                    variant="light"
                  >
                    {item.frecuencia}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(item.proximaFecha).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Tooltip label="Editar">
                      <ActionIcon
                        color="blue"
                        variant="subtle"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Eliminar programación">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleDelete(item.id)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
            {recurrentes?.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed" py="xl">
                    No hay gastos recurrentes programados.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Modal para crear/editar programación */}
      <Modal
        opened={opened}
        onClose={handleClose}
        title={editingId ? "Editar Gasto Programado" : "Programar Nuevo Gasto"}
        centered
      >
        <Stack>
          <TextInput
            label="Concepto"
            placeholder="Ej. Alquiler Local, Internet..."
            required
            value={formData.concepto}
            onChange={(e) =>
              setFormData({ ...formData, concepto: e.target.value })
            }
          />
          <Group grow>
            <NumberInput
              label="Monto (USD)"
              placeholder="0.00"
              decimalScale={2}
              min={0}
              required
              value={formData.monto_usd}
              onChange={(val) =>
                setFormData({ ...formData, monto_usd: Number(val) || 0 })
              }
            />
            <Select
              label="Frecuencia"
              data={[
                { value: "DIARIO", label: "Diario" },
                { value: "SEMANAL", label: "Semanal" },
                { value: "MENSUAL", label: "Mensual" },
              ]}
              value={formData.frecuencia}
              onChange={(val) =>
                setFormData({ ...formData, frecuencia: val as any })
              }
            />
          </Group>
          <TextInput
            label="Categoría"
            placeholder="Servicios, Alquiler, Impuestos..."
            value={formData.categoria}
            onChange={(e) =>
              setFormData({ ...formData, categoria: e.target.value })
            }
          />
          <TextInput
            label="Fecha del próximo cobro"
            type="date"
            value={formData.proximaFecha}
            onChange={(e) =>
              setFormData({ ...formData, proximaFecha: e.target.value })
            }
          />
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? "Guardar Cambios" : "Guardar Programación"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
