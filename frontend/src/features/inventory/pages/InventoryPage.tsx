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
  SegmentedControl,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconSearch,
  IconPackage,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconDownload,
  IconFilter,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { ProductTable } from "../components/ProductTable";
import { ProductForm } from "../components/ProductForm";
import type { Producto } from "../../../types";
import type { ProductFormValues } from "../types/inventory.types";

// -- Demo data matching new schema --
const DEMO_PRODUCTS: Producto[] = [
  {
    id: "p1",
    sku: "PANT-LCD-A54",
    nombre: "Pantalla LCD Samsung A54",
    marca_comp: "Samsung",
    modelo_comp: "A54",
    categoria: "REPUESTO",
    propiedad: "PROPIA",
    stock_actual: 8,
    stock_minimo: 5,
    costo_usd: 18,
    precio_usd: 35,
  },
  {
    id: "p2",
    sku: "BAT-IPH14",
    nombre: "Batería iPhone 14",
    marca_comp: "Apple",
    modelo_comp: "iPhone 14",
    categoria: "REPUESTO",
    propiedad: "PROPIA",
    stock_actual: 3,
    stock_minimo: 5,
    costo_usd: 12,
    precio_usd: 22.5,
  },
  {
    id: "p3",
    sku: "FUNDA-IPH15-PRO",
    nombre: "Funda Silicona iPhone 15 Pro",
    marca_comp: "Apple",
    modelo_comp: "iPhone 15 Pro",
    categoria: "ACCESORIO",
    propiedad: "PRESTADA",
    propietario: "Distribuidora XYZ",
    stock_actual: 20,
    stock_minimo: 10,
    costo_usd: 2,
    precio_usd: 8,
  },
  {
    id: "p4",
    sku: "PANT-OLED-S23",
    nombre: "Pantalla OLED Galaxy S23",
    marca_comp: "Samsung",
    modelo_comp: "S23",
    categoria: "REPUESTO",
    propiedad: "PROPIA",
    stock_actual: 0,
    stock_minimo: 3,
    costo_usd: 65,
    precio_usd: 120,
  },
  {
    id: "p5",
    sku: "CARG-USBC-25W",
    nombre: "Cargador USB-C 25W",
    categoria: "ACCESORIO",
    propiedad: "PROPIA",
    stock_actual: 15,
    stock_minimo: 5,
    costo_usd: 4,
    precio_usd: 12,
  },
  {
    id: "p6",
    sku: "IPH-12-64-USED",
    nombre: "iPhone 12 64GB (Usado)",
    marca_comp: "Apple",
    modelo_comp: "iPhone 12",
    categoria: "EQUIPO",
    propiedad: "PRESTADA",
    propietario: "Carlos M.",
    stock_actual: 1,
    stock_minimo: 0,
    costo_usd: 180,
    precio_usd: 250,
  },
  {
    id: "p7",
    sku: "FLEX-CARGA-XR",
    nombre: "Flex de Carga Xiaomi Redmi",
    marca_comp: "Xiaomi",
    modelo_comp: "Redmi Note",
    categoria: "REPUESTO",
    propiedad: "PROPIA",
    stock_actual: 12,
    stock_minimo: 5,
    costo_usd: 3,
    precio_usd: 8,
  },
  {
    id: "p8",
    sku: "AUD-BT-GENERIC",
    nombre: "Audífonos Bluetooth Genéricos",
    categoria: "ACCESORIO",
    propiedad: "PRESTADA",
    propietario: "Importadora ABC",
    stock_actual: 30,
    stock_minimo: 10,
    costo_usd: 3.5,
    precio_usd: 12,
  },
  {
    id: "p9",
    sku: "SAM-A15-128-NEW",
    nombre: "Samsung Galaxy A15 128GB (Nuevo)",
    marca_comp: "Samsung",
    modelo_comp: "A15",
    categoria: "EQUIPO",
    propiedad: "PROPIA",
    stock_actual: 2,
    stock_minimo: 1,
    costo_usd: 120,
    precio_usd: 165,
  },
  {
    id: "p10",
    sku: "MICA-TEMP-UNIV",
    nombre: "Mica Templada Universal",
    categoria: "ACCESORIO",
    propiedad: "PROPIA",
    stock_actual: 50,
    stock_minimo: 20,
    costo_usd: 0.5,
    precio_usd: 2.5,
  },
];

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState("all");
  const [products] = useState<Producto[]>(DEMO_PRODUCTS);
  const [editProduct, setEditProduct] = useState<Producto | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryTab === "all" || p.categoria === categoryTab;
    const matchesStock =
      !stockFilter ||
      stockFilter === "all" ||
      (stockFilter === "low" &&
        p.stock_actual > 0 &&
        p.stock_actual <= p.stock_minimo) ||
      (stockFilter === "out" && p.stock_actual <= 0) ||
      (stockFilter === "ok" && p.stock_actual > p.stock_minimo);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalProducts = products.length;
  const lowStock = products.filter(
    (p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo,
  ).length;
  const totalValue = products.reduce(
    (sum, p) => sum + p.precio_usd * p.stock_actual,
    0,
  );

  const handleEdit = (product: Producto) => {
    setEditProduct(product);
    openForm();
  };

  const handleNew = () => {
    setEditProduct(null);
    openForm();
  };

  const handleSubmit = (_values: ProductFormValues) => {
    closeForm();
  };

  const handleDelete = (_product: Producto) => {
    // TODO: confirm + API call
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Title order={2} c="gray.1">
          Inventario
        </Title>
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
            Nuevo Producto
          </Button>
        </Group>
      </Group>

      {/* Summary KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard
          title="Total Productos"
          value={totalProducts}
          icon={<IconPackage size={20} />}
          accentColor="#3B82F6"
        />
        <StatCard
          title="Stock Bajo"
          value={lowStock}
          icon={<IconAlertTriangle size={20} />}
          accentColor="#F59E0B"
        />
        <StatCard
          title="Valor Total"
          value={`$${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<IconCurrencyDollar size={20} />}
          accentColor="#22C55E"
        />
      </SimpleGrid>

      {/* Table section */}
      <Paper
        radius="lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        <Box p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconPackage size={18} color="#3B82F6" />
              <Text size="sm" fw={600} c="gray.1">
                Listado de Stock
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Mostrando {filtered.length} de {totalProducts} productos
            </Text>
          </Group>

          {/* Category tabs */}
          <SegmentedControl
            value={categoryTab}
            onChange={setCategoryTab}
            data={[
              { value: "all", label: "Todos" },
              { value: "EQUIPO", label: "📱 Equipos" },
              { value: "ACCESORIO", label: "🎧 Accesorios" },
              { value: "REPUESTO", label: "🔧 Repuestos" },
            ]}
            size="sm"
            mb="md"
            styles={{
              root: { background: "rgba(255,255,255,0.04)" },
            }}
          />

          <Group gap="md">
            <TextInput
              placeholder="Buscar por nombre o SKU..."
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
              placeholder="Filtrar por estado"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: "all", label: "Todos" },
                { value: "ok", label: "Stock OK" },
                { value: "low", label: "Stock Bajo" },
                { value: "out", label: "Agotado" },
              ]}
              value={stockFilter}
              onChange={setStockFilter}
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

        <ProductTable
          products={filtered}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {filtered.length === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No se encontraron productos
          </Text>
        )}

        <Divider color="dark.6" />
        <Group justify="space-between" p="md">
          <Text size="xs" c="dimmed">
            TecnoPro Cell ERP
          </Text>
          <Badge variant="dot" color="brand" size="xs">
            Sincronizado
          </Badge>
        </Group>
      </Paper>

      <ProductForm
        opened={formOpened}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editProduct}
      />
    </Stack>
  );
}
