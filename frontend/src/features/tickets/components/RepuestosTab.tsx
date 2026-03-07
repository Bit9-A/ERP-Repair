import { useState } from "react";
import {
  Stack,
  Group,
  Button,
  Table,
  Text,
  Select,
  NumberInput,
  ActionIcon,
  Paper,
} from "@mantine/core";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import {
  useProducts,
  useAddRepuesto,
  useRemoveRepuesto,
} from "../../../services";
import { notifications } from "@mantine/notifications";
import { useRepair } from "../../../services/hooks/useRepairs";
import { useAuthStore } from "../../auth/store/auth.store";

interface RepuestosTabProps {
  ticketId: string;
}

export function RepuestosTab({ ticketId }: RepuestosTabProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [cantidad, setCantidad] = useState<number>(1);

  // Consider fetching only products with category "REPUESTO" if you want to filter
  const { data: products = [] } = useProducts();
  const { data: ticket, isLoading: isTicketLoading } = useRepair(ticketId);
  const user = useAuthStore((state) => state.user);

  const addRepuestoMutation = useAddRepuesto();
  const removeRepuestoMutation = useRemoveRepuesto();

  const productOptions = products
    .filter((p) => p.stock_actual > 0 && p.categoria === "REPUESTO")
    .map((p) => ({
      value: p.id,
      label: `${p.nombre} (Stock: ${p.stock_actual}) - $${p.precio_usd.toFixed(2)}`,
    }));

  const handleAdd = async () => {
    if (!selectedProductId || cantidad <= 0) return;
    try {
      await addRepuestoMutation.mutateAsync({
        id: ticketId,
        productoId: selectedProductId,
        cantidad,
      });
      setSelectedProductId(null);
      setCantidad(1);
      notifications.show({
        title: "Agregado",
        message: "Repuesto agregado al ticket",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo agregar el repuesto (¿Stock insuficiente?)",
        color: "red",
      });
    }
  };

  const handleRemove = async (repuestoId: string) => {
    try {
      await removeRepuestoMutation.mutateAsync({ id: ticketId, repuestoId });
      notifications.show({
        title: "Eliminado",
        message: "Repuesto eliminado del ticket",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo eliminar el repuesto",
        color: "red",
      });
    }
  };

  if (isTicketLoading || !ticket) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Cargando repuestos...
      </Text>
    );
  }

  const costoCalculado =
    ticket.repuestos?.reduce(
      (acc, r) => acc + r.cantidad * r.precio_congelado_usd,
      0,
    ) || 0;

  const isLocked = ticket.estado === "ENTREGADO" && user?.rol !== "ADMIN";

  return (
    <Stack gap="md" mt="md">
      {!isLocked && (
        <Paper withBorder p="md" bg="gray.0">
          <Group align="flex-end">
            <Select
              label="Buscar Repuesto"
              placeholder="Seleccione..."
              data={productOptions}
              value={selectedProductId}
              onChange={setSelectedProductId}
              searchable
              style={{ flex: 1 }}
            />
            <NumberInput
              label="Cantidad"
              min={1}
              value={cantidad}
              onChange={(v) => setCantidad(Number(v))}
              w={100}
            />
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleAdd}
              loading={addRepuestoMutation.isPending}
              disabled={!selectedProductId}
            >
              Agregar
            </Button>
          </Group>
        </Paper>
      )}

      {ticket.repuestos && ticket.repuestos.length > 0 ? (
        <Table.ScrollContainer minWidth={500}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Producto</Table.Th>
                <Table.Th>Cantidad</Table.Th>
                <Table.Th>Precio Unitario</Table.Th>
                <Table.Th>Subtotal</Table.Th>
                <Table.Th w={50}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {ticket.repuestos.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>
                    {r.producto?.nombre}{" "}
                    <Text span size="xs" c="dimmed">
                      ({r.producto?.categoria})
                    </Text>
                  </Table.Td>
                  <Table.Td>{r.cantidad}</Table.Td>
                  <Table.Td>${r.precio_congelado_usd.toFixed(2)}</Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      ${(r.cantidad * r.precio_congelado_usd).toFixed(2)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {!isLocked && (
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => handleRemove(r.id)}
                        loading={removeRepuestoMutation.isPending}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      ) : (
        <Text c="dimmed" ta="center" py="xl">
          No hay repuestos asignados a este ticket.
        </Text>
      )}

      <Group justify="flex-end">
        <Text fw={700}>Costo Total Repuestos:</Text>
        <Text fw={700} c="blue" size="lg">
          ${costoCalculado.toFixed(2)}
        </Text>
      </Group>
    </Stack>
  );
}
