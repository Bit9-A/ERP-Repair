import { Table, Text, Group, ActionIcon, Tooltip, Badge } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { Cliente } from "../../../services/clients.service";

interface ClientTableProps {
  clients: Cliente[];
  onEdit: (client: Cliente) => void;
  onDelete: (client: Cliente) => void;
}

export function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {
  return (
    <Table
      highlightOnHover
      horizontalSpacing="md"
      verticalSpacing="sm"
      styles={{
        tr: { transition: "background 200ms ease" },
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
          <Table.Th>Nombre / Cédula</Table.Th>
          <Table.Th>Contacto</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Reparaciones</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Ventas</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Fecha Registro</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {clients.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={6} align="center">
              <Text c="dimmed" fs="italic" py="lg">
                No hay clientes registrados o que coincidan con la búsqueda.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          clients.map((client) => (
            <Table.Tr key={client.id}>
              {/* Nombre e Identificación */}
              <Table.Td>
                <Text fw={600} size="sm">
                  {client.nombre}
                </Text>
                <Text size="xs" c="dimmed" ff="monospace">
                  {client.cedula}
                </Text>
              </Table.Td>

              {/* Contacto */}
              <Table.Td>
                <Text size="sm">{client.telefono}</Text>
                {client.correo ? (
                  <Text size="xs" c="dimmed">
                    {client.correo}
                  </Text>
                ) : (
                  <Text size="xs" c="dimmed" fs="italic">
                    Sin correo
                  </Text>
                )}
              </Table.Td>

              {/* Tickets */}
              <Table.Td style={{ textAlign: "center" }}>
                <Badge
                  variant="light"
                  color={client._count?.tickets ? "blue" : "gray"}
                >
                  {client._count?.tickets ?? 0}
                </Badge>
              </Table.Td>

              {/* Ventas */}
              <Table.Td style={{ textAlign: "center" }}>
                <Badge
                  variant="light"
                  color={client._count?.ventas ? "green" : "gray"}
                >
                  {client._count?.ventas ?? 0}
                </Badge>
              </Table.Td>

              {/* Fecha Registro */}
              <Table.Td style={{ textAlign: "right" }}>
                <Text size="sm" c="dimmed">
                  {new Date(client.createdAt).toLocaleDateString()}
                </Text>
              </Table.Td>

              {/* Acciones */}
              <Table.Td>
                <Group gap="xs" justify="center">
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      size="sm"
                      onClick={() => onEdit(client)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Eliminar">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => {
                        modals.openConfirmModal({
                          title: "Eliminar Cliente",
                          centered: true,
                          children: (
                            <Text size="sm">
                              ¿Estás seguro de que deseas eliminar a{" "}
                              <strong>{client.nombre}</strong>? Sus tickets y
                              ventas asociadas perderán el vínculo con este
                              cliente.
                            </Text>
                          ),
                          labels: { confirm: "Eliminar", cancel: "Cancelar" },
                          confirmProps: { color: "red" },
                          onConfirm: () => onDelete(client),
                        });
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))
        )}
      </Table.Tbody>
    </Table>
  );
}
