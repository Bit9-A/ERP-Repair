import {
  Modal,
  TextInput,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Button,
  Group,
  Divider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { Usuario } from "../../../types";
import type { UserFormValues } from "../types/users.types";
import { useSucursales } from "../../../services";

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
  const { data: sucursales = [] } = useSucursales();

  const form = useForm<UserFormValues>({
    initialValues: {
      nombre: "",
      email: "",
      password: "",
      rol: "TECNICO",
      porcentaje_comision_base: 0,
      sucursalId: undefined,
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
        sucursalId: initialData.sucursalId ?? undefined,
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

  const sucursalOptions = sucursales.map((s) => ({
    value: s.id,
    label: s.nombre,
  }));

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Editar Usuario" : "Nuevo Usuario"}
      size="md"
      closeOnClickOutside={false}
      closeOnEscape={false}
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

          {/* Feature 4: Branch assignment */}
          {form.values.rol !== "ADMIN" && (
            <>
              <Divider label="Asignación de Sucursal" labelPosition="center" />
              <Select
                label="Sucursal"
                placeholder="Sin sucursal asignada"
                data={sucursalOptions}
                clearable
                description={
                  form.values.rol === "TECNICO"
                    ? "El técnico solo verá los tickets de esta sucursal"
                    : "El vendedor solo verá las ventas e inventario de esta sucursal"
                }
                {...form.getInputProps("sucursalId")}
              />
            </>
          )}

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
