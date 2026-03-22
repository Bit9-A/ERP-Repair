import {
  Table,
  Group,
  Stack,
  Text,
  ActionIcon,
  NumberInput,
  Tooltip,
} from "@mantine/core";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { CartItem } from "./hooks/useSaleCart";
import type { Producto } from "../../../../../types";

interface CartTableProps {
  cart: CartItem[];
  user: any;
  getLocalStock: (producto: Producto) => number;
  onUpdateQuantity: (productoId: string, delta: number) => void;
  onUpdatePrice: (productoId: string, price: number) => void;
  onRemoveProduct: (productoId: string) => void;
}

export function CartTable({
  cart,
  user,
  getLocalStock,
  onUpdateQuantity,
  onUpdatePrice,
  onRemoveProduct,
}: CartTableProps) {
  const isAdmin = user?.rol === "ADMIN";

  return (
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
        td: { borderColor: "var(--border-subtle)" },
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Producto</Table.Th>
          <Table.Th style={{ textAlign: "center", width: 130 }}>Cantidad</Table.Th>
          <Table.Th style={{ textAlign: "right", width: 100 }}>Precio $</Table.Th>
          <Table.Th style={{ textAlign: "right", width: 90 }}>Subtotal</Table.Th>
          <Table.Th style={{ textAlign: "center", width: 50 }} />
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {cart.map((item) => (
          <Table.Tr key={item.productoId}>
            <Table.Td>
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {item.producto.nombre}{" "}
                  {(item.producto.marca_comp || item.producto.modelo_comp) && (
                    <Text component="span" size="xs" c="dimmed">
                      ({item.producto.marca_comp} {item.producto.modelo_comp})
                    </Text>
                  )}
                </Text>
                <Text size="xs" c="dimmed" ff="monospace">
                  {item.producto.sku} • Stock: {isAdmin ? item.producto.stock_actual : getLocalStock(item.producto)}
                </Text>
              </Stack>
            </Table.Td>
            <Table.Td>
              <Group gap={4} justify="center">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={() => onUpdateQuantity(item.productoId, -1)}
                  disabled={item.cantidad <= 1}
                >
                  <IconMinus size={12} />
                </ActionIcon>
                <Text size="sm" fw={700} ff="monospace" w={30} ta="center">
                  {item.cantidad}
                </Text>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="xs"
                  onClick={() => {
                    const availableStock = getLocalStock(item.producto);
                    if (item.cantidad < availableStock) {
                      onUpdateQuantity(item.productoId, 1);
                    } else {
                      notifications.show({
                        title: "Stock tope alcanzado",
                        message: isAdmin
                          ? "Ya agregaste todo el inventario global"
                          : "Ya agregaste todo el inventario de esta sucursal",
                        color: "orange",
                      });
                    }
                  }}
                >
                  <IconPlus size={12} />
                </ActionIcon>
              </Group>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <NumberInput
                value={item.precio_unitario}
                onChange={(v) => onUpdatePrice(item.productoId, Number(v) || 0)}
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
                  onClick={() => onRemoveProduct(item.productoId)}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
