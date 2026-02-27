import { useState, useEffect } from "react";
import {
  Modal,
  TextInput,
  NumberInput,
  Stack,
  Button,
  Group,
  Divider,
  SimpleGrid,
  Text,
  Paper,
  Table,
  ActionIcon,
  Tooltip,
  Badge,
  LoadingOverlay,
  Loader,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconSearch,
  IconShoppingCart,
  IconCurrencyDollar,
  IconMinus,
  IconUserCheck,
  IconUserPlus,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { Producto } from "../../../types";
import { PRODUCT_CATEGORIES } from "../../../lib/constants";
import {
  useProducts,
  useMonedas,
  useClientByCedula,
  useCreateClient,
} from "../../../services";

interface CartItem {
  productoId: string;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
}

export interface SaleFormValues {
  clienteId?: string;
  items: CartItem[];
  descuento_usd: number;
  tasas_snapshot: {
    VES: number;
    COP: number;
    timestamp: string;
  };
}

interface SaleFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: SaleFormValues) => void;
}

export function SaleForm({ opened, onClose, onSubmit }: SaleFormProps) {
  // -- DB exchange rates --
  const { data: monedas = [] } = useMonedas();
  const rateVES = monedas.find((m) => m.codigo === "VES")?.tasa_cambio ?? 0;
  const rateCOP = monedas.find((m) => m.codigo === "COP")?.tasa_cambio ?? 0;

  // -- Client lookup --
  const [cedula, setCedula] = useState("");
  const [clienteId, setClienteId] = useState<string | undefined>(undefined);
  const [newNombre, setNewNombre] = useState("");
  const [newTelefono, setNewTelefono] = useState("");
  const [newCorreo, setNewCorreo] = useState("");
  const { data: foundClient, isFetching: searchingClient } =
    useClientByCedula(cedula);
  const createClient = useCreateClient();

  // Auto-set clienteId when found
  useEffect(() => {
    if (foundClient) {
      setClienteId(foundClient.id);
    } else {
      setClienteId(undefined);
    }
  }, [foundClient]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [descuento, setDescuento] = useState<number>(0);
  const [productSearch, setProductSearch] = useState("");

  // -- Real products from API --
  const { data: allProducts = [], isLoading: loadingProducts } = useProducts();

  // Filter products not already in cart and with stock > 0
  const availableForAdd = allProducts.filter(
    (p) =>
      p.stock_actual > 0 &&
      !cart.find((c) => c.productoId === p.id) &&
      (productSearch === "" ||
        p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase())),
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + item.precio_unitario * item.cantidad,
    0,
  );
  const total = Math.max(0, subtotal - descuento);
  const costoTotal = cart.reduce(
    (sum, item) => sum + item.producto.costo_usd * item.cantidad,
    0,
  );
  const ganancia = total - costoTotal;

  const addProduct = (product: Producto) => {
    setCart((prev) => [
      ...prev,
      {
        productoId: product.id,
        producto: product,
        cantidad: 1,
        precio_unitario: product.precio_usd,
      },
    ]);
    setProductSearch("");
  };

  const removeProduct = (productoId: string) => {
    setCart((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const updateQuantity = (productoId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productoId !== productoId) return item;
        const newQty = Math.max(
          1,
          Math.min(item.producto.stock_actual, item.cantidad + delta),
        );
        return { ...item, cantidad: newQty };
      }),
    );
  };

  const updatePrice = (productoId: string, price: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productoId === productoId
          ? { ...item, precio_unitario: price }
          : item,
      ),
    );
  };

  const handleSubmit = () => {
    onSubmit({
      clienteId,
      items: cart,
      descuento_usd: descuento,
      tasas_snapshot: {
        VES: rateVES,
        COP: rateCOP,
        timestamp: new Date().toISOString(),
      },
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setCedula("");
    setClienteId(undefined);
    setNewNombre("");
    setNewTelefono("");
    setNewCorreo("");
    setCart([]);
    setDescuento(0);
    setProductSearch("");
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={
        <Group gap="xs">
          <IconShoppingCart size={20} />
          <Text fw={700}>Nueva Venta</Text>
        </Group>
      }
      size="xl"
      closeOnClickOutside={false}
    >
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={loadingProducts} />

        {/* ── 1. CLIENTE ── */}
        <Divider
          label={
            <Group gap={6}>
              <IconSearch size={14} />
              <Text size="sm" fw={600}>
                Cliente (Opcional)
              </Text>
            </Group>
          }
          labelPosition="left"
        />

        {/* Cédula lookup */}
        <TextInput
          label="Cédula del Cliente"
          placeholder="V-12345678"
          value={cedula}
          onChange={(e) => {
            setCedula(e.currentTarget.value);
            setNewNombre("");
            setNewTelefono("");
            setNewCorreo("");
          }}
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchingClient ? (
              <Loader size={14} />
            ) : foundClient ? (
              <IconUserCheck size={16} color="var(--mantine-color-green-6)" />
            ) : undefined
          }
          description={
            cedula.length >= 3 && !searchingClient
              ? foundClient
                ? "✅ Cliente encontrado"
                : "Cliente no registrado — completa los datos abajo"
              : "Escribe al menos 3 caracteres"
          }
          size="sm"
        />

        {/* Client found card */}
        {foundClient && cedula.length >= 3 && (
          <Paper
            p="sm"
            radius="md"
            style={{
              background: "rgba(34, 197, 94, 0.08)",
              border: "1px solid rgba(34, 197, 94, 0.2)",
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <IconUserCheck size={18} color="var(--mantine-color-green-6)" />
                <div>
                  <Text size="sm" fw={600} c="gray.1">
                    {foundClient.nombre}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {foundClient.cedula} • {foundClient.telefono}
                    {foundClient.correo ? ` • ${foundClient.correo}` : ""}
                  </Text>
                </div>
              </Group>
              <Badge variant="light" color="green" size="sm">
                {foundClient._count?.tickets ?? 0} tickets
              </Badge>
            </Group>
          </Paper>
        )}

        {/* New client form (when not found) */}
        {!foundClient && cedula.length >= 3 && !searchingClient && (
          <Paper
            p="md"
            radius="md"
            style={{
              background: "rgba(59, 130, 246, 0.05)",
              border: "1px dashed rgba(59, 130, 246, 0.2)",
            }}
          >
            <Group gap="xs" mb="sm">
              <IconUserPlus size={16} color="var(--mantine-color-blue-6)" />
              <Text size="sm" fw={600} c="gray.1">
                Nuevo Cliente
              </Text>
            </Group>
            <SimpleGrid cols={3}>
              <TextInput
                label="Nombre completo"
                placeholder="Juan Pérez"
                required
                value={newNombre}
                onChange={(e) => setNewNombre(e.currentTarget.value)}
                size="sm"
              />
              <TextInput
                label="Teléfono"
                placeholder="0414-1234567"
                required
                value={newTelefono}
                onChange={(e) => setNewTelefono(e.currentTarget.value)}
                size="sm"
              />
              <TextInput
                label="Correo (opcional)"
                placeholder="email@ejemplo.com"
                value={newCorreo}
                onChange={(e) => setNewCorreo(e.currentTarget.value)}
                size="sm"
              />
            </SimpleGrid>
            <Button
              mt="sm"
              size="sm"
              leftSection={<IconUserPlus size={14} />}
              disabled={!newNombre.trim() || !newTelefono.trim()}
              loading={createClient.isPending}
              onClick={async () => {
                try {
                  const newClient = await createClient.mutateAsync({
                    nombre: newNombre.trim(),
                    cedula: cedula.trim(),
                    telefono: newTelefono.trim(),
                    correo: newCorreo.trim() || undefined,
                  });
                  setClienteId(newClient.id);
                  notifications.show({
                    title: "Cliente registrado",
                    message: `${newClient.nombre} fue creado exitosamente`,
                    color: "green",
                  });
                } catch {
                  notifications.show({
                    title: "Error",
                    message: "No se pudo crear el cliente",
                    color: "red",
                  });
                }
              }}
            >
              Registrar Cliente
            </Button>
          </Paper>
        )}

        {/* ── 2. AGREGAR PRODUCTOS ── */}
        <Divider
          label={
            <Group gap={6}>
              <IconShoppingCart size={14} />
              <Text size="sm" fw={600}>
                Productos
              </Text>
            </Group>
          }
          labelPosition="left"
        />

        {/* Product search + quick add */}
        <Paper
          p="sm"
          radius="md"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px dashed var(--border-subtle)",
          }}
        >
          <TextInput
            placeholder="Buscar producto por nombre o SKU..."
            leftSection={<IconSearch size={16} />}
            value={productSearch}
            onChange={(e) => setProductSearch(e.currentTarget.value)}
            size="sm"
            mb={availableForAdd.length > 0 && productSearch ? "sm" : 0}
          />
          {productSearch && (
            <Stack gap={4} style={{ maxHeight: 200, overflowY: "auto" }}>
              {availableForAdd.slice(0, 6).map((product) => {
                const cat = PRODUCT_CATEGORIES[product.categoria];
                return (
                  <Paper
                    key={product.id}
                    p="xs"
                    radius="sm"
                    style={{
                      cursor: "pointer",
                      transition: "background 150ms",
                      background: "rgba(255,255,255,0.03)",
                    }}
                    onClick={() => addProduct(product)}
                  >
                    <Group justify="space-between">
                      <Group gap="xs">
                        <Badge variant="light" color={cat.color} size="xs">
                          {cat.label}
                        </Badge>
                        <Text size="sm" fw={500}>
                          {product.nombre}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {product.sku}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <Text size="xs" c="dimmed">
                          Stock: {product.stock_actual}
                        </Text>
                        <Text size="sm" fw={700} ff="monospace" c="brand">
                          ${product.precio_usd.toFixed(2)}
                        </Text>
                        <ActionIcon
                          variant="light"
                          color="brand"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            addProduct(product);
                          }}
                        >
                          <IconPlus size={14} />
                        </ActionIcon>
                      </Group>
                    </Group>
                  </Paper>
                );
              })}
              {availableForAdd.length === 0 && (
                <Text size="sm" c="dimmed" ta="center" py="xs">
                  No hay productos disponibles
                </Text>
              )}
            </Stack>
          )}
        </Paper>

        {/* ── CARRITO ── */}
        {cart.length > 0 ? (
          <Paper
            radius="md"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              overflow: "hidden",
            }}
          >
            <Table
              horizontalSpacing="sm"
              verticalSpacing="xs"
              styles={{
                th: {
                  color: "#94A3B8",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                },
                td: { borderColor: "rgba(255,255,255,0.04)" },
              }}
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Producto</Table.Th>
                  <Table.Th style={{ textAlign: "center", width: 130 }}>
                    Cantidad
                  </Table.Th>
                  <Table.Th style={{ textAlign: "right", width: 100 }}>
                    Precio $
                  </Table.Th>
                  <Table.Th style={{ textAlign: "right", width: 90 }}>
                    Subtotal
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", width: 50 }} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {cart.map((item) => (
                  <Table.Tr key={item.productoId}>
                    <Table.Td>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>
                          {item.producto.nombre}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {item.producto.sku} • Stock:{" "}
                          {item.producto.stock_actual}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="center">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="xs"
                          onClick={() => updateQuantity(item.productoId, -1)}
                          disabled={item.cantidad <= 1}
                        >
                          <IconMinus size={12} />
                        </ActionIcon>
                        <Text
                          size="sm"
                          fw={700}
                          ff="monospace"
                          w={30}
                          ta="center"
                        >
                          {item.cantidad}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="xs"
                          onClick={() => updateQuantity(item.productoId, 1)}
                          disabled={item.cantidad >= item.producto.stock_actual}
                        >
                          <IconPlus size={12} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <NumberInput
                        value={item.precio_unitario}
                        onChange={(v) =>
                          updatePrice(item.productoId, Number(v) || 0)
                        }
                        min={0}
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="$"
                        size="xs"
                        hideControls
                        w={85}
                        styles={{
                          input: {
                            textAlign: "right",
                            fontFamily: "monospace",
                            fontWeight: 600,
                          },
                        }}
                      />
                    </Table.Td>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text size="sm" fw={600} ff="monospace">
                        ${(item.precio_unitario * item.cantidad).toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label="Quitar">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="xs"
                          onClick={() => removeProduct(item.productoId)}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        ) : (
          <Paper
            p="xl"
            radius="md"
            ta="center"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px dashed var(--border-subtle)",
            }}
          >
            <IconShoppingCart
              size={32}
              style={{ opacity: 0.3, margin: "0 auto" }}
            />
            <Text size="sm" c="dimmed" mt="xs">
              Busca y agrega productos para comenzar
            </Text>
          </Paper>
        )}

        {/* ── 3. TOTALES ── */}
        {cart.length > 0 && (
          <>
            <Divider
              label={
                <Group gap={6}>
                  <IconCurrencyDollar size={14} />
                  <Text size="sm" fw={600}>
                    Resumen
                  </Text>
                </Group>
              }
              labelPosition="left"
            />
            <Paper
              p="md"
              radius="md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.05), rgba(34,197,94,0.05))",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Subtotal ({cart.reduce((s, i) => s + i.cantidad, 0)} items)
                  </Text>
                  <Text size="sm" ff="monospace" fw={600}>
                    ${subtotal.toFixed(2)}
                  </Text>
                </Group>
                <Group justify="space-between" align="center">
                  <Text size="sm" c="dimmed">
                    Descuento
                  </Text>
                  <NumberInput
                    value={descuento}
                    onChange={(v) => setDescuento(Number(v) || 0)}
                    min={0}
                    max={subtotal}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="-$"
                    size="xs"
                    hideControls
                    w={100}
                    styles={{
                      input: {
                        textAlign: "right",
                        fontFamily: "monospace",
                        color: "var(--mantine-color-red-6)",
                      },
                    }}
                  />
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="md" fw={700}>
                    TOTAL
                  </Text>
                  <Text
                    size="xl"
                    fw={900}
                    ff="monospace"
                    style={{ color: "var(--primary)" }}
                  >
                    ${total.toFixed(2)}
                  </Text>
                </Group>

                {/* Local currency equivalents */}
                <Divider variant="dashed" />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Equivalente VES
                  </Text>
                  <Text size="xs" ff="monospace" fw={600} c="blue">
                    Bs.{" "}
                    {(total * rateVES).toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Equivalente COP
                  </Text>
                  <Text size="xs" ff="monospace" fw={600} c="yellow">
                    $
                    {(total * rateCOP).toLocaleString("es-VE", {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Badge variant="light" color="blue" size="xs">
                    Tasa VES: Bs. {rateVES.toFixed(2)}
                  </Badge>
                  <Badge variant="light" color="yellow" size="xs">
                    Tasa COP: ${rateCOP.toFixed(2)}
                  </Badge>
                </Group>

                <Divider variant="dashed" />
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    Costo: ${costoTotal.toFixed(2)}
                  </Text>
                  <Text size="xs" fw={600} c={ganancia >= 0 ? "green" : "red"}>
                    Ganancia: ${ganancia.toFixed(2)}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          </>
        )}

        {/* ── ACCIONES ── */}
        <Group justify="flex-end" mt="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancelar
          </Button>
          <Button
            disabled={cart.length === 0}
            onClick={handleSubmit}
            leftSection={<IconShoppingCart size={16} />}
          >
            Registrar Venta — ${total.toFixed(2)}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
