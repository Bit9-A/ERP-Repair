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
  Table,
  ActionIcon,
  Tooltip,
  Modal,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconPlus,
  IconSearch,
  IconShoppingCart,
  IconCurrencyDollar,
  IconReceipt,
  IconFilter,
  IconEye,
  IconBan,
  IconCheck,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { SaleForm } from "../components/SaleForm";
import type { SaleFormValues } from "../components/SaleForm";
import { SALE_STATUS } from "../../../lib/constants";
import type { Venta } from "../../../types";

// -- Demo data --
const DEMO_SALES: Venta[] = [
  {
    id: "v1",
    codigo: "V-001",
    clienteId: "c1",
    cliente: {
      id: "c1",
      nombre: "María Pérez",
      cedula: "V-12345678",
      telefono: "0414-1234567",
    },
    vendedorId: "u1",
    vendedor: {
      id: "u1",
      nombre: "Carlos Mendoza",
      rol: "ADMIN",
      email: "carlos@tecnopro.com",
      porcentaje_comision_base: 0,
      createdAt: "",
    },
    subtotal_usd: 45,
    descuento_usd: 0,
    total_usd: 45,
    estado: "PAGADA",
    items: [
      {
        id: "vi1",
        ventaId: "v1",
        productoId: "p3",
        cantidad: 2,
        precio_congelado_usd: 8,
        costo_congelado_usd: 2,
        producto: {
          id: "p3",
          sku: "FUNDA-IPH15-PRO",
          nombre: "Funda Silicona iPhone 15 Pro",
          categoria: "ACCESORIO",
          propiedad: "PRESTADA",
          propietario: "Distribuidora XYZ",
          stock_actual: 18,
          stock_minimo: 10,
          costo_usd: 2,
          precio_usd: 8,
        },
      },
      {
        id: "vi2",
        ventaId: "v1",
        productoId: "p10",
        cantidad: 3,
        precio_congelado_usd: 2.5,
        costo_congelado_usd: 0.5,
        producto: {
          id: "p10",
          sku: "MICA-TEMP-UNIV",
          nombre: "Mica Templada Universal",
          categoria: "ACCESORIO",
          propiedad: "PROPIA",
          stock_actual: 47,
          stock_minimo: 20,
          costo_usd: 0.5,
          precio_usd: 2.5,
        },
      },
      {
        id: "vi3",
        ventaId: "v1",
        productoId: "p5",
        cantidad: 1,
        precio_congelado_usd: 12,
        costo_congelado_usd: 4,
        producto: {
          id: "p5",
          sku: "CARG-USBC-25W",
          nombre: "Cargador USB-C 25W",
          categoria: "ACCESORIO",
          propiedad: "PROPIA",
          stock_actual: 14,
          stock_minimo: 5,
          costo_usd: 4,
          precio_usd: 12,
        },
      },
    ],
    createdAt: "2026-02-24T15:30:00Z",
    tasas_snapshot: { VES: 39.8, COP: 4100, timestamp: "2026-02-24T15:30:00Z" },
  },
  {
    id: "v2",
    codigo: "V-002",
    vendedorId: "u1",
    vendedor: {
      id: "u1",
      nombre: "Carlos Mendoza",
      rol: "ADMIN",
      email: "carlos@tecnopro.com",
      porcentaje_comision_base: 0,
      createdAt: "",
    },
    subtotal_usd: 250,
    descuento_usd: 10,
    total_usd: 240,
    estado: "PENDIENTE",
    items: [
      {
        id: "vi4",
        ventaId: "v2",
        productoId: "p6",
        cantidad: 1,
        precio_congelado_usd: 250,
        costo_congelado_usd: 180,
        producto: {
          id: "p6",
          sku: "IPH-12-64-USED",
          nombre: "iPhone 12 64GB (Usado)",
          categoria: "EQUIPO",
          propiedad: "PRESTADA",
          propietario: "Carlos M.",
          stock_actual: 0,
          stock_minimo: 0,
          costo_usd: 180,
          precio_usd: 250,
        },
      },
    ],
    createdAt: "2026-02-24T16:45:00Z",
    tasas_snapshot: { VES: 40.5, COP: 4150, timestamp: "2026-02-24T16:45:00Z" },
  },
  {
    id: "v3",
    codigo: "V-003",
    clienteId: "c2",
    cliente: {
      id: "c2",
      nombre: "Juan Rodríguez",
      cedula: "V-87654321",
      telefono: "0412-9876543",
    },
    vendedorId: "u1",
    vendedor: {
      id: "u1",
      nombre: "Carlos Mendoza",
      rol: "ADMIN",
      email: "carlos@tecnopro.com",
      porcentaje_comision_base: 0,
      createdAt: "",
    },
    subtotal_usd: 165,
    descuento_usd: 5,
    total_usd: 160,
    estado: "PAGADA",
    items: [
      {
        id: "vi5",
        ventaId: "v3",
        productoId: "p9",
        cantidad: 1,
        precio_congelado_usd: 165,
        costo_congelado_usd: 120,
        producto: {
          id: "p9",
          sku: "SAM-A15-128-NEW",
          nombre: "Samsung Galaxy A15 128GB (Nuevo)",
          categoria: "EQUIPO",
          propiedad: "PROPIA",
          stock_actual: 1,
          stock_minimo: 1,
          costo_usd: 120,
          precio_usd: 165,
        },
      },
    ],
    createdAt: "2026-02-23T10:15:00Z",
    tasas_snapshot: { VES: 38.5, COP: 4080, timestamp: "2026-02-23T10:15:00Z" },
  },
  {
    id: "v4",
    codigo: "V-004",
    subtotal_usd: 35,
    descuento_usd: 0,
    total_usd: 35,
    estado: "ANULADA",
    items: [],
    createdAt: "2026-02-22T09:00:00Z",
  },
];

export function SalesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sales] = useState<Venta[]>(DEMO_SALES);
  const [detailSale, setDetailSale] = useState<Venta | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [saleFormOpened, { open: openSaleForm, close: closeSaleForm }] =
    useDisclosure(false);

  const filtered = sales.filter((s) => {
    const matchesSearch =
      s.codigo.toLowerCase().includes(search.toLowerCase()) ||
      s.cliente?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      false;
    const matchesStatus =
      !statusFilter || statusFilter === "all" || s.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeSales = sales.filter((s) => s.estado !== "ANULADA");
  const ventasHoy = activeSales.length;
  const ingresosHoy = activeSales.reduce((sum, s) => sum + s.total_usd, 0);
  const pendientes = sales.filter((s) => s.estado === "PENDIENTE").length;

  const handleViewDetail = (sale: Venta) => {
    setDetailSale(sale);
    openDetail();
  };

  const handleCreateSale = (values: SaleFormValues) => {
    console.log("Nueva venta:", values);
    // TODO: API call
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <IconShoppingCart size={24} color="var(--primary)" />
          <Title order={2} c="gray.1">
            Ventas
          </Title>
        </Group>
        <Button
          leftSection={<IconPlus size={16} />}
          size="sm"
          onClick={openSaleForm}
        >
          Nueva Venta
        </Button>
      </Group>

      {/* KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <StatCard
          title="Ventas Hoy"
          value={ventasHoy}
          icon={<IconReceipt size={20} />}
          accentColor="#3B82F6"
        />
        <StatCard
          title="Ingresos Hoy"
          value={`$${ingresosHoy.toFixed(2)}`}
          icon={<IconCurrencyDollar size={20} />}
          accentColor="#22C55E"
        />
        <StatCard
          title="Pendientes"
          value={pendientes}
          icon={<IconShoppingCart size={20} />}
          accentColor="#F59E0B"
        />
      </SimpleGrid>

      {/* Sales table */}
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
              <IconShoppingCart size={18} color="var(--primary)" />
              <Text size="sm" fw={600} c="gray.1">
                Historial de Ventas
              </Text>
            </Group>
            <Text size="xs" c="dimmed">
              {filtered.length} ventas
            </Text>
          </Group>

          <Group gap="md">
            <TextInput
              placeholder="Buscar por código o cliente..."
              leftSection={<IconSearch size={16} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ flex: 1 }}
              size="sm"
              styles={{
                input: {
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
            <Select
              placeholder="Estado"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: "all", label: "Todos" },
                { value: "PENDIENTE", label: "Pendiente" },
                { value: "PAGADA", label: "Pagada" },
                { value: "ANULADA", label: "Anulada" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              w={160}
              size="sm"
              styles={{
                input: {
                  background: "rgba(255,255,255,0.04)",
                  borderColor: "var(--border-subtle)",
                },
              }}
            />
          </Group>
        </Box>

        <Divider color="dark.6" />

        <Table
          highlightOnHover
          horizontalSpacing="md"
          verticalSpacing="sm"
          styles={{
            tr: { transition: "background 200ms ease", cursor: "pointer" },
            th: {
              color: "#94A3B8",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            },
            td: { borderColor: "rgba(255,255,255,0.04)" },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Código</Table.Th>
              <Table.Th>Cliente</Table.Th>
              <Table.Th>Vendedor</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Total</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Fecha</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filtered.map((sale) => {
              const status = SALE_STATUS[sale.estado];
              return (
                <Table.Tr key={sale.id} onClick={() => handleViewDetail(sale)}>
                  <Table.Td>
                    <Text ff="monospace" size="sm" fw={600} c="gray.1">
                      {sale.codigo}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="gray.2">
                      {sale.cliente?.nombre || "Sin cliente"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="gray.3">
                      {sale.vendedor?.nombre || "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text ff="monospace" size="sm" fw={700} c="gray.1">
                      ${sale.total_usd.toFixed(2)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={status.color} size="sm">
                      {status.label}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" c="dimmed">
                      {new Date(sale.createdAt).toLocaleDateString("es-VE")}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      <Tooltip label="Ver detalle">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(sale);
                          }}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      {sale.estado === "PENDIENTE" && (
                        <>
                          <Tooltip label="Marcar pagada">
                            <ActionIcon
                              variant="subtle"
                              color="green"
                              size="sm"
                            >
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Anular">
                            <ActionIcon variant="subtle" color="red" size="sm">
                              <IconBan size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>

        {filtered.length === 0 && (
          <Text ta="center" c="dimmed" py="xl">
            No se encontraron ventas
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

      {/* Sale Detail Modal */}
      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        title={`Detalle Venta ${detailSale?.codigo || ""}`}
        size="lg"
      >
        {detailSale && (
          <Stack gap="md">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">
                  Cliente
                </Text>
                <Text size="sm" fw={600}>
                  {detailSale.cliente?.nombre || "Sin cliente"}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Vendedor
                </Text>
                <Text size="sm" fw={600}>
                  {detailSale.vendedor?.nombre || "—"}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Estado
                </Text>
                <Badge
                  variant="light"
                  color={SALE_STATUS[detailSale.estado].color}
                >
                  {SALE_STATUS[detailSale.estado].label}
                </Badge>
              </div>
            </Group>

            <Divider />

            <Text size="sm" fw={600}>
              Productos
            </Text>
            <Table withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Cant.</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>
                    Precio Unit.
                  </Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Subtotal</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {detailSale.items?.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text size="sm">
                        {item.producto?.nombre || item.productoId}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" ff="monospace">
                        {item.cantidad}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" ff="monospace">
                        ${item.precio_congelado_usd.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" ff="monospace" fw={600}>
                        $
                        {(item.precio_congelado_usd * item.cantidad).toFixed(2)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            <Divider />

            <Group justify="flex-end" gap="xl">
              <div>
                <Text size="xs" c="dimmed">
                  Subtotal
                </Text>
                <Text ff="monospace" fw={600}>
                  ${detailSale.subtotal_usd.toFixed(2)}
                </Text>
              </div>
              {detailSale.descuento_usd > 0 && (
                <div>
                  <Text size="xs" c="dimmed">
                    Descuento
                  </Text>
                  <Text ff="monospace" fw={600} c="red">
                    -${detailSale.descuento_usd.toFixed(2)}
                  </Text>
                </div>
              )}
              <div>
                <Text size="xs" c="dimmed">
                  Total
                </Text>
                <Text ff="monospace" fw={700} size="lg" c="brand">
                  ${detailSale.total_usd.toFixed(2)}
                </Text>
              </div>
            </Group>

            {/* Frozen exchange rates */}
            {detailSale.tasas_snapshot && (
              <>
                <Divider />
                <Text size="sm" fw={600}>
                  Tasas al Momento de la Venta
                </Text>
                <Group gap="xl">
                  <div>
                    <Text size="xs" c="dimmed">
                      Tasa VES
                    </Text>
                    <Text ff="monospace" fw={600} c="blue">
                      Bs. {detailSale.tasas_snapshot.VES.toFixed(2)}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Tasa COP
                    </Text>
                    <Text ff="monospace" fw={600} c="yellow">
                      ${detailSale.tasas_snapshot.COP.toFixed(2)}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Total VES
                    </Text>
                    <Text ff="monospace" fw={600} c="blue">
                      Bs.{" "}
                      {(
                        detailSale.total_usd * detailSale.tasas_snapshot.VES
                      ).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Total COP
                    </Text>
                    <Text ff="monospace" fw={600} c="yellow">
                      $
                      {(
                        detailSale.total_usd * detailSale.tasas_snapshot.COP
                      ).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </Text>
                  </div>
                </Group>
                <Text size="xs" c="dimmed">
                  Capturado:{" "}
                  {new Date(detailSale.tasas_snapshot.timestamp).toLocaleString(
                    "es-VE",
                  )}
                </Text>
              </>
            )}
          </Stack>
        )}
      </Modal>

      {/* Sale Registration Form */}
      <SaleForm
        opened={saleFormOpened}
        onClose={closeSaleForm}
        onSubmit={handleCreateSale}
      />
    </Stack>
  );
}
