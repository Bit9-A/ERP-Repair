import { Table, Text, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import { StockStatusBadge } from "../../../components/ui/StatusBadge";
import type { Producto } from "../../../types";

interface ProductTableProps {
  products: Producto[];
  onEdit: (product: Producto) => void;
  onDelete: (product: Producto) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
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
        td: { borderColor: "rgba(255, 255, 255, 0.04)" },
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>SKU</Table.Th>
          <Table.Th>Nombre</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Stock</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Mínimo</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Precio USD</Table.Th>
          <Table.Th>Estado</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {products.map((product) => (
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
              <Text ff="monospace" size="sm" fw={600} c="gray.1">
                {product.sku}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="gray.2">
                {product.nombre}
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <Text ff="monospace" size="sm" fw={600} c="gray.1">
                {product.stock_actual}
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <Text ff="monospace" size="sm" c="dimmed">
                {product.stock_minimo}
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <Text ff="monospace" size="sm" fw={600} c="gray.1">
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
                <Tooltip label="Eliminar">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(product);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
