import {
  NavLink,
  Text,
  Stack,
  Divider,
  Box,
  Group,
  Avatar,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconPackage,
  IconTool,
  IconShoppingCart,
  IconReportMoney,
  IconUsers,
  IconUsersGroup,
  IconLogout,
  IconBuildingStore,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconLayoutDashboard, path: "/" },
  { label: "Reparaciones", icon: IconTool, path: "/reparaciones" },
  { label: "Inventario", icon: IconPackage, path: "/inventario" },
  { label: "Ventas", icon: IconShoppingCart, path: "/ventas" },
  { label: "Clientes", icon: IconUsersGroup, path: "/clients" },
  { label: "Finanzas", icon: IconReportMoney, path: "/finanzas" },
  {
    label: "Sucursales",
    icon: IconBuildingStore,
    path: "/sucursales",
    adminOnly: true,
  },
  { label: "Usuarios", icon: IconUsers, path: "/usuarios", adminOnly: true },
];

interface SidebarProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function Sidebar({
  collapsed = false,
  isMobile = false,
  onNavigate,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onNavigate?.();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  // On mobile, always show expanded (never collapsed icons-only mode)
  const isCollapsed = isMobile ? false : collapsed;
  const isAdmin = user?.rol === "ADMIN";
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !(item as { adminOnly?: boolean }).adminOnly || isAdmin,
  );

  return (
    <Box
      h="100%"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "var(--sidebar-bg)",
        overflow: "hidden",
      }}
    >
      {/* Top section */}
      <Stack gap={0}>
        {/* Brand */}
        <Box
          px={isCollapsed ? "xs" : "md"}
          py="lg"
          style={{
            display: "flex",
            alignItems: isCollapsed ? "center" : "flex-start",
            justifyContent: isCollapsed ? "center" : "flex-start",
            flexDirection: "column",
            minHeight: 70,
            transition: "all 300ms ease",
          }}
        >
          {isCollapsed ? (
            <Text
              ff="monospace"
              fw={700}
              size="lg"
              style={{
                color: "#ffffff",
                textShadow: "0 0 8px rgba(35, 124, 213, 0.4)",
              }}
            >
              TP
            </Text>
          ) : (
            <>
              <Text
                ff="monospace"
                fw={700}
                size="xl"
                style={{
                  color: "#ffffff",
                  textShadow: "0 0 8px rgba(35, 124, 213, 0.4)",
                  lineHeight: 1.2,
                  whiteSpace: "nowrap",
                }}
              >
                TecnoPro Cell
              </Text>
              <Text
                size="xs"
                c="red.5"
                ff="monospace"
                mt={2}
                style={{
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                }}
              >
                Sistema de Gestión
              </Text>
            </>
          )}
        </Box>

        <Divider color="brand.7" />

        {/* Navigation */}
        <Stack gap={4} px="sm" mt="md">
          {visibleNavItems.map((item) => {
            const isActive = location.pathname === item.path;

            if (isCollapsed) {
              return (
                <Tooltip
                  key={item.path}
                  label={item.label}
                  position="right"
                  withArrow
                  transitionProps={{ transition: "slide-right", duration: 200 }}
                >
                  <ActionIcon
                    variant={isActive ? "filled" : "subtle"}
                    color={isActive ? "brand" : "gray"}
                    size="xl"
                    radius="md"
                    onClick={() => handleNavClick(item.path)}
                    style={{
                      width: "100%",
                      transition: "all 200ms ease",
                    }}
                  >
                    <item.icon size={22} stroke={1.5} />
                  </ActionIcon>
                </Tooltip>
              );
            }

            return (
              <NavLink
                key={item.path}
                label={item.label}
                leftSection={<item.icon size={20} stroke={1.5} />}
                active={isActive}
                onClick={() => handleNavClick(item.path)}
                variant="filled"
                styles={{
                  root: {
                    color: "#ffffff",
                    borderRadius: "var(--mantine-radius-md)",
                    transition: "all 200ms ease",
                    // Larger touch target on mobile
                    ...(isMobile && {
                      padding: "12px 14px",
                      fontSize: "15px",
                    }),
                  },
                }}
              />
            );
          })}
        </Stack>
      </Stack>

      {/* Bottom section — user + logout */}
      <Stack gap={0} px="sm" pb="md">
        <Divider color="dark.6" mb="md" />

        {isCollapsed ? (
          <Stack align="center" gap="sm">
            <Tooltip
              label={user?.nombre || "Admin Principal"}
              position="right"
              withArrow
            >
              <Avatar size="sm" radius="xl" color="brand" variant="filled">
                {(user?.nombre || "A").charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Tooltip label="Cerrar Sesión" position="right" withArrow>
              <ActionIcon
                variant="subtle"
                color="red"
                size="lg"
                radius="md"
                onClick={handleLogout}
              >
                <IconLogout size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
          </Stack>
        ) : (
          <>
            <Group gap="sm" px="sm" mb="md">
              <Avatar size="sm" radius="xl" color="brand" variant="filled">
                {(user?.nombre || "A").charAt(0).toUpperCase()}
              </Avatar>
              <div>
                <Text size="sm" c="white" fw={500}>
                  {user?.nombre || "Admin Principal"}
                </Text>
                <Text size="xs" c="brand.3" tt="capitalize">
                  {user?.rol?.toLowerCase() === "admin"
                    ? "Administrator"
                    : user?.rol?.toLowerCase() || "admin"}
                </Text>
              </div>
            </Group>

            <NavLink
              label="Cerrar Sesión"
              leftSection={<IconLogout size={18} stroke={1.5} />}
              onClick={handleLogout}
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                  color: "var(--mantine-color-red-6)",
                  ...(isMobile && {
                    padding: "12px 14px",
                  }),
                },
              }}
            />
          </>
        )}
      </Stack>
    </Box>
  );
}
