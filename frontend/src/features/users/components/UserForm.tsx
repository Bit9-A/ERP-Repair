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
  Switch,
  Text,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import type { Usuario, UserPermisos } from "../../../types";
import type { UserFormValues } from "../types/users.types";
import { useSucursales } from "../../../services";

interface UserFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: UserFormValues) => void;
  initialData?: Usuario | null;
}

const ADMIN_DEFAULTS: Required<UserPermisos> = {
  inventario: {
    ver: true,
    editar: true,
    crearProducto: true,
    ajustarStock: true,
  },
  ventas: { ver: true, crear: true, anular: true },
  finanzas: { ver: true },
  tickets: {
    ver: true,
    asignar: true,
    cambiarEstado: true,
    editarComision: true,
  },
  usuarios: { ver: true, gestionar: true },
};

const TECNICO_DEFAULTS: Required<UserPermisos> = {
  inventario: {
    ver: true,
    editar: false,
    crearProducto: false,
    ajustarStock: true,
  },
  ventas: { ver: false, crear: false, anular: false },
  finanzas: { ver: false },
  tickets: {
    ver: true,
    asignar: false,
    cambiarEstado: true,
    editarComision: false,
  },
  usuarios: { ver: false, gestionar: false },
};

const VENDEDOR_DEFAULTS: Required<UserPermisos> = {
  inventario: {
    ver: true,
    editar: false,
    crearProducto: false,
    ajustarStock: false,
  },
  ventas: { ver: true, crear: true, anular: false },
  finanzas: { ver: false },
  tickets: {
    ver: false,
    asignar: false,
    cambiarEstado: false,
    editarComision: false,
  },
  usuarios: { ver: false, gestionar: false },
};

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
      permisos: undefined,
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

  // Calculate current effective permissions based on Role and overrides
  const selectedRol = form.values.rol;
  const roleDefaults =
    selectedRol === "ADMIN"
      ? ADMIN_DEFAULTS
      : selectedRol === "TECNICO"
        ? TECNICO_DEFAULTS
        : VENDEDOR_DEFAULTS;

  // Merge defaults with whatever is in form.values.permisos
  const effectivePerms: Required<UserPermisos> = {
    inventario: {
      ...roleDefaults.inventario,
      ...form.values.permisos?.inventario,
    },
    ventas: { ...roleDefaults.ventas, ...form.values.permisos?.ventas },
    finanzas: { ...roleDefaults.finanzas, ...form.values.permisos?.finanzas },
    tickets: { ...roleDefaults.tickets, ...form.values.permisos?.tickets },
    usuarios: { ...roleDefaults.usuarios, ...form.values.permisos?.usuarios },
  };

  const handleTogglePermiso = (
    module: keyof UserPermisos,
    action: string,
    value: boolean,
  ) => {
    // If we toggle, we store the new merged value into form.values.permisos
    // This allows sending the full structure to the DB
    const newPerms = { ...effectivePerms };
    (newPerms[module] as any)[action] = value;
    form.setFieldValue("permisos", newPerms);
  };

  useEffect(() => {
    if (opened && initialData) {
      form.setValues({
        nombre: initialData.nombre,
        email: initialData.email,
        password: "",
        rol: initialData.rol,
        porcentaje_comision_base: initialData.porcentaje_comision_base,
        sucursalId: initialData.sucursalId ?? undefined,
        permisos: initialData.permisos,
      });
    } else if (opened) {
      form.reset();
    }
  }, [opened, initialData]);

  const handleSubmit = (values: UserFormValues) => {
    // We send form.values.permisos as the JSON save data
    // If they never changed anything, it might be undefined, which is fine (uses DB default).
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
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
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
          </Group>

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
              onChange={(v) => {
                form.setFieldValue("rol", v as any);
                // Reset permisos on role change to use role defaults cleanly
                form.setFieldValue("permisos", undefined);
              }}
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
          {selectedRol !== "ADMIN" && (
            <>
              <Divider label="Asignación de Sucursal" labelPosition="center" />
              <Select
                label="Sucursal"
                placeholder="Sin sucursal asignada"
                data={sucursalOptions}
                clearable
                description={
                  selectedRol === "TECNICO"
                    ? "El técnico solo verá los tickets de esta sucursal"
                    : "El vendedor solo verá las ventas e inventario de esta sucursal"
                }
                {...form.getInputProps("sucursalId")}
              />
            </>
          )}

          {selectedRol !== "ADMIN" && (
            <>
              <Divider label="Permisos Personalizados" labelPosition="center" />
              <Text size="xs" c="dimmed" ta="center">
                El usuario heredó los permisos predeterminados del rol{" "}
                {selectedRol}. Puedes habilitar o deshabilitar acciones
                específicas.
              </Text>

              <SimpleGrid cols={2} spacing="md">
                {/* INVENTARIO */}
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Inventario
                  </Text>
                  <Switch
                    label="Ver panel"
                    checked={effectivePerms.inventario.ver}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "inventario",
                        "ver",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Hacer compras / Crear producto"
                    checked={effectivePerms.inventario.crearProducto}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "inventario",
                        "crearProducto",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Realizar ingresos por sucursal"
                    checked={effectivePerms.inventario.ajustarStock}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "inventario",
                        "ajustarStock",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Editar global o eliminar"
                    checked={effectivePerms.inventario.editar}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "inventario",
                        "editar",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </Stack>

                {/* OTROS MODULOS (Ventas, Tickets) */}
                <Stack gap="xs">
                  <Text fw={500} size="sm">
                    Ventas & Tickets
                  </Text>
                  <Switch
                    label="Ver ventas"
                    checked={effectivePerms.ventas.ver}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "ventas",
                        "ver",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Crear nueva venta"
                    checked={effectivePerms.ventas.crear}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "ventas",
                        "crear",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Ver tickets/reparaciones"
                    checked={effectivePerms.tickets.ver}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "tickets",
                        "ver",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Cambiar estado de tickets"
                    checked={effectivePerms.tickets.cambiarEstado}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "tickets",
                        "cambiarEstado",
                        e.currentTarget.checked,
                      )
                    }
                  />
                  <Switch
                    label="Editar ganancias/comisión"
                    checked={effectivePerms.tickets.editarComision}
                    onChange={(e) =>
                      handleTogglePermiso(
                        "tickets",
                        "editarComision",
                        e.currentTarget.checked,
                      )
                    }
                  />
                </Stack>
              </SimpleGrid>
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
