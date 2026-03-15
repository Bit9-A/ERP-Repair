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
  LoadingOverlay,
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconPlus,
  IconSearch,
  IconPackage,
  IconAlertTriangle,
  IconCurrencyDollar,
  IconDownload,
  IconFilter,
  IconArrowsExchange,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { ProductTable } from "../components/ProductTable";
import { ProductForm } from "../components/ProductForm";
import { AddStockModal } from "../components/AddStockModal";
import { TransferModal } from "../../sucursales/components/TransferModal";
import type { Producto } from "../../../types";
import type { ProductFormValues } from "../types/inventory.types";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddStock,
  useSucursales,
} from "../../../services";
import { useAuthStore } from "../../auth/store/auth.store";
import { usePermissions } from "../../../hooks/usePermissions";
import { exportInventoryExcel } from "../../../services/excel/exportInventoryExcel";
import { exportInventoryMovementsExcel } from "../../../services/excel/exportInventoryMovementsExcel";
import * as inventoryService from "../../../services/inventory.service";

export function InventoryPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [ownershipFilter, setOwnershipFilter] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState("all");
  const [editProduct, setEditProduct] = useState<Producto | null>(null);
  const [stockProduct, setStockProduct] = useState<Producto | null>(null);
  const [formOpened, { open: openForm, close: closeForm }] =
    useDisclosure(false);
  const [stockOpened, { open: openStock, close: closeStock }] =
    useDisclosure(false);
  const [transferOpened, { open: openTransfer, close: closeTransfer }] =
    useDisclosure(false);

  // -- Auth: derive branch filter from logged-in user --
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.rol === "ADMIN";
  // Non-ADMIN users are always locked to their own branch
  const lockedSucursalId = !isAdmin ? (currentUser?.sucursalId ?? null) : null;
  const [adminSucursalId, setAdminSucursalId] = useState<string | null>(
    searchParams.get("sucursalId") || null,
  );
  const activeSucursalId = isAdmin ? adminSucursalId : lockedSucursalId;

  const permisos = usePermissions();

  const { data: sucursales = [] } = useSucursales();
  const { data: products = [], isLoading } = useProducts(
    activeSucursalId ? { sucursalId: activeSucursalId } : undefined,
  );
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const addStock = useAddStock();
  const deleteProduct = useDeleteProduct();

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingMovs, setIsExportingMovs] = useState(false);

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
    const matchesOwnership =
      !ownershipFilter ||
      ownershipFilter === "all" ||
      p.propiedad === ownershipFilter;
    return matchesSearch && matchesCategory && matchesStock && matchesOwnership;
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

  const handleSubmit = async (
    values: ProductFormValues & {
      id?: string;
      isQuickAdd?: boolean;
      qtyAdded?: number;
      costo_unitario_usd?: number;
      sucursalId?: string;
    },
  ) => {
    try {
      if (values.id || editProduct) {
        const targetId = values.id || editProduct?.id;
        if (!targetId) return;

        if (values.isQuickAdd && values.qtyAdded) {
          // Send to addStock endpoint to properly log EGRESO and branch-specific entry
          await addStock.mutateAsync({
            id: targetId,
            cantidad: values.qtyAdded,
            costo_unitario_usd: values.costo_unitario_usd,
            sucursalId: values.sucursalId,
            nota: "Actualización Rápida (Compra)",
          });
        } else {
          // Standard metadata update via PUT
          const { isQuickAdd, qtyAdded, ...cleanValues } = values;
          await updateProduct.mutateAsync({ id: targetId, ...cleanValues });
        }

        notifications.show({
          title: "Stock actualizado",
          message: `${values.nombre} fue actualizado correctamente`,
          color: "green",
        });
      } else {
        await createProduct.mutateAsync(values);
        notifications.show({
          title: "Producto creado",
          message: `${values.nombre} fue agregado al inventario`,
          color: "green",
        });
      }
      closeForm();
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo guardar el producto",
        color: "red",
      });
    }
  };

  const handleDelete = async (product: Producto) => {
    if (!confirm(`¿Eliminar ${product.nombre}?`)) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      notifications.show({
        title: "Producto eliminado",
        message: `${product.nombre} fue eliminado del inventario`,
        color: "orange",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo eliminar el producto",
        color: "red",
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const activeSucursalName = isAdmin
        ? (adminSucursalId ? sucursales.find(s => s.id === adminSucursalId)?.nombre : "Global")
        : currentUser?.sucursal?.nombre;
      
      // Always pass the fully available matching array to excel so they have all info
      await exportInventoryExcel(products, activeSucursalName || undefined, currentUser?.nombre);
      notifications.show({
        title: "Exportación exitosa",
        message: "El archivo de inventario ha sido generado",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error al exportar",
        message: "No se pudo generar el documento Excel.",
        color: "red",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMovimientos = async () => {
    setIsExportingMovs(true);
    try {
      const activeSucursalName = isAdmin
        ? (adminSucursalId ? sucursales.find(s => s.id === adminSucursalId)?.nombre : "Global")
        : currentUser?.sucursal?.nombre;
      
      const movimientos = await inventoryService.getAllMovimientos(
        activeSucursalId ? { sucursalId: activeSucursalId } : undefined
      );

      await exportInventoryMovementsExcel(movimientos, activeSucursalName || undefined, currentUser?.nombre);
      
      notifications.show({
        title: "Exportación exitosa",
        message: "El historial de movimientos ha sido generado.",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error al exportar",
        message: "No se pudo generar el documento Excel de movimientos.",
        color: "red",
      });
    } finally {
      setIsExportingMovs(false);
    }
  };

  return (
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {/* Header */}
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Title order={2}>Inventario</Title>
        <Group gap="sm">
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconDownload size={16} />}
            size="sm"
            onClick={handleExport}
            loading={isExporting}
          >
            Exportar Inventario
          </Button>
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconDownload size={16} />}
            size="sm"
            onClick={handleExportMovimientos}
            loading={isExportingMovs}
          >
            Exportar Movimientos
          </Button>
          <Button
            variant="light"
            color="blue"
            leftSection={<IconArrowsExchange size={16} />}
            onClick={openTransfer}
            size="sm"
          >
            Trasladar Mercancía
          </Button>
          {permisos.inventario.crearProducto && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={handleNew}
              size="sm"
            >
              Nuevo Producto
            </Button>
          )}
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
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
          overflow: "hidden",
        }}
      >
        <Box p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconPackage size={18} color="#3B82F6" />
              <Text size="sm" fw={600}>
                {isAdmin
                  ? "Listado de Stock"
                  : `Stock en ${currentUser?.sucursal?.nombre ?? "tu sucursal"}`}
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              Mostrando {filtered.length} de {products.length} productos
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
              root: { background: "var(--bg-elevated)" },
            }}
          />

          <Group gap="md">
            {/* Branch filter: ADMIN can pick, non-ADMIN sees locked badge */}
            {isAdmin ? (
              <Select
                placeholder="Filtrar por sucursal..."
                leftSection={<IconFilter size={16} />}
                data={sucursales.map((s) => ({ value: s.id, label: s.nombre }))}
                value={adminSucursalId}
                onChange={setAdminSucursalId}
                clearable
                w={200}
                size="sm"
                styles={{
                  input: {
                    background: "var(--bg-elevated)",
                    borderColor: "var(--border-subtle)",
                  },
                }}
              />
            ) : lockedSucursalId ? (
              <Badge variant="filled" color="brand" size="lg">
                {currentUser?.sucursal?.nombre ?? "Mi Sucursal"}
              </Badge>
            ) : null}
            <TextInput
              placeholder="Buscar por nombre o SKU..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
              styles={{
                input: {
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
            <Select
              placeholder="Estado de stock"
              data={[
                { value: "all", label: "Todos" },
                { value: "ok", label: "Stock OK" },
                { value: "low", label: "Stock Bajo" },
                { value: "out", label: "Agotado" },
              ]}
              value={stockFilter}
              onChange={setStockFilter}
              clearable
              w={160}
              size="sm"
              styles={{
                input: {
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
            <Select
              placeholder="Propiedad"
              data={[
                { value: "all", label: "Todas" },
                { value: "PROPIA", label: "Propia" },
                { value: "PRESTADA", label: "Consignada/Prestada" },
              ]}
              value={ownershipFilter}
              onChange={setOwnershipFilter}
              clearable
              w={180}
              size="sm"
              styles={{
                input: {
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
          </Group>
        </Box>

        <Divider color="dark.6" />

        <div style={{ overflowX: "auto" }}>
          <ProductTable
            products={filtered}
            sucursalId={activeSucursalId}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddStock={(p) => {
              setStockProduct(p);
              openStock();
            }}
          />
        </div>

        {filtered.length === 0 && !isLoading && (
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
            {isLoading ? "Cargando..." : "Sincronizado"}
          </Badge>
        </Group>
      </Paper>

      <ProductForm
        opened={formOpened}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialData={editProduct}
        allProducts={products}
      />

      <AddStockModal
        opened={stockOpened}
        onClose={closeStock}
        producto={stockProduct}
      />

      <TransferModal opened={transferOpened} onClose={closeTransfer} />
    </Stack>
  );
}
