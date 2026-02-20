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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
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

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0F172A 100%)",
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
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="lg" align="center">
              {/* Logo / Title */}
              <Title
                order={2}
                ff="monospace"
                style={{
                  textShadow: "0 0 10px rgba(34, 197, 94, 0.3)",
                  color: "#F8FAFC",
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
