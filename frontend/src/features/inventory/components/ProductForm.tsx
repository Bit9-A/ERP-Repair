import { useEffect, useState } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Stack,
  Autocomplete,
  Button,
  Group,
  Select,
  SimpleGrid,
  Divider,
  ActionIcon,
  Tooltip,
  Loader,
  Paper,
  Text,
  Badge,
} from "@mantine/core";
import { IconScan, IconPlus, IconPackage } from "@tabler/icons-react";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { BarcodeScanner } from "../../sales/components/BarcodeScanner";
import {
  useMarcas,
  useCreateMarca,
  useModelosByMarca,
  useCreateModelo,
  useSucursales,
} from "../../../services";
import type { Producto } from "../../../types";
import type { ProductFormValues } from "../types/inventory.types";

interface ProductFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (
    values: ProductFormValues & {
      id?: string;
      isQuickAdd?: boolean;
      qtyAdded?: number;
    },
  ) => void;
  initialData?: Producto | null;
  allProducts?: Producto[];
}

export function ProductForm({
  opened,
  onClose,
  onSubmit,
  initialData,
  allProducts = [],
}: ProductFormProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [stockToAdd, setStockToAdd] = useState<number | string>("");

  // -- Brand and Model State & Queries --
  const [selectedMarcaId, setSelectedMarcaId] = useState<string | null>(null);
  const [marcaSearch, setMarcaSearch] = useState("");
  const [modeloSearch, setModeloSearch] = useState("");

  const { data: marcas = [], isLoading: loadingMarcas } = useMarcas();
  const createMarca = useCreateMarca();
  const { data: modelos = [], isLoading: loadingModelos } = useModelosByMarca(
    selectedMarcaId ?? undefined,
  );
  const createModelo = useCreateModelo();
  const { data: sucursales = [] } = useSucursales();

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
      sucursalId: "",
    },
    validate: {
      sku: (v) => (v.trim().length < 2 ? "SKU requerido" : null),
      nombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      stock_actual: (v) => (v < 0 ? "Stock no puede ser negativo" : null),
      stock_minimo: (v) => (v < 0 ? "Mínimo no puede ser negativo" : null),
      costo_usd: (v) => (v < 0 ? "Costo debe ser mayor o igual a 0" : null),
      precio_usd: (v, values) =>
        v <= 0
          ? "Precio debe ser mayor a 0"
          : v < values.costo_usd
            ? "El precio de venta no puede ser menor al costo"
            : null,
    },
  });

  // Initialize form when opened
  useEffect(() => {
    if (opened && initialData) {
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

      const marca = marcas.find((m) => m.nombre === initialData.marca_comp);
      if (marca) setSelectedMarcaId(marca.id);
    } else if (opened && !initialData && !form.isDirty()) {
      // Only reset if it's cleanly opened without data and we haven't typed anything yet
      // Actually, it's safer to just handle reset on close.
    }
  }, [opened, initialData]);

  // Sync initial brand ID once marcas load if editing
  useEffect(() => {
    if (opened && initialData && marcas.length > 0 && !selectedMarcaId) {
      const marca = marcas.find((m) => m.nombre === initialData.marca_comp);
      if (marca) setSelectedMarcaId(marca.id);
    }
  }, [marcas, opened, initialData, selectedMarcaId]);

  // -- Quick Add Logic --
  // Helper to normalize sku comparison (handle UPCA/EAN13 zeroes)
  const stripLeadingZeros = (str: string) =>
    str.replace(/^0+/, "").toLowerCase();

  // Is this an existing product we scanned/typed? (Only applies when NOT editing an existing product directly)
  const existingProductMatch =
    !initialData && form.values.sku.trim().length > 1
      ? allProducts.find(
        (p) =>
          stripLeadingZeros(p.sku) === stripLeadingZeros(form.values.sku),
      )
      : null;

  const handleSubmit = (values: ProductFormValues) => {
    if (existingProductMatch) {
      const qtyToAdd = Number(stockToAdd);

      if (!qtyToAdd || qtyToAdd <= 0) {
        notifications.show({
          title: "Inválido",
          message: "Ingrese una cantidad válida mayor a 0",
          color: "red",
        });
        return;
      }

      // Submit a partial update with a flag for InventoryPage to use adjustStock
      onSubmit({
        ...existingProductMatch,
        id: existingProductMatch.id,
        marca_comp: existingProductMatch.marca_comp || "",
        modelo_comp: existingProductMatch.modelo_comp || "",
        propietario: existingProductMatch.propietario || "",
        stock_actual: existingProductMatch.stock_actual + qtyToAdd,
        isQuickAdd: true,
        qtyAdded: qtyToAdd,
      });
      setStockToAdd("");
    } else {
      onSubmit(values);
    }

    form.reset();
    setSelectedMarcaId(null);
    onClose();
  };

  const handleBarcodeScan = (code: string) => {
    // Strip leading zeros for standardized format
    const cleanCode = code.replace(/^0+/, "").toLowerCase();

    form.setFieldValue("sku", cleanCode);
    setScannerOpen(false);
  };

  const handleMarcaChange = (value: string | null) => {
    form.setFieldValue("marca_comp", (value || "").toUpperCase());
    form.setFieldValue("modelo_comp", ""); // reset modelo when marca changes
    const marca = marcas.find((m) => m.nombre === (value || "").toUpperCase());
    setSelectedMarcaId(marca?.id ?? null);
  };

  const handleCreateMarcaInline = async () => {
    if (!marcaSearch.trim()) return;
    try {
      const newMarca = await createMarca.mutateAsync(
        marcaSearch.trim().toUpperCase(),
      );
      form.setFieldValue("marca_comp", newMarca.nombre);
      setSelectedMarcaId(newMarca.id);
      setMarcaSearch("");
      notifications.show({
        title: "Marca creada",
        message: `"${newMarca.nombre}" fue agregada`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo crear la marca",
        color: "red",
      });
    }
  };

  const handleCreateModeloInline = async () => {
    if (!modeloSearch.trim() || !selectedMarcaId) return;
    try {
      const newModelo = await createModelo.mutateAsync({
        marcaId: selectedMarcaId,
        nombre: modeloSearch.trim().toUpperCase(),
      });
      form.setFieldValue("modelo_comp", newModelo.nombre);
      setModeloSearch("");
      notifications.show({
        title: "Modelo creado",
        message: `"${newModelo.nombre}" fue agregado`,
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo crear el modelo",
        color: "red",
      });
    }
  };

  const marcaOptions = marcas.map((m) => ({
    value: m.nombre,
    label: m.nombre,
  }));

  const modeloOptions = selectedMarcaId
    ? modelos.map((m) => ({ value: m.nombre, label: m.nombre }))
    : marcas
      .find((m) => m.nombre === form.values.marca_comp)
      ?.modelos?.map((m) => ({ value: m.nombre, label: m.nombre })) || [];

  const margen =
    form.values.precio_usd > 0 && form.values.costo_usd > 0
      ? (
        ((form.values.precio_usd - form.values.costo_usd) /
          form.values.costo_usd) *
        100
      ).toFixed(1)
      : "0.0";

  return (
    <>
      <Modal
        opened={opened}
        onClose={onClose}
        title={initialData ? "Editar Producto" : "Nuevo Producto"}
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        <form
          onSubmit={
            existingProductMatch
              ? (e) => {
                e.preventDefault();
                handleSubmit(form.values);
              }
              : form.onSubmit(handleSubmit)
          }
        >
          <Stack gap="md">
            <Divider label="Información General" labelPosition="center" />
            <SimpleGrid cols={2}>
              <Autocomplete
                label="SKU / Código"
                placeholder="Escribe o escanea el código de barras"
                required
                data={allProducts.map((p) => p.sku)}
                {...form.getInputProps("sku")}
                rightSection={
                  <Tooltip label="Escanear Código">
                    <ActionIcon
                      variant="subtle"
                      color="brand"
                      onClick={() => setScannerOpen(true)}
                    >
                      <IconScan size={18} />
                    </ActionIcon>
                  </Tooltip>
                }
              />
              {!existingProductMatch && (
                <TextInput
                  label="Nombre del Producto"
                  placeholder="Ej: Pantalla, Batería, Flex..."
                  required
                  {...form.getInputProps("nombre")}
                />
              )}
            </SimpleGrid>

            {/* Quick Add Interface vs Normal Interface */}
            {existingProductMatch ? (
              <Paper p="md" radius="md" bg="brand.9" c="white">
                <Group justify="space-between" mb="sm">
                  <Group gap="xs">
                    <IconPackage size={20} />
                    <Text fw={600}>{existingProductMatch.nombre}</Text>
                  </Group>
                  <Badge color="white" c="brand" variant="filled">
                    Stock: {existingProductMatch.stock_actual}
                  </Badge>
                </Group>

                <Text size="sm" mb="md" opacity={0.8}>
                  Este producto ya existe en el inventario. ¿Deseas agregar más
                  unidades?
                </Text>

                <NumberInput
                  label="Cantidad a añadir"
                  placeholder="Ej: 10"
                  min={1}
                  value={stockToAdd}
                  onChange={setStockToAdd}
                  required
                  autoFocus
                  styles={{
                    label: { color: "rgba(255, 255, 255, 0.9)" },
                    input: {
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "none",
                    },
                  }}
                />
              </Paper>
            ) : (
              <>
                <SimpleGrid cols={2}>
                  <Select
                    label="Marca Compatible"
                    placeholder="Buscar marca..."
                    data={marcaOptions}
                    value={form.values.marca_comp || null}
                    onChange={handleMarcaChange}
                    searchable
                    onSearchChange={setMarcaSearch}
                    searchValue={marcaSearch}
                    clearable
                    rightSection={
                      loadingMarcas ? <Loader size={14} /> : undefined
                    }
                    nothingFoundMessage={
                      marcaSearch.trim() ? (
                        <Button
                          variant="subtle"
                          size="compact-sm"
                          leftSection={<IconPlus size={14} />}
                          fullWidth
                          onClick={handleCreateMarcaInline}
                          loading={createMarca.isPending}
                        >
                          Crear "{marcaSearch.trim()}"
                        </Button>
                      ) : (
                        "Escribe para buscar"
                      )
                    }
                  />
                  <Select
                    label="Modelo"
                    placeholder={
                      selectedMarcaId
                        ? "Buscar modelo..."
                        : "Selecciona marca primero"
                    }
                    data={modeloOptions}
                    value={form.values.modelo_comp || null}
                    onChange={(v) =>
                      form.setFieldValue("modelo_comp", (v || "").toUpperCase())
                    }
                    searchable
                    onSearchChange={setModeloSearch}
                    searchValue={modeloSearch}
                    disabled={!form.values.marca_comp}
                    clearable
                    rightSection={
                      loadingModelos ? <Loader size={14} /> : undefined
                    }
                    nothingFoundMessage={
                      modeloSearch.trim() && selectedMarcaId ? (
                        <Button
                          variant="subtle"
                          size="compact-sm"
                          leftSection={<IconPlus size={14} />}
                          fullWidth
                          onClick={handleCreateModeloInline}
                          loading={createModelo.isPending}
                        >
                          Crear "{modeloSearch.trim()}"
                        </Button>
                      ) : (
                        "Escribe para buscar"
                      )
                    }
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
                      {
                        value: "PRESTADA",
                        label: "🤝 Prestada (Consignación)",
                      },
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

                {/* Branch selector — only for new products with initial stock */}
                {!initialData && form.values.stock_actual > 0 && (
                  <Select
                    label="Sucursal de destino del stock inicial"
                    placeholder="Selecciona sucursal"
                    description="¿En qué local físico entrará este stock?"
                    data={sucursales.map((s) => ({
                      value: s.id,
                      label: s.nombre,
                    }))}
                    clearable
                    {...form.getInputProps("sucursalId")}
                  />
                )}

                <SimpleGrid cols={3}>
                  <NumberInput
                    label="Precio de Proveedor ($)"
                    min={0}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="$"
                    {...form.getInputProps("costo_usd")}
                  />
                  <NumberInput
                    label="Precio de Cliente ($)"
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
              </>
            )}

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

      {/* Scanner Modal overlay */}
      <BarcodeScanner
        opened={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleBarcodeScan}
      />
    </>
  );
}
