import { useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Switch,
  Stack,
  Group,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useCreateSucursal, useUpdateSucursal } from "../../../services";
import type { Sucursal } from "../../../types";

interface SucursalFormValues {
  nombre: string;
  direccion: string;
  activa: boolean;
}

interface SucursalFormModalProps {
  opened: boolean;
  onClose: () => void;
  editData?: Sucursal | null;
}

export function SucursalFormModal({
  opened,
  onClose,
  editData,
}: SucursalFormModalProps) {
  const isEditing = !!editData;
  const createSucursal = useCreateSucursal();
  const updateSucursal = useUpdateSucursal();

  const form = useForm<SucursalFormValues>({
    initialValues: {
      nombre: "",
      direccion: "",
      activa: true,
    },
  });

  // Sync when editData changes or modal opens
  useEffect(() => {
    if (opened) {
      form.setValues({
        nombre: editData?.nombre ?? "",
        direccion: editData?.direccion ?? "",
        activa: editData?.activa ?? true,
      });
    } else {
      form.reset();
    }
  }, [opened, editData]);

  const handleSubmit = async (values: SucursalFormValues) => {
    try {
      if (isEditing && editData) {
        await updateSucursal.mutateAsync({ id: editData.id, data: values });
        notifications.show({ message: "Sucursal actualizada", color: "green" });
      } else {
        await createSucursal.mutateAsync(values);
        notifications.show({ message: "Sucursal creada", color: "green" });
      }
      onClose();
    } catch {
      notifications.show({ message: "Error al guardar", color: "red" });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Editar Sucursal" : "Nueva Sucursal"}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nombre"
            placeholder="Ej: Sucursal Centro"
            required
            {...form.getInputProps("nombre")}
          />
          <Textarea
            label="Dirección"
            placeholder="Dirección completa (opcional)"
            autosize
            minRows={2}
            {...form.getInputProps("direccion")}
          />
          {isEditing && (
            <Switch
              label="Sucursal activa"
              {...form.getInputProps("activa", { type: "checkbox" })}
            />
          )}
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createSucursal.isPending || updateSucursal.isPending}
            >
              {isEditing ? "Guardar Cambios" : "Crear Sucursal"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
