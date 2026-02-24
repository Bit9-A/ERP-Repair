import {
  NavLink,
  Text,
  Stack,
  Divider,
  Box,
  Group,
  Avatar,
} from "@mantine/core";
import {
  IconLayoutDashboard,
  IconPackage,
  IconTool,
  IconCurrencyDollar,
  IconUsers,
  IconLogout,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";

const NAV_ITEMS = [
  { label: "Dashboard", icon: IconLayoutDashboard, path: "/" },
  { label: "Reparaciones", icon: IconTool, path: "/reparaciones" },
  { label: "Inventario", icon: IconPackage, path: "/inventario" },
  { label: "Ventas", icon: IconCurrencyDollar, path: "/ventas" },
  { label: "Usuarios", icon: IconUsers, path: "/usuarios" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      h="100%"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#237cd5",
      }}
    >
      {/* Top section */}
      <Stack gap={0}>
        {/* Brand — matching Stitch two-line branding */}
        <Box px="md" py="lg">
          <Text
            ff="monospace"
            fw={700}
            size="xl"
            style={{
              color: "#ffffff",
              textShadow: "0 0 8px rgba(34, 197, 94, 0.2)",
              lineHeight: 1.2,
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
               letterSpacing: "0.12em" }}
          >
            Sistema de Gestión 
          </Text>
        </Box>

        <Divider color="dark.6" />

        {/* Navigation */}
        <Stack gap={4} px="sm" mt="md">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              variant="filled"
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                  transition: "all 200ms ease",
                },
              }}
            />
          ))}
        </Stack>
      </Stack>

      {/* Bottom section — user + logout */}
      <Stack gap={0} px="sm" pb="md">
        <Divider color="dark.6" mb="md" />

        <Group gap="sm" px="sm" mb="md">
          <Avatar size="sm" radius="xl" color="brand" variant="filled">
            {(user?.nombre || "A").charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text size="sm" c="gray.1" fw={500}>
              {user?.nombre || "Admin Principal"}
            </Text>
            <Text size="xs" c="dimmed" tt="capitalize">
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
            },
          }}
        />
      </Stack>
    </Box>
  );
}
