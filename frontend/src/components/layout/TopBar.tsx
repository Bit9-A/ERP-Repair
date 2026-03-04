import {
  Group,
  TextInput,
  ActionIcon,
  Indicator,
  Burger,
  Menu,
  rem,
  Tooltip,
  Kbd,
} from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import {
  IconBell,
  IconPlus,
  IconSearch,
  IconTool,
  IconShoppingCart,
  IconPackage,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "../../stores/theme.store";

interface TopBarProps {
  opened?: boolean;
  toggle?: () => void;
  onNewTicket?: () => void;
  isMobile?: boolean;
}

export function TopBar({ opened, toggle, onNewTicket, isMobile }: TopBarProps) {
  const navigate = useNavigate();
  const { colorScheme, toggle: toggleTheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  return (
    <Group h="100%" px="md" justify="space-between" wrap="nowrap">
      <Group gap="sm" wrap="nowrap">
        <Burger
          opened={opened}
          onClick={toggle}
          size="md"
          color={colorScheme === "dark" ? "white" : "black"}
        />
        {/* Hide search on very small screens */}
        {!isMobile && (
          <TextInput
            placeholder="Buscar tickets, clientes, productos..."
            leftSection={<IconSearch size={16} />}
            rightSection={
              <Group gap={4} mr={4}>
                <Kbd size="xs">Ctrl</Kbd>
                <Kbd size="xs">K</Kbd>
              </Group>
            }
            rightSectionWidth={65}
            w={{ base: 200, md: 350 }}
            size="sm"
            onClick={() => spotlight.open()}
            readOnly
            styles={{
              input: {
                cursor: "pointer",
                background:
                  colorScheme === "dark"
                    ? "rgba(255, 255, 255, 0.04)"
                    : "#ffffff",
                borderColor:
                  colorScheme === "dark"
                    ? "var(--border-subtle)"
                    : "var(--border-default)",
                color: "var(--text-primary)",
                boxShadow:
                  colorScheme === "dark"
                    ? "none"
                    : "0 1px 2px rgba(15, 23, 42, 0.05)",
                transition: "all 0.2s ease",
              },
            }}
          />
        )}
      </Group>

      <Group gap="sm" wrap="nowrap">
        {/* Theme toggle */}
        <Tooltip
          label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          position="bottom"
          withArrow
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="md"
            color={isDark ? "yellow" : "blue"}
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            style={{ transition: "all 200ms ease" }}
          >
            {isDark ? (
              <IconSun size={20} stroke={1.5} />
            ) : (
              <IconMoon size={20} stroke={1.5} />
            )}
          </ActionIcon>
        </Tooltip>

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
              Nueva Orden
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
