import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
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

const FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@800&family=Plus+Jakarta+Sans:wght@800&display=swap');";

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
    <Flex
      mih="100vh"
      align="center"
      justify={{ base: "center", md: "flex-end" }}
      px={{ base: "1rem", md: "11%" }}
      style={{
        backgroundImage: 'url("/reballing-bg.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        backgroundAttachment: "fixed",
        overflow: "hidden"
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: FONT_IMPORT }} />

      <Box
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(10, 25, 47, 0.7) 0%, rgba(10, 25, 47, 0.9) 100%)",
          backdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      />

      <Card
        w="95%"
        maw={420}
        padding="xl"
        radius={24}
        style={{
          background: "rgba(10, 25, 47, 0.2)",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          zIndex: 10,
          position: "relative",
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="xl">
            <Stack gap={4} align="center">
              <Title order={1} style={{
                fontSize: "2.6rem",
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "-1.5px",
                lineHeight: 1,
                marginBottom: 4
              }}>
                {APP_NAME}
              </Title>
              <Text size="xs" fw={400} style={{ color: "rgba(255, 255, 255, 0.5)", letterSpacing: "2px", textTransform: "uppercase" }}>
                {APP_SUBTITLE}
              </Text>
            </Stack>

            <Box>
              <Title order={3} fw={700} style={{ fontSize: "1.2rem", color: "#ffffff" }}>
                Iniciar Sesión
              </Title>
              <Text size="xs" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                Ingresa al panel administrativo
              </Text>
            </Box>

            <Stack gap="md">
              <TextInput
                label="Usuario"
                placeholder="Ingresa tu usuario"
                size="md"
                radius="md"
                leftSection={<IconUser size={18} stroke={1.5} color="rgba(255,255,255,0.7)" />}
                styles={{
                  input: {
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                  },
                  label: { color: "rgba(255, 255, 255, 0.8)", marginBottom: 8, fontSize: "0.85rem" }
                }}
                {...form.getInputProps("nombre")}
              />

              <PasswordInput
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                size="md"
                radius="md"
                leftSection={<IconLock size={18} stroke={1.5} color="rgba(255,255,255,0.7)" />}
                styles={{
                  input: {
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#ffffff",
                  },
                  label: { color: "rgba(255, 255, 255, 0.8)", marginBottom: 8, fontSize: "0.85rem" }
                }}
                {...form.getInputProps("password")}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
                radius="lg"
                mt="md"
                style={{
                  height: 52,
                  backgroundColor: "#2563eb",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.4)",
                }}
              >
                INICIAR SESIÓN
              </Button>
            </Stack>

            <Stack gap={4} align="center">
              <Text style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", fontWeight: 500, letterSpacing: "0.5px" }}>
                ERP-REPAIR v1.0 • ACCESO PROTEGIDO
              </Text>
              <Text size="xs" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
                © {new Date().getFullYear()} {APP_NAME}
              </Text>
            </Stack>
          </Stack>
        </form>
      </Card>
    </Flex>
  );
}