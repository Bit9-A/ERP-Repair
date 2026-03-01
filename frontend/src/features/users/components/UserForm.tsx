import {
  Modal,
  TextInput,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { Usuario } from "../../../types";
import type { UserFormValues } from "../types/users.types";

interface UserFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  initialData?: Usuario | null;
}

export function UserForm({
  opened,
  onClose,
  onSubmit,
  initialData,
}: UserFormProps) {
  const isEditing = !!initialData;

  const form = useForm<UserFormValues>({
    initialValues: {
      nombre: "",
      email: "",
      password: "",
      rol: "TECNICO",
      porcentaje_comision_base: 0,
    },
    validate: {
      nombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Email inválido",
      password: (v) =>
        !isEditing && v.length < 4 ? "Mínimo 4 caracteres" : null,
      porcentaje_comision_base: (v) =>
        v < 0 || v > 1 ? "Debe ser entre 0 y 1 (ej: 0.40 = 40%)" : null,
    },
  });

  useEffect(() => {
    if (opened && initialData) {
      form.setValues({
        nombre: initialData.nombre,
        email: initialData.email,
        password: "",
        rol: initialData.rol,
        porcentaje_comision_base: initialData.porcentaje_comision_base,
      });
    } else if (opened) {
      form.reset();
    }
  }, [opened, initialData]);

  const handleSubmit = (values: UserFormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            placeholder="Nombre completo"
            {...form.getInputProps("nombre")}
          />
          <TextInput
            label="Email"
            placeholder="correo@ejemplo.com"
            {...form.getInputProps("email")}
          />
          {!isEditing && (
            <PasswordInput
              label="Contraseña"
              placeholder="Mínimo 4 caracteres"
              {...form.getInputProps("password")}
            />
          )}
          <Group grow>
            <Select
              label="Rol"
              data={[
                { value: "ADMIN", label: "Administrador" },
                { value: "TECNICO", label: "Técnico" },
                { value: "VENDEDOR", label: "Vendedor" },
              ]}
              {...form.getInputProps("rol")}
            />
            <NumberInput
              label="Comisión Base"
              min={0}
              max={1}
              step={0.05}
              decimalScale={2}
              fixedDecimalScale
              placeholder="Ej: 0.40 = 40%"
              {...form.getInputProps("porcentaje_comision_base")}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
