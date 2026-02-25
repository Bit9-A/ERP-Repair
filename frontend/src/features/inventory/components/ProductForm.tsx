import { useEffect } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Stack,
  Button,
  Group,
  Select,
  SimpleGrid,
  Divider,
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
      sku: "",
      nombre: "",
      marca_comp: "",
      modelo_comp: "",
      categoria: "REPUESTO",
      propiedad: "PROPIA",
      propietario: "",
      stock_actual: 0,
      stock_minimo: 2,
      costo_usd: 0,
      precio_usd: 0,
    },
    validate: {
      sku: (v) => (v.trim().length < 2 ? "SKU requerido" : null),
      nombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      stock_actual: (v) => (v < 0 ? "Stock no puede ser negativo" : null),
      stock_minimo: (v) => (v < 0 ? "Mínimo no puede ser negativo" : null),
      costo_usd: (v) => (v < 0 ? "Costo debe ser mayor o igual a 0" : null),
      precio_usd: (v) => (v <= 0 ? "Precio debe ser mayor a 0" : null),
    },
  });

  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues({
          sku: initialData.sku,
          nombre: initialData.nombre,
          marca_comp: initialData.marca_comp || "",
          modelo_comp: initialData.modelo_comp || "",
          categoria: initialData.categoria,
          propiedad: initialData.propiedad,
          propietario: initialData.propietario || "",
          stock_actual: initialData.stock_actual,
          stock_minimo: initialData.stock_minimo,
          costo_usd: initialData.costo_usd,
          precio_usd: initialData.precio_usd,
        });
      } else {
        form.reset();
      }
    }
  }, [opened, initialData]);

  const handleSubmit = (values: ProductFormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  const margen =
    form.values.precio_usd > 0 && form.values.costo_usd > 0
      ? (
          ((form.values.precio_usd - form.values.costo_usd) /
            form.values.costo_usd) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={initialData ? "Editar Producto" : "Nuevo Producto"}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Divider label="Información General" labelPosition="center" />
          <SimpleGrid cols={2}>
            <TextInput
              label="SKU"
              placeholder="Ej: PANT-LCD-A54"
              required
              {...form.getInputProps("sku")}
            />
            <TextInput
              label="Nombre del Producto"
              placeholder="Ej: Pantalla LCD Samsung A54"
              required
              {...form.getInputProps("nombre")}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="Marca Compatible"
              placeholder="Ej: Samsung"
              {...form.getInputProps("marca_comp")}
            />
            <TextInput
              label="Modelo Compatible"
              placeholder="Ej: A54"
              {...form.getInputProps("modelo_comp")}
            />
          </SimpleGrid>

          <Divider label="Clasificación" labelPosition="center" />
          <SimpleGrid cols={2}>
            <Select
              label="Categoría"
              data={[
                { value: "EQUIPO", label: "📱 Equipo" },
                { value: "ACCESORIO", label: "🎧 Accesorio" },
                { value: "REPUESTO", label: "🔧 Repuesto" },
              ]}
              {...form.getInputProps("categoria")}
            />
            <Select
              label="Propiedad"
              data={[
                { value: "PROPIA", label: "🏠 Propia" },
                { value: "PRESTADA", label: "🤝 Prestada (Consignación)" },
              ]}
              {...form.getInputProps("propiedad")}
            />
          </SimpleGrid>

          {form.values.propiedad === "PRESTADA" && (
            <TextInput
              label="Propietario / Dueño"
              placeholder="Nombre del dueño de la mercancía"
              required
              {...form.getInputProps("propietario")}
            />
          )}

          <Divider label="Stock y Precios" labelPosition="center" />
          <SimpleGrid cols={2}>
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
          </SimpleGrid>

          <SimpleGrid cols={3}>
            <NumberInput
              label="Costo ($)"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              {...form.getInputProps("costo_usd")}
            />
            <NumberInput
              label="Precio ($)"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              {...form.getInputProps("precio_usd")}
            />
            <TextInput
              label="Margen"
              value={`${margen}%`}
              readOnly
              styles={{
                input: {
                  fontWeight: 700,
                  color: Number(margen) > 0 ? "#22C55E" : "#EF4444",
                },
              }}
            />
          </SimpleGrid>

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
