import {
  Group,
  TextInput,
  ActionIcon,
  Indicator,
  Burger,
  Menu,
  rem,
} from "@mantine/core";
import {
  IconBell,
  IconPlus,
  IconSearch,
  IconTool,
  IconShoppingCart,
  IconPackage,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  opened?: boolean;
  toggle?: () => void;
  onNewTicket?: () => void; // Keep for backwards compatibility if still used
  isMobile?: boolean;
}

export function TopBar({ opened, toggle, onNewTicket, isMobile }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <Burger opened={opened} onClick={toggle} size="sm" color="gray.4" />
        {/* Hide search on very small screens */}
        {!isMobile && (
          <TextInput
            placeholder="Buscar tickets, clientes, productos..."
            leftSection={<IconSearch size={16} />}
            w={{ base: 200, md: 350 }}
            size="sm"
            styles={{
              input: {
                background: "rgba(255, 255, 255, 0.04)",
                borderColor: "var(--border-subtle)",
              },
            }}
          />
        )}
      </Group>

      <Group gap="sm" wrap="nowrap">
        <Indicator color="red" size={8} offset={4}>
          <ActionIcon variant="subtle" size="lg" radius="md" color="gray">
            <IconBell size={20} stroke={1.5} />
          </ActionIcon>
        </Indicator>

        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <ActionIcon
              variant="filled"
              size="lg"
              radius="md"
              color="brand"
              aria-label="Crear Nuevo"
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Creación Rápida</Menu.Label>
            <Menu.Item
              leftSection={
                <IconTool style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => {
                if (onNewTicket) {
                  onNewTicket();
                } else {
                  navigate("/reparaciones");
                }
              }}
            >
              Nuevo Ticket
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconShoppingCart style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => navigate("/ventas")}
            >
              Nueva Venta
            </Menu.Item>
            <Menu.Item
              leftSection={
                <IconPackage style={{ width: rem(14), height: rem(14) }} />
              }
              onClick={() => navigate("/inventario")}
            >
              Nuevo Producto
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
