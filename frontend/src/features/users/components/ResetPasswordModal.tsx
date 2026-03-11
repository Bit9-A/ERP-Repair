import { useState } from "react";
import { Modal, Button, PasswordInput, Stack, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconKey } from "@tabler/icons-react";
import type { Usuario } from "../../../types";

interface ResetPasswordModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
  user: Usuario | null;
}

export function ResetPasswordModal({ opened, onClose, onSubmit, user }: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (val) =>
        val.length < 6 ? "La contraseña debe tener al menos 6 caracteres" : null,
      confirmPassword: (val, values) =>
        val !== values.password ? "Las contraseñas no coinciden" : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    try {
      await onSubmit(values.password);
      form.reset();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  if (!user) return null;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconKey size={20} color="var(--primary)" />
          <Text fw={600}>Resetear Contraseña</Text>
        </Group>
      }
      centered
      overlayProps={{ blur: 3, opacity: 0.55 }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Estás a punto de establecer una nueva contraseña para el usuario{" "}
            <Text span fw={600} c="var(--text)">
              {user.nombre} ({user.email})
            </Text>
            . Asegúrate de comunicar esta nueva contraseña de forma segura.
          </Text>

          <PasswordInput
            label="Nueva contraseña"
            placeholder="Mínimo 6 caracteres"
            withAsterisk
            {...form.getInputProps("password")}
          />

          <PasswordInput
            label="Confirmar contraseña"
            placeholder="Repite la contraseña"
            withAsterisk
            {...form.getInputProps("confirmPassword")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" color="gray" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading} color="red">
              Aplicar Contraseña
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

// Ensure Group is imported
import { Group } from "@mantine/core";
