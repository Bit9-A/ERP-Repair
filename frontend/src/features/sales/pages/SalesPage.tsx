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
  LoadingOverlay,
} from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
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
import {
  useSales,
  useCreateSale,
  useMarcarPagada,
  useAnularVenta,
} from "../../../services";
import { useAuthStore } from "../../../features/auth/store/auth.store";

export function SalesPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [detailSale, setDetailSale] = useState<Venta | null>(null);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [saleFormOpened, { open: openSaleForm, close: closeSaleForm }] =
    useDisclosure(false);

  // -- Context hooks --
  const { user } = useAuthStore();

  // -- API hooks --
  const { data: sales = [], isLoading } = useSales();
  const createSale = useCreateSale();
  const marcarPagada = useMarcarPagada();
  const anularVenta = useAnularVenta();

  const filtered = sales.filter((s) => {
    const matchesSearch =
      `V-${s.numero}`.toLowerCase().includes(search.toLowerCase()) ||
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

  const handleCreateSale = async (values: SaleFormValues) => {
    try {
      await createSale.mutateAsync({
        clienteId: values.clienteId,
        sucursalId: user?.sucursalId,
        items: values.items.map((i) => ({
          productoId: i.productoId,
          cantidad: i.cantidad,
        })),
        descuento_usd: values.descuento_usd,
        // ✅ Pasar los datos de pago para que el backend registre el INGRESO
        pago: values.pago,
      });
      notifications.show({
        title: "Venta registrada",
        message: "La venta fue creada correctamente",
        color: "green",
      });
      closeSaleForm();
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo registrar la venta",
        color: "red",
      });
    }
  };

  const handleMarcarPagada = async (id: string) => {
    try {
      await marcarPagada.mutateAsync(id);
      notifications.show({
        title: "Venta pagada",
        message: "La venta fue marcada como pagada",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo marcar como pagada",
        color: "red",
      });
    }
  };

  const handleAnular = async (id: string) => {
    if (!confirm("¿Anular esta venta?")) return;
    try {
      await anularVenta.mutateAsync(id);
      notifications.show({
        title: "Venta anulada",
        message: "La venta fue anulada",
        color: "orange",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudo anular la venta",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {/* Header */}
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="xs">
          <IconShoppingCart size={24} color="var(--primary)" />
          <Title order={2}>Ventas</Title>
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
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
          overflow: "hidden",
        }}
      >
        <Box p="md">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <IconShoppingCart size={18} color="var(--primary)" />
              <Text size="sm" fw={600}>
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
                  background: "var(--bg-elevated)",
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

        <div style={{ overflowX: "auto" }}>
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
              td: {
                borderColor: "var(--border-subtle)",
                paddingTop: "14px",
                paddingBottom: "14px",
              },
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
                  <Table.Tr
                    key={sale.id}
                    onClick={() => handleViewDetail(sale)}
                  >
                    <Table.Td>
                      <Text ff="monospace" size="sm" fw={600}>
                        V-{sale.numero}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {sale.cliente?.nombre || "Sin cliente"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{sale.vendedor?.nombre || "N/A"}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text ff="monospace" size="sm" fw={700}>
                        ${sale.total_usd.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="filled" color={status.color} size="sm">
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarcarPagada(sale.id);
                                }}
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                            </Tooltip>
                            <Tooltip label="Anular">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAnular(sale.id);
                                }}
                              >
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
        </div>

        {filtered.length === 0 && !isLoading && (
          <Text ta="center" c="dimmed" py="xl">
            No se encontraron ventas
          </Text>
        )}

        <Divider color="dark.6" />
        <Group justify="space-between" p="md">
          <Text size="xs" c="dimmed">
            TecnoPro Cell ERP
          </Text>
          <Badge variant="filled" color="brand" size="xs">
            {isLoading ? "Cargando..." : "Sincronizado"}
          </Badge>
        </Group>
      </Paper>

      {/* Sale Detail Modal */}
      <Modal
        opened={detailOpened}
        onClose={closeDetail}
        title={`Detalle Venta V-${detailSale?.numero || ""}`}
        size="lg"
        closeOnClickOutside={false}
        closeOnEscape={false}
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
                  variant="filled"
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

            {/* Pagos registrados */}
            {detailSale.pagos && detailSale.pagos.length > 0 && (
              <>
                <Divider />
                <Text size="sm" fw={600}>
                  Pagos Registrados
                </Text>
                <Table withColumnBorders withRowBorders={false} fz="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Moneda</Table.Th>
                      <Table.Th>Método</Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Monto local
                      </Table.Th>
                      <Table.Th style={{ textAlign: "right" }}>
                        Equivalente USD
                      </Table.Th>
                      <Table.Th>Referencia</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {detailSale.pagos.map((pago) => (
                      <Table.Tr key={pago.id}>
                        <Table.Td>
                          <Badge
                            variant="filled"
                            color={
                              pago.moneda?.codigo === "USD"
                                ? "brand"
                                : pago.moneda?.codigo === "VES"
                                  ? "blue"
                                  : "yellow"
                            }
                            size="sm"
                          >
                            {pago.moneda?.codigo ?? "—"}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="filled" color="gray" size="sm">
                            {pago.metodo}
                          </Badge>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>
                          <Text ff="monospace" size="sm" fw={600}>
                            {pago.monto_moneda_local.toLocaleString("es-VE", {
                              minimumFractionDigits: 2,
                            })}{" "}
                            {pago.moneda?.codigo}
                          </Text>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>
                          <Text ff="monospace" size="sm" fw={700} c="brand">
                            ${pago.equivalente_usd.toFixed(2)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {pago.referencia ?? "—"}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </>
            )}

            {/* Frozen exchange rates — Feature 1 */}
            {detailSale.tasas_cambio_snapshot &&
              Object.keys(detailSale.tasas_cambio_snapshot).length > 0 && (
                <>
                  <Divider />
                  <Text size="sm" fw={600}>
                    Tasas al Momento de la Venta
                  </Text>
                  <Group gap="xl">
                    {Object.entries(detailSale.tasas_cambio_snapshot).map(
                      ([codigo, tasa]) => (
                        <div key={codigo}>
                          <Text size="xs" c="dimmed">
                            Tasa {codigo}
                          </Text>
                          <Text ff="monospace" fw={600} c="blue">
                            {tasa.toFixed(2)} {codigo}/USD
                          </Text>
                          <Text size="xs" c="dimmed">
                            Total ≈{" "}
                            {(detailSale.total_usd * tasa).toLocaleString(
                              "es-VE",
                              { minimumFractionDigits: 2 },
                            )}{" "}
                            {codigo}
                          </Text>
                        </div>
                      ),
                    )}
                  </Group>
                  <Text size="xs" c="dimmed">
                    Capturado:{" "}
                    {new Date(detailSale.createdAt).toLocaleString("es-VE")}
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
