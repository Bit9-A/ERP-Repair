import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { IconLock, IconUser } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";
import { APP_NAME, APP_SUBTITLE } from "../../../lib/constants";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const form = useForm({
    initialValues: {
      nombre: "",
      password: "",
    },
    validate: {
      nombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      password: (v) => (v.length < 4 ? "Contraseña muy corta" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const { user, token } = await authService.login(values);
      login(user, token);
      navigate("/");
    } catch {
      notifications.show({
        title: "Error de autenticación",
        message: "Credenciales incorrectas. Intenta de nuevo.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    modals.open({
      title: "Recuperación de Contraseña",
      children: (
        <Stack>
          <Text size="sm">
            Por motivos de seguridad, si has olvidado tu contraseña debes comunicárselo 
            al <Text span fw={600}>Administrador o Gerente</Text> de forma directa para 
            que te la restablezca en el sistema.
          </Text>
          <Button fullWidth onClick={() => modals.closeAll()} mt="md">
            Entendido
          </Button>
        </Stack>
      ),
      centered: true,
      overlayProps: { blur: 3, opacity: 0.55 },
    });
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, var(--brand-900) 0%, var(--bg-main) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Center>
        <Card
          w={420}
          shadow="xl"
          padding="xl"
          radius="lg"
          style={{
            background: "rgba(30, 41, 59, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg" align="center">
              {/* Logo / Title */}
              <Title
                order={2}
                ff="monospace"
                style={{
                  textShadow: "0 0 10px rgba(35, 124, 213, 0.3)",
                  color: "var(--text-primary)",
                }}
              >
                {APP_NAME}
              </Title>

              <Text size="sm" c="dimmed" ta="center">
                {APP_SUBTITLE}
              </Text>

              {/* Fields */}
              <TextInput
                w="100%"
                label="Usuario"
                placeholder="Tu nombre de usuario"
                leftSection={<IconUser size={16} />}
                {...form.getInputProps("nombre")}
              />

              <PasswordInput
                w="100%"
                label="Contraseña"
                placeholder="Tu contraseña"
                leftSection={<IconLock size={16} />}
                {...form.getInputProps("password")}
              />

              <Group justify="flex-end" w="100%" mt="-sm">
                <Button variant="transparent" size="xs" color="dimmed" onClick={handleForgotPassword}>
                  ¿Olvidaste tu contraseña?
                </Button>
              </Group>

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="md"
                mt="sm"
              >
                Iniciar Sesión
              </Button>

              <Text size="xs" c="dimmed" ta="center">
                Versión Local • Solo acceso autorizado
              </Text>
            </Stack>
          </form>
        </Card>
      </Center>
    </Box>
  );
}
