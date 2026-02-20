import {
  Modal,
  TextInput,
  NumberInput,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { Producto } from "../../../types";
import type { ProductFormValues } from "../types/inventory.types";

interface ProductFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  initialData?: Producto | null;
}

export function ProductForm({
  opened,
  onClose,
  onSubmit,
  initialData,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    initialValues: {
      sku: initialData?.sku ?? "",
      nombre: initialData?.nombre ?? "",
      stock_actual: initialData?.stock_actual ?? 0,
      stock_minimo: initialData?.stock_minimo ?? 5,
      precio_usd: initialData?.precio_usd ?? 0,
    },
    validate: {
      sku: (v) => (v.trim().length < 2 ? "SKU requerido" : null),
      nombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      stock_actual: (v) => (v < 0 ? "Stock no puede ser negativo" : null),
      stock_minimo: (v) => (v < 0 ? "Mínimo no puede ser negativo" : null),
      precio_usd: (v) => (v <= 0 ? "Precio debe ser mayor a 0" : null),
    },
  });

  const handleSubmit = (values: ProductFormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialData ? "Editar Producto" : "Nuevo Producto"}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="SKU"
            placeholder="Ej: PANT-LCD-A54"
            {...form.getInputProps("sku")}
          />
          <TextInput
            label="Nombre del Producto"
            placeholder="Ej: Pantalla LCD Samsung A54"
            {...form.getInputProps("nombre")}
          />
          <Group grow>
            <NumberInput
              label="Stock Actual"
              min={0}
              {...form.getInputProps("stock_actual")}
            />
            <NumberInput
              label="Stock Mínimo"
              min={0}
              {...form.getInputProps("stock_minimo")}
            />
          </Group>
          <NumberInput
            label="Precio USD"
            min={0}
            decimalScale={2}
            fixedDecimalScale
            prefix="$"
            {...form.getInputProps("precio_usd")}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Guardar Cambios" : "Agregar Producto"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
