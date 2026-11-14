import { Modal, TextInput, Stack, Button, Group, Loader, Paper, Text, Badge } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { IconSearch, IconUserCheck } from "@tabler/icons-react";
import type { Cliente } from "../../../services/clients.service";
import { useClientByCedula } from "../../../services";
import { CedulaInput } from "../../../components/ui/CedulaInput";
import { PhoneInput } from "../../../components/ui/PhoneInput";
import {
  bloquearTeclasNoLetras,
  sanitizarSoloLetras,
} from "../../../lib/sanitizers";

export interface ClientFormValues {
  nombre: string;
  cedula: string;
  telefono: string;
  correo?: string;
}

interface ClientFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: ClientFormValues) => void;
  initialData?: Cliente | null;
}

export function ClientForm({
  opened,
  onClose,
  onSubmit,
  initialData,
}: ClientFormProps) {
  const isEditing = !!initialData;

  const form = useForm<ClientFormValues>({
    initialValues: {
      nombre: "",
      cedula: "",
      telefono: "",
      correo: "",
    },
    validate: {
      nombre: (v) => (v.trim().length < 2 ? "Nombre muy corto" : null),
      cedula: (v) => (v.trim().length < 5 ? "Cédula/RUT inválido" : null),
      telefono: (v) => (v.trim().length < 7 ? "Teléfono inválido" : null),
      correo: (v) =>
        v && v.trim().length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? "Correo inválido"
          : null,
    },
  });

  const cedulaValue = form.values.cedula;
  const { data: foundClient, isFetching: searchingClient } = useClientByCedula(
    !isEditing && cedulaValue.length >= 3 ? cedulaValue : ""
  );

  const clientExists = !!foundClient && !isEditing;

  useEffect(() => {
    if (opened && initialData) {
      form.setValues({
        nombre: initialData.nombre,
        cedula: initialData.cedula,
        telefono: initialData.telefono,
        correo: initialData.correo ?? "",
      });
    } else if (opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialData]);

  const handleSubmit = (values: ClientFormValues) => {
    onSubmit(values);
    form.reset();
    // No cerramos el modal aquí, lo cerramos en el onSuccess de la mutación.
  };

  return (
    <Modal
      opened={opened}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title={isEditing ? "Editar Cliente" : "Nuevo Cliente"}
      size="md"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <CedulaInput
            label="Cédula / Identificación"
            placeholder="12345678"
            required
            disabled={isEditing}
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchingClient ? (
                <Loader size={14} />
              ) : foundClient && !isEditing ? (
                <IconUserCheck size={16} color="var(--mantine-color-green-6)" />
              ) : undefined
            }
            error={clientExists ? "Esta cédula ya está registrada" : form.errors.cedula}
            value={form.values.cedula}
            onChange={(val) => form.setFieldValue("cedula", val)}
          />

          <TextInput
            label="Nombre Completo"
            placeholder="Ej: Juan Pérez"
            withAsterisk
            value={form.values.nombre}
            onKeyDown={bloquearTeclasNoLetras}
            onChange={(e) => form.setFieldValue("nombre", sanitizarSoloLetras(e.currentTarget.value, 40))}
            error={form.errors.nombre}
          />

          {foundClient && !isEditing && (
            <Paper
              p="sm"
              radius="md"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.2)",
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <IconUserCheck size={18} color="var(--mantine-color-green-6)" />
                  <div>
                    <Text size="sm" fw={600}>{foundClient.nombre}</Text>
                    <Text size="xs" c="dimmed">
                      {foundClient.cedula} • {foundClient.telefono}
                    </Text>
                  </div>
                </Group>
                <Badge variant="light" color="green" size="sm">Ya registrado</Badge>
              </Group>
            </Paper>
          )}

          <PhoneInput
            label="Teléfono de Contacto"
            placeholder="4121234567"
            required
            value={form.values.telefono}
            onChange={(val) => form.setFieldValue("telefono", val)}
            error={form.errors.telefono}
          />

          <TextInput
            label="Correo Electrónico"
            placeholder="cliente@ejemplo.com (Opcional)"
            {...form.getInputProps("correo")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={clientExists}>
              {isEditing ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
