import { Center, Stack, Title, Text, Button } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import type { Rol } from "../../types";
import { useAuthStore } from "../../features/auth/store/auth.store";

interface RoleGuardProps {
  roles: Rol[];
  children: React.ReactNode;
}

/**
 * Muestra los children solo si el usuario tiene uno de los roles indicados.
 * Si no tiene permiso, muestra una pantalla de acceso denegado.
 */
export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user || !roles.includes(user.rol)) {
    return (
      <Center h="60vh">
        <Stack align="center" gap="md">
          <IconLock size={56} color="var(--mantine-color-red-5)" />
          <Title order={3} c="gray.2">
            Acceso Denegado
          </Title>
          <Text c="dimmed" ta="center">
            No tienes permisos para acceder a esta sección.
            <br />
            Contacta al administrador si crees que es un error.
          </Text>
          <Button variant="light" onClick={() => window.history.back()}>
            Volver
          </Button>
        </Stack>
      </Center>
    );
  }

  return <>{children}</>;
}
