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
  SegmentedControl,
  Stack,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  useEgresos,
  useCreateEgreso,
  useDeleteEgreso,
} from "../../../services";
import {
  IconTrendingDown,
  IconReceiptOff,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";

interface EgresosTableProps {
  periodo?: "dia" | "semana" | "mes";
}

export function EgresosTable({ periodo }: EgresosTableProps) {
  const { data: egresos = [], isLoading } = useEgresos(periodo);
  const createEgreso = useCreateEgreso();
  const deleteEgreso = useDeleteEgreso();

  const [opened, setOpened] = useState(false);

  const form = useForm({
    initialValues: {
      concepto: "",
      monto_usd: 0,
      categoria: "OTROS",
      tipo: "variable", // "fijo" or "variable"
    },
    validate: {
      concepto: (value) =>
        value.trim().length > 0 ? null : "El concepto es obligatorio",
      monto_usd: (value) =>
        value > 0 ? null : "El monto debe ser numérico y mayor a 0",
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await createEgreso.mutateAsync({
        concepto: values.concepto,
        monto_usd: values.monto_usd,
        categoria: values.categoria,
        esFijo: values.tipo === "fijo",
      });
      notifications.show({
        title: "Gasto registrado",
        message:
          "El egreso fue guardado correctamente y descontado del balance.",
        color: "green",
      });
      setOpened(false);
      form.reset();
    } catch (e: any) {
      notifications.show({
        title: "Error",
        message: e?.message || "No se pudo registrar el gasto.",
        color: "red",
      });
    }
  };

  const handleDelete = async (id: string, concepto: string) => {
    if (
      window.confirm(
        `¿Seguro que desea eliminar el gasto de "${concepto}"? Esto restaurará el monto al balance.`,
      )
    ) {
      try {
        await deleteEgreso.mutateAsync(id);
        notifications.show({
          title: "Gasto eliminado",
          message: "El egreso fue cancelado.",
          color: "blue",
        });
      } catch (e: any) {
        notifications.show({
          title: "Error al eliminar",
          message: e?.message || "Ocurrió un error al intentar eliminar.",
          color: "red",
        });
      }
    }
  };

  return (
    <>
      <Paper
        radius="lg"
        pos="relative"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
          minHeight: 200,
        }}
      >
        <LoadingOverlay visible={isLoading} />
        <Group justify="space-between" p="md" pb="sm">
          <Group gap="xs">
            <IconTrendingDown size={18} color="#EF4444" />
            <Text size="sm" fw={700}>
              Gastos &amp; Egresos
            </Text>
          </Group>
          <Button
            size="xs"
            color="red"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={() => setOpened(true)}
          >
            Nuevo Gasto
          </Button>
        </Group>

        {egresos.length === 0 && !isLoading ? (
          <Group justify="center" p="xl" style={{ opacity: 0.5 }}>
            <IconReceiptOff size={32} />
            <Title order={5}>No hay egresos registrados</Title>
          </Group>
        ) : (
          <Table
            highlightOnHover
            striped
            horizontalSpacing="md"
            verticalSpacing="sm"
            styles={{
              th: {
                color: "var(--text-primary)",
                fontSize: "12px",
                fontWeight: 700,
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
                <Table.Th>Concepto</Table.Th>
                <Table.Th>Categoría</Table.Th>
                <Table.Th>Tipo</Table.Th>
                <Table.Th>Fecha</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Monto ($)</Table.Th>
                <Table.Th style={{ width: 80, textAlign: "center" }}>
                  Acciones
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {egresos.map((egreso) => (
                <Table.Tr key={egreso.id}>
                  <Table.Td>
                    <Stack gap={2}>
                      <Text size="sm" fw={600}>
                        {egreso.concepto}
                      </Text>
                      {egreso.ticket && (
                        <Text size="xs" c="dimmed">
                          {egreso.ticket.marca} {egreso.ticket.modelo}
                        </Text>
                      )}
                      {egreso.producto && (
                        <Text size="xs" c="dimmed">
                          {egreso.producto.marca_comp}{" "}
                          {egreso.producto.modelo_comp}
                        </Text>
                      )}
                    </Stack>
                  </Table.Td>
                  <Table.Td>
                    <Badge color="gray" size="xs" variant="light">
                      {egreso.categoria}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {egreso.esFijo ? (
                      <Badge color="orange" size="xs" variant="dot">
                        Gasto Fijo
                      </Badge>
                    ) : (
                      <Badge color="blue" size="xs" variant="dot">
                        Variable
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" fw={500}>
                      {new Date(egreso.createdAt).toLocaleString("es-VE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text ff="monospace" size="sm" fw={800} c="red.6">
                    -$ {egreso.monto_usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Tooltip label="Eliminar gasto">
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleDelete(egreso.id, egreso.concepto)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {/* Modal to Register new Egreso */}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <Group gap="sm">
            <IconTrendingDown size={20} color="var(--mantine-color-red-6)" />
            <Text fw={700}>Registrar Gasto (Egreso)</Text>
          </Group>
        }
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="sm">
            <TextInput
              label="Concepto / Detalle"
              placeholder="Ej. Alquiler Mayo, Compra de Flux, Café..."
              required
              {...form.getInputProps("concepto")}
            />

            <Select
              label="Categoría"
              data={[
                "INSUMOS",
                "ALQUILER",
                "SERVICIOS_PUBLICOS",
                "IMPUESTOS",
                "COMIDA",
                "MARKETING",
                "OTROS",
              ]}
              {...form.getInputProps("categoria")}
            />

            <NumberInput
              label="Monto en USD ($)"
              placeholder="0.00"
              required
              min={0}
              decimalScale={2}
              {...form.getInputProps("monto_usd")}
            />

            <div>
              <Text size="sm" fw={500} mb={4}>
                Clasificación
              </Text>
              <SegmentedControl
                fullWidth
                data={[
                  { label: "Variable (Ocasional)", value: "variable" },
                  { label: "Fijo (Mensual)", value: "fijo" },
                ]}
                {...form.getInputProps("tipo")}
              />
              <Text size="xs" c="dimmed" mt={4}>
                {form.values.tipo === "fijo"
                  ? "Gastos operativos que siempre ocurren (Alquiler, sueldos fijos, servicios)."
                  : "Gastos impredecibles o por demanda (Insumos, imprevistos, snacks)."}
              </Text>
            </div>

            <Group justify="flex-end" mt="md">
              <Button variant="subtle" onClick={() => setOpened(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                color="red"
                loading={createEgreso.isPending}
              >
                Guardar Gasto
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
