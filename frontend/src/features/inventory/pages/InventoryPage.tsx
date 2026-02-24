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

// -- Demo data matching Stitch inventory screen --
const DEMO_PRODUCTS: Producto[] = [
  {
    id: 1,
    sku: "PANT-LCD-A54",
    nombre: "Pantalla LCD Samsung A54",
    stock_actual: 8,
    stock_minimo: 5,
    precio_usd: 35.0,
  },
  {
    id: 2,
    sku: "BAT-IPH14",
    nombre: "Batería iPhone 14",
    stock_actual: 3,
    stock_minimo: 5,
    precio_usd: 22.5,
  },
  {
    id: 3,
    sku: "FLEX-CARGA-XR",
    nombre: "Flex de Carga Xiaomi Redmi",
    stock_actual: 12,
    stock_minimo: 5,
    precio_usd: 8.0,
  },
  {
    id: 4,
    sku: "PANT-OLED-S23",
    nombre: "Pantalla OLED Galaxy S23",
    stock_actual: 0,
    stock_minimo: 3,
    precio_usd: 120.0,
  },
  {
    id: 5,
    sku: "TAPA-MOT-G54",
    nombre: "Tapa Trasera Moto G54",
    stock_actual: 15,
    stock_minimo: 5,
    precio_usd: 12.0,
  },
  {
    id: 6,
    sku: "CAM-IPH13-POST",
    nombre: "Cámara Posterior iPhone 13",
    stock_actual: 2,
    stock_minimo: 3,
    precio_usd: 45.0,
  },
  {
    id: 7,
    sku: "CONJ-TORN-PRO",
    nombre: "Kit Tornillería Profesional",
    stock_actual: 25,
    stock_minimo: 10,
    precio_usd: 15.0,
  },
  {
    id: 8,
    sku: "MICA-TEMP-UNIV",
    nombre: "Mica Templada Universal",
    stock_actual: 50,
    stock_minimo: 20,
    precio_usd: 2.5,
  },
  {
    id: 9,
    sku: "PANT-IPH12-OEM",
    nombre: "Pantalla iPhone 12 OEM",
    stock_actual: 4,
    stock_minimo: 3,
    precio_usd: 65.0,
  },
  {
    id: 10,
    sku: "BAT-SAM-A34",
    nombre: "Batería Samsung Galaxy A34",
    stock_actual: 7,
    stock_minimo: 5,
    precio_usd: 18.0,
  },
];

export function InventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [products] = useState<Producto[]>(DEMO_PRODUCTS);
  const [editProduct, setEditProduct] = useState<Producto | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);

  const filtered = products.filter(
    (p) =>
      (p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())) &&
      (!categoryFilter ||
        categoryFilter === "all" ||
        (categoryFilter === "low" &&
          p.stock_actual > 0 &&
          p.stock_actual <= p.stock_minimo) ||
        (categoryFilter === "out" && p.stock_actual <= 0) ||
        (categoryFilter === "ok" && p.stock_actual > p.stock_minimo)),
  );

  // Stitch values
  const totalProducts = 142;
  const lowStock = 5;
  const totalValue = 12450.0;

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
      {/* Header — matching Stitch */}
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

      {/* Summary KPI Cards — Stitch values */}
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

      {/* Table section — "Listado de Stock" matching Stitch */}
      <Paper
        radius="lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          overflow: "hidden",
        }}
      >
        {/* Table header with search + filters */}
        <Box p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconPackage size={18} color="#3B82F6" />
              <Text size="sm" fw={600} c="gray.1">
                Listado de Stock
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Mostrando 1 a {filtered.length} de {totalProducts} productos
            </Text>
          </Group>

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
              value={categoryFilter}
              onChange={setCategoryFilter}
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

        {/* Table */}
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

        {/* Footer — matching Stitch */}
        <Divider color="dark.6" />
        <Group justify="space-between" p="md">
          <Text size="xs" c="dimmed">
            RepairShop ERP v2.4.0-PRO MAX
          </Text>
          <Group gap="xs">
            <Badge variant="dot" color="brand" size="xs">
              Sincronizado
            </Badge>
          </Group>
        </Group>
      </Paper>

      {/* Product Form Modal */}
      <ProductForm
        opened={formOpened}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editProduct}
      />
    </Stack>
  );
}
