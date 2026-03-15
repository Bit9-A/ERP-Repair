import {
  Modal,
  NumberInput,
  Select,
  Stack,
  Button,
  Group,
  Text,
  Checkbox,
  Divider,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons-react";
import { useAddStock, useSucursales } from "../../../services";
import type { Producto } from "../../../types";

interface AddStockModalProps {
  opened: boolean;
  onClose: () => void;
  producto: Producto | null;
}

interface AddStockFormValues {
  cantidad: number;
  sucursalId: string;
  costo_unitario_usd: number | "";
  actualizar_costo: boolean;
  nota: string;
}

export function AddStockModal({
  opened,
  onClose,
  producto,
}: AddStockModalProps) {
  const addStock = useAddStock();
  const { data: sucursales = [] } = useSucursales();

  const form = useForm<AddStockFormValues>({
    initialValues: {
      cantidad: 1,
      sucursalId: "",
      costo_unitario_usd: "",
      actualizar_costo: false,
      nota: "",
    },
    validate: {
      cantidad: (v) => (v <= 0 ? "Deben ser al menos 1 unidad" : null),
      sucursalId: (v) => (!v ? "Selecciona una sucursal de destino" : null),
    },
  });

  if (!producto) return null;

  const handleSubmit = async (values: AddStockFormValues) => {
    try {
      await addStock.mutateAsync({
        id: producto.id,
        cantidad: values.cantidad,
        sucursalId: values.sucursalId || undefined,
        costo_unitario_usd:
          values.costo_unitario_usd !== ""
            ? Number(values.costo_unitario_usd)
            : undefined,
        actualizar_costo: values.actualizar_costo,
        nota: values.nota || undefined,
      });
      notifications.show({
        title: "Stock agregado",
        message: `+${values.cantidad} unidades de ${producto.nombre}`,
        color: "green",
      });
      form.reset();
      onClose();
    } catch {
      notifications.show({
        message: "Error al agregar stock",
        color: "red",
      });
    }
  };

  const sucursalOptions = sucursales.map((s) => ({
    value: s.id,
    label: s.nombre,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Agregar Stock"
      size="md"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* Product info */}
          <Alert
            variant="light"
            color="brand"
            icon={<IconInfoCircle size={16} />}
          >
            <Text size="sm" fw={600}>
              {producto.nombre}
            </Text>
            <Text size="xs" c="dimmed">
              SKU: {producto.sku} · Stock actual: {producto.stock_actual} u. ·
              Precio proveedor base: $ {producto.costo_usd.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP
            </Text>
          </Alert>

          <NumberInput
            label="Cantidad a ingresar"
            min={1}
            required
            {...form.getInputProps("cantidad")}
          />

          {/* Feature 3: destination branch */}
          <Select
            label="Sucursal de destino"
            placeholder="Selecciona sucursal"
            data={sucursalOptions}
            required
            description="¿En qué sucursal se registrará esta entrada de stock?"
            {...form.getInputProps("sucursalId")}
          />

          <Divider
            label="Precio de Proveedor (Opcional)"
            labelPosition="center"
          />

          {/* Feature 2: supplier price */}
          <NumberInput
            label="Precio de Proveedor (COP)"
            placeholder="Ej: 45000"
            min={0}
            decimalScale={0}
            prefix="$"
            description="Precio al que compraste este lote. Se registra en el historial sin afectar el costo base del producto."
            {...form.getInputProps("costo_unitario_usd")}
          />

          {form.values.costo_unitario_usd !== "" &&
            Number(form.values.costo_unitario_usd) > 0 && (
              <Checkbox
                label="Actualizar precio de proveedor base del producto"
                description={`El precio de proveedor base cambiará de $ ${producto.costo_usd.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} a $ ${Number(form.values.costo_unitario_usd).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} COP`}
                {...form.getInputProps("actualizar_costo", {
                  type: "checkbox",
                })}
              />
            )}

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={addStock.isPending}>
              Agregar Stock
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
