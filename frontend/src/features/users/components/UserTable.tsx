import { Table, Text, Group, ActionIcon, Tooltip, Badge } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { Usuario } from "../../../types";

interface UserTableProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
}

const ROL_CONFIG: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Administrador", color: "brand" },
  TECNICO: { label: "Técnico", color: "violet" },
  VENDEDOR: { label: "Vendedor", color: "blue" },
};

export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <Table
      highlightOnHover
      horizontalSpacing="md"
      verticalSpacing="sm"
      styles={{
        tr: { transition: "background 200ms ease", cursor: "pointer" },
        th: {
          color: "var(--text-secondary)",
          fontSize: "12px",
          textTransform: "uppercase" as const,
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
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Rol</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Comisión</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {users.map((user) => {
          const rol = ROL_CONFIG[user.rol] ?? {
            label: user.rol,
            color: "gray",
          };
          return (
            <Table.Tr key={user.id}>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {user.nombre}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm">{user.email}</Text>
              </Table.Td>
              <Table.Td>
                <Badge variant="filled" color={rol.color} size="sm">
                  {rol.label}
                </Badge>
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                <Text ff="monospace" size="sm" fw={600}>
                  {(user.porcentaje_comision_base * 100).toFixed(0)}%
                </Text>
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
                        onEdit(user);
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
                        onDelete(user);
                      }}
                    >
                      <IconTrash size={16} />
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
