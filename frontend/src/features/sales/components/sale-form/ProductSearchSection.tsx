import { useState } from "react";
import {
  Paper,
  Group,
  TextInput,
  Tooltip,
  ActionIcon,
  Stack,
  Text,
  Badge,
  Modal,
  NumberInput,
  Button,
  Divider,
} from "@mantine/core";
import { IconSearch, IconScan, IconPlus, IconShoppingCart } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { BarcodeScanner } from "../BarcodeScanner";
import type { Producto } from "../../../../types";
import { PRODUCT_CATEGORIES } from "../../../../lib/constants";
import { formatCurrency } from "../../../../utils/currency";
import type { CartItem } from "./hooks/useSaleCart";

interface ProductSearchSectionProps {
  allProducts: Producto[];
  cart: CartItem[];
  user: any; // from useAuthStore
  getLocalStock: (producto: Producto) => number;
  onAddProduct: (producto: Producto, qtyToAdd?: number) => void;
}

export function ProductSearchSection({
  allProducts,
  cart,
  user,
  getLocalStock,
  onAddProduct,
}: ProductSearchSectionProps) {
  const [productSearch, setProductSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [pendingScanProduct, setPendingScanProduct] = useState<Producto | null>(null);
  const [pendingScanQty, setPendingScanQty] = useState<number | string>(1);

  const isAdmin = user?.rol === "ADMIN";

  // Search logic
  const availableForAdd = allProducts.filter((p) => {
    if (cart.some((item) => item.productoId === p.id)) return false;
    const sList = p.nombre.toLowerCase().includes(productSearch.toLowerCase());
    const sSku = p.sku.toLowerCase().includes(productSearch.toLowerCase());
    if (!sList && !sSku) return false;
    return true;
  });

  const handleBarcodeScan = (code: string) => {
    const normalizedCode = code.trim();
    const cleanCode = normalizedCode.replace(/^0+/, "").toLowerCase();

    const product = allProducts.find(
      (p) =>
        p.sku.toLowerCase() === normalizedCode.toLowerCase() ||
        p.sku.toLowerCase() === cleanCode
    );

    setScannerOpen(false);

    if (product) {
      setPendingScanProduct(product);
      setPendingScanQty(1);
    } else {
      notifications.show({
        title: "Producto no encontrado",
        message: `No se encontró el código: ${normalizedCode}`,
        color: "red",
      });
    }
  };

  const confirmScanAdd = () => {
    if (!pendingScanProduct) return;

    const qtyToAdd = Number(pendingScanQty);
    if (!qtyToAdd || qtyToAdd <= 0) {
      notifications.show({
        title: "Inválido",
        message: "Ingrese una cantidad mayor a 0",
        color: "red",
      });
      return;
    }

    // `onAddProduct` from useSaleCart handles checking stock and adding to existing
    onAddProduct(pendingScanProduct, qtyToAdd);
    setPendingScanProduct(null);
  };

  return (
    <>
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

      <BarcodeScanner
        opened={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onDetected={handleBarcodeScan}
      />

      <Paper
        p="sm"
        radius="md"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px dashed var(--border-subtle)",
        }}
      >
        <Group gap="xs" align="flex-end">
          <TextInput
            placeholder="Buscar producto por nombre o SKU..."
            leftSection={<IconSearch size={16} />}
            value={productSearch}
            onChange={(e) => setProductSearch(e.currentTarget.value)}
            size="sm"
            style={{ flex: 1 }}
          />
          <Tooltip label="Escanear código de barras">
            <ActionIcon
              variant="light"
              color="green"
              size="lg"
              onClick={() => setScannerOpen(true)}
              style={{ transition: "transform 150ms ease" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
            >
              <IconScan size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {productSearch && (
          <Stack gap={4} style={{ maxHeight: 200, overflowY: "auto", marginTop: 8 }}>
            {availableForAdd.slice(0, 6).map((product) => {
              const cat = PRODUCT_CATEGORIES[product.categoria];
              const localStock = getLocalStock(product);
              const canAdd = localStock > 0;

              // Information about stock in other branches
              let otherBranches: { nombre: string; stock: number }[] = [];
              if (product.inventario_sucursales) {
                otherBranches = product.inventario_sucursales
                  .filter((inv: { sucursalId: string; stock: number; sucursal: { nombre: string } }) => inv.sucursalId !== user?.sucursalId && inv.stock > 0)
                  .map((inv: { sucursalId: string; stock: number; sucursal: { nombre: string } }) => ({
                    nombre: inv.sucursal.nombre,
                    stock: inv.stock,
                  }));
              }

              return (
                <Paper
                  key={product.id}
                  p="xs"
                  radius="sm"
                  style={{
                    cursor: canAdd ? "pointer" : "default",
                    transition: "background 150ms",
                    background: "var(--bg-elevated)",
                    opacity: canAdd ? 1 : 0.7,
                  }}
                  onClick={() => {
                    if (canAdd) {
                      onAddProduct(product, 1);
                      setProductSearch("");
                    }
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group gap="xs">
                      <Badge variant="filled" color={cat?.color || "gray"} size="xs">
                        {cat?.label || "Desconocido"}
                      </Badge>
                      <Stack gap={0}>
                        <Text size="sm" fw={500}>
                          {product.nombre}{" "}
                          {(product.marca_comp || product.modelo_comp) && (
                            <Text component="span" size="xs" c="dimmed">
                              ({product.marca_comp} {product.modelo_comp})
                            </Text>
                          )}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace">
                          {product.sku}
                        </Text>
                      </Stack>
                    </Group>
                    <Stack align="flex-end" gap={4}>
                      <Group gap="xs">
                        <Stack gap={0} align="flex-end">
                          <Text size="xs" c={canAdd ? "dimmed" : "red.6"}>
                            Stock: {isAdmin ? product.stock_actual : localStock}
                          </Text>
                          {!canAdd && otherBranches.length > 0 && (
                            <Text fz={10} c="yellow.7">
                              En: {otherBranches.map((b) => `${b.nombre} (${b.stock})`).join(", ")}
                            </Text>
                          )}
                        </Stack>
                        <Text size="sm" fw={700} ff="monospace" c="brand">
                          ${formatCurrency(product.precio_usd)}
                        </Text>
                        <ActionIcon
                          variant="light"
                          color="brand"
                          size="sm"
                          disabled={!canAdd}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (canAdd) {
                              onAddProduct(product, 1);
                              setProductSearch("");
                            }
                          }}
                        >
                          <IconPlus size={14} />
                        </ActionIcon>
                      </Group>
                    </Stack>
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

      {/* Confirmation Modal for Scanned Product */}
      <Modal
        opened={!!pendingScanProduct}
        onClose={() => setPendingScanProduct(null)}
        title="Escaneo Detectado"
        size="sm"
        centered
        closeOnClickOutside={false}
        closeOnEscape={false}
      >
        {pendingScanProduct && (
          <Stack gap="md">
            <Paper p="sm" bg="var(--bg-elevated)" radius="md">
              <Group justify="space-between" mb="xs">
                <Text fw={600}>{pendingScanProduct.nombre}</Text>
                <Badge variant="filled" color="blue">
                  Stock: {getLocalStock(pendingScanProduct)}
                </Badge>
              </Group>
              <Text size="sm" c="dimmed">
                Precio Unitario: ${pendingScanProduct.precio_usd.toFixed(2)}
              </Text>
            </Paper>

            <NumberInput
              label="Cantidad a vender"
              min={1}
              max={getLocalStock(pendingScanProduct)}
              value={pendingScanQty}
              onChange={(v) => setPendingScanQty(v)}
              size="md"
            />

            <Group justify="flex-end" mt="sm">
              <Button variant="light" color="gray" onClick={() => setPendingScanProduct(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmScanAdd}>Añadir al Carrito</Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}
