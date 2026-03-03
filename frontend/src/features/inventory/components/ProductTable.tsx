import { Table, Text, Group, ActionIcon, Tooltip, Badge } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconBan, IconPackage } from "@tabler/icons-react";
import { StockStatusBadge } from "../../../components/ui/StatusBadge";
import { PRODUCT_CATEGORIES, PRODUCT_OWNERSHIP } from "../../../lib/constants";
import type { Producto } from "../../../types";

interface ProductTableProps {
  products: Producto[];
  onEdit: (product: Producto) => void;
  onDelete: (product: Producto) => void;
  onAddStock?: (product: Producto) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onAddStock,
}: ProductTableProps) {
  return (
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
          <Table.Th>SKU</Table.Th>
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Categoría</Table.Th>
          <Table.Th>Propiedad</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Stock</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Precio Prov.</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Precio Cliente</Table.Th>
          <Table.Th>Estado</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {products.map((product) => {
          const cat = PRODUCT_CATEGORIES[product.categoria];
          const own = PRODUCT_OWNERSHIP[product.propiedad];
          return (
            <Table.Tr
              key={product.id}
              style={{
                borderLeft:
                  product.stock_actual <= 0
                    ? "3px solid #EF4444"
                    : product.stock_actual <= product.stock_minimo
                      ? "3px solid #F59E0B"
                      : "3px solid transparent",
              }}
            >
              <Table.Td>
                <Text ff="monospace" size="sm" fw={600}>
                  {product.sku}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{product.nombre}</Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="filled" color={cat.color} size="sm">
                  {cat.label}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Badge variant="filled" color={own.color} size="sm">
                  {own.label}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" fw={600}>
                  {product.stock_actual}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" c="dimmed">
                  ${product.costo_usd.toFixed(2)}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" fw={600}>
                  ${product.precio_usd.toFixed(2)}
                </Text>
              </Table.Td>
              <Table.Td>
                <StockStatusBadge
                  actual={product.stock_actual}
                  minimo={product.stock_minimo}
                />
              </Table.Td>
              <Table.Td>
                <Group gap="xs" justify="center">
                  {onAddStock && (
                    <Tooltip label="Ingresar Stock">
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddStock(product);
                        }}
                      >
                        <IconPackage size={16} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(product);
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Desactivar">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        modals.openConfirmModal({
                          title: "Desactivar Producto",
                          centered: true,
                          children: (
                            <Text size="sm">
                              ¿Estás seguro de que deseas desactivar el producto{" "}
                              <strong>{product.nombre}</strong>? Esta acción lo
                              ocultará del inventario pero mantendrá su
                              historial. Sólo es posible si el stock es cero.
                            </Text>
                          ),
                          labels: { confirm: "Desactivar", cancel: "Cancelar" },
                          confirmProps: { color: "red" },
                          onConfirm: () => onDelete(product),
                        });
                      }}
                    >
                      <IconBan size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}
