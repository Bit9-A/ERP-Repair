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
      tipo_contrato: "COMISION_PURA",
      salario_base_usd: 0,
      porcentaje_comision_base: 0,
    },
    validate: {
      nombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      email: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Email inválido",
      password: (v) =>
        !isEditing && v.length < 4 ? "Mínimo 4 caracteres" : null,
      salario_base_usd: (v) => (v < 0 ? "No puede ser negativo" : null),
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
        tipo_contrato: initialData.tipo_contrato,
        salario_base_usd: initialData.salario_base_usd,
        porcentaje_comision_base: initialData.porcentaje_comision_base,
      });
    } else if (opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              ]}
              {...form.getInputProps("rol")}
            />
            <Select
              label="Tipo de Contrato"
              data={[
                { value: "SALARIO_FIJO", label: "Salario Fijo" },
                { value: "COMISION_PURA", label: "Comisión Pura" },
                { value: "MIXTO", label: "Mixto" },
              ]}
              {...form.getInputProps("tipo_contrato")}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Salario Base (USD)"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              {...form.getInputProps("salario_base_usd")}
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
