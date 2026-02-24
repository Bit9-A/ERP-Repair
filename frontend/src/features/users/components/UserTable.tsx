import { Table, Text, Group, ActionIcon, Tooltip, Badge } from "@mantine/core";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { Usuario } from "../../../types";

interface UserTableProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
}

const ROL_COLOR: Record<string, string> = {
  ADMIN: "brand",
  TECNICO: "violet",
};

const CONTRATO_LABEL: Record<string, string> = {
  SALARIO_FIJO: "Salario Fijo",
  COMISION_PURA: "Comisión Pura",
  MIXTO: "Mixto",
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
        td: { borderColor: "var(--border-subtle)" },
      }}
    >
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Nombre</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Rol</Table.Th>
          <Table.Th>Contrato</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Salario USD</Table.Th>
          <Table.Th style={{ textAlign: "right" }}>Comisión</Table.Th>
          <Table.Th style={{ textAlign: "center" }}>Acciones</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {users.map((user) => (
          <Table.Tr key={user.id}>
            <Table.Td>
              <Text size="sm" fw={600} c="gray.1">
                {user.nombre}
              </Text>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="gray.2">
                {user.email}
              </Text>
            </Table.Td>
            <Table.Td>
              <Badge
                variant="light"
                color={ROL_COLOR[user.rol] ?? "gray"}
                size="sm"
              >
                {user.rol}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Text size="sm" c="gray.3">
                {CONTRATO_LABEL[user.tipo_contrato] ?? user.tipo_contrato}
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <Text ff="monospace" size="sm" fw={600} c="gray.1">
                ${user.salario_base_usd.toFixed(2)}
              </Text>
            </Table.Td>
            <Table.Td style={{ textAlign: "right" }}>
              <Text ff="monospace" size="sm" fw={600} c="gray.1">
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
        ))}
      </Table.Tbody>
    </Table>
  );
}
