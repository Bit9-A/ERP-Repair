import {
  Table,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Badge,
  Stack,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconBan, IconPackage } from "@tabler/icons-react";
import { StockStatusBadge } from "../../../components/ui/StatusBadge";
import { PRODUCT_CATEGORIES, PRODUCT_OWNERSHIP } from "../../../lib/constants";
import type { Producto } from "../../../types";
import { usePermissions } from "../../../hooks/usePermissions";

interface ProductTableProps {
  products: Producto[];
  onEdit: (product: Producto) => void;
  onDelete: (product: Producto) => void;
  onAddStock?: (product: Producto) => void;
  /** When set, show per-branch stock (stock_sucursal) instead of global */
  sucursalId?: string | null;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onAddStock,
  sucursalId,
}: ProductTableProps) {
  const permisos = usePermissions();

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
          paddingTop: "12px",
          paddingBottom: "12px",
        },
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>SKU</Table.Th>
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Marca / Modelo</Table.Th>
          <Table.Th>Categoría</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>
            {sucursalId ? "Stock Sucursal" : "Stock Global"}
          </Table.Th>
          {!sucursalId && <Table.Th>Por Sucursal</Table.Th>}
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

          // Stock to display: branch view uses stock_sucursal, global uses stock_actual
          const displayStock = sucursalId
            ? (product.stock_sucursal ?? 0)
            : product.stock_actual;

          // For red/yellow left border use displayStock
          const stockMinimo = product.stock_minimo;

          return (
            <Table.Tr
              key={product.id}
              style={{
                borderLeft:
                  displayStock <= 0
                    ? "3px solid #EF4444"
                    : displayStock <= stockMinimo
                      ? "3px solid #F59E0B"
                      : "3px solid transparent",
              }}
            >
              {/* SKU */}
              <Table.Td>
                <Text ff="monospace" size="sm" fw={600}>
                  {product.sku}
                </Text>
              </Table.Td>

              {/* Nombre + Propiedad */}
              <Table.Td>
                <Stack gap={2}>
                  <Text size="sm" fw={500}>
                    {product.nombre}
                  </Text>
                  <Badge variant="dot" color={own.color} size="xs">
                    {own.label}
                  </Badge>
                </Stack>
              </Table.Td>

              {/* Marca / Modelo */}
              <Table.Td>
                <Stack gap={2}>
                  {product.marca_comp ? (
                    <Text size="sm" fw={500}>
                      {product.marca_comp}
                    </Text>
                  ) : (
                    <Text size="xs" c="dimmed" fs="italic">
                      —
                    </Text>
                  )}
                  {product.modelo_comp && (
                    <Text size="xs" c="dimmed">
                      {product.modelo_comp}
                    </Text>
                  )}
                </Stack>
              </Table.Td>

              {/* Categoría */}
              <Table.Td>
                <Badge variant="filled" color={cat.color} size="sm">
                  {cat.label}
                </Badge>
              </Table.Td>

              {/* Stock */}
              <Table.Td style={{ textAlign: "right" }}>
                <Text
                  ff="monospace"
                  size="sm"
                  fw={700}
                  c={
                    displayStock <= 0
                      ? "red"
                      : displayStock <= stockMinimo
                        ? "yellow"
                        : undefined
                  }
                >
                  {displayStock}
                </Text>
              </Table.Td>

              {/* Per-branch stock breakdown — only in global (admin) view */}
              {!sucursalId && (
                <Table.Td>
                  {product.inventario_sucursales &&
                  product.inventario_sucursales.length > 0 ? (
                    <Group gap={4} wrap="wrap">
                      {product.inventario_sucursales.map((is) => (
                        <Tooltip
                          key={is.sucursalId}
                          label={`${is.sucursal.nombre}: ${is.stock} u.`}
                        >
                          <Badge
                            variant="light"
                            color={
                              is.stock <= 0
                                ? "red"
                                : is.stock <= product.stock_minimo
                                  ? "yellow"
                                  : "green"
                            }
                            size="xs"
                            style={{ cursor: "default" }}
                          >
                            {is.sucursal.nombre.slice(0, 8)}…{" "}
                            <strong>{is.stock}</strong>
                          </Badge>
                        </Tooltip>
                      ))}
                    </Group>
                  ) : (
                    <Text size="xs" c="dimmed" fs="italic">
                      Sin stock
                    </Text>
                  )}
                </Table.Td>
              )}

              {/* Precio Proveedor */}
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" c="dimmed">
                  ${product.costo_usd.toFixed(2)}
                </Text>
              </Table.Td>

              {/* Precio Cliente */}
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" fw={600}>
                  ${product.precio_usd.toFixed(2)}
                </Text>
              </Table.Td>

              {/* Estado */}
              <Table.Td>
                <StockStatusBadge
                  actual={displayStock}
                  minimo={product.stock_minimo}
                />
              </Table.Td>

              {/* Acciones */}
              <Table.Td>
                <Group gap="xs" justify="center">
                  {onAddStock && permisos.inventario.ajustarStock && (
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
                  {permisos.inventario.editar && (
                    <>
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
                                  ¿Desactivar <strong>{product.nombre}</strong>?
                                  Se ocultará del inventario pero se conserva el
                                  historial.
                                </Text>
                              ),
                              labels: {
                                confirm: "Desactivar",
                                cancel: "Cancelar",
                              },
                              confirmProps: { color: "red" },
                              onConfirm: () => onDelete(product),
                            });
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
  );
}
