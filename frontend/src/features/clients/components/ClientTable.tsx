import { Table, Text, Group, ActionIcon, Tooltip, Badge } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconPencil, IconTrash, IconClock } from "@tabler/icons-react";
import type { Cliente } from "../../../services/clients.service";

interface ClientTableProps {
  clients: Cliente[];
  onEdit: (client: Cliente) => void;
  onDelete: (client: Cliente) => void;
  onViewHistory: (client: Cliente) => void;
}

export function ClientTable({ clients, onEdit, onDelete, onViewHistory }: ClientTableProps) {
  return (
    <Table
      highlightOnHover
      horizontalSpacing="md"
      verticalSpacing="sm"
      styles={{
        tr: { transition: "background 150ms ease" },
        th: {
          color: "#94a3b8",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          fontFamily: "'Titillium Web', sans-serif",
          paddingTop: "14px",
          paddingBottom: "14px",
          borderBottom: "1px solid var(--border-subtle)",
        },
        td: {
          borderColor: "var(--border-subtle)",
          paddingTop: "14px",
          paddingBottom: "14px",
        },
      }}
    >
      <Table.Thead className="bg-slate-50/70 dark:bg-[#18263d]/50">
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
              <Text c="dimmed" fs="italic" py="lg" className="font-sirac-sub text-xs">
                No hay clientes registrados o que coincidan con la búsqueda.
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          clients.map((client) => (
            <Table.Tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-[#18263d]/50 transition-colors">
              {/* Nombre e Identificación */}
              <Table.Td>
                <Text fw={700} size="sm" className="font-sirac-title text-slate-900 dark:text-white">
                  {client.nombre}
                </Text>
                <Text size="xs" className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {client.cedula}
                </Text>
              </Table.Td>

              {/* Contacto */}
              <Table.Td>
                <Text size="sm" className="font-sirac-sub font-medium text-slate-800 dark:text-slate-200">
                  {client.telefono}
                </Text>
                {client.correo ? (
                  <Text size="xs" c="dimmed" className="font-sirac-sub">
                    {client.correo}
                  </Text>
                ) : (
                  <Text size="xs" c="dimmed" fs="italic" className="font-sirac-sub">
                    Sin correo
                  </Text>
                )}
              </Table.Td>

              {/* Tickets */}
              <Table.Td style={{ textAlign: "center" }}>
                <Badge
                  variant="light"
                  color={client._count?.tickets ? "blue" : "gray"}
                  radius="md"
                  className="font-mono font-bold text-xs"
                >
                  {client._count?.tickets ?? 0}
                </Badge>
              </Table.Td>

              {/* Ventas */}
              <Table.Td style={{ textAlign: "center" }}>
                <Badge
                  variant="light"
                  color={client._count?.ventas ? "green" : "gray"}
                  radius="md"
                  className="font-mono font-bold text-xs"
                >
                  {client._count?.ventas ?? 0}
                </Badge>
              </Table.Td>

              {/* Fecha Registro */}
              <Table.Td style={{ textAlign: "right" }}>
                <Text size="xs" c="dimmed" className="font-sirac-sub">
                  {new Date(client.createdAt).toLocaleDateString()}
                </Text>
              </Table.Td>

              {/* Acciones */}
              <Table.Td>
                <Group gap="xs" justify="center">
                  <Tooltip label="Ver Historial de Reparaciones">
                    <ActionIcon
                      variant="subtle"
                      color="indigo"
                      size="sm"
                      radius="md"
                      onClick={() => onViewHistory(client)}
                    >
                      <IconClock size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Editar">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      size="sm"
                      radius="md"
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
                      radius="md"
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
