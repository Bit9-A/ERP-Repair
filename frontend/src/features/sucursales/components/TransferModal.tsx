import {
  Modal,
  Stack,
  Select,
  NumberInput,
  Button,
  Group,
  Text,
  Alert,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconArrowsTransferDown, IconInfoCircle } from "@tabler/icons-react";
import {
  useSucursales,
  useSucursalInventario,
  useTransferirStock,
} from "../../../services";

interface TransferModalProps {
  opened: boolean;
  onClose: () => void;
}

interface TransferFormValues {
  origenId: string;
  destinoId: string;
  productoId: string;
  cantidad: number;
}

export function TransferModal({ opened, onClose }: TransferModalProps) {
  const { data: sucursales = [], isLoading: loadingSucursales } =
    useSucursales();
  const transferir = useTransferirStock();

  const form = useForm<TransferFormValues>({
    initialValues: {
      origenId: "",
      destinoId: "",
      productoId: "",
      cantidad: 1,
    },
    validate: {
      origenId: (v) => (!v ? "Selecciona la sucursal de origen" : null),
      destinoId: (v, values) =>
        !v
          ? "Selecciona la sucursal de destino"
          : v === values.origenId
            ? "Origen y destino no pueden ser la misma sucursal"
            : null,
      productoId: (v) => (!v ? "Selecciona un producto" : null),
      cantidad: (v) => (v <= 0 ? "La cantidad debe ser mayor a 0" : null),
    },
  });

  // Load inventory of selected origin branch to show available products
  const { data: inventarioOrigen = [], isLoading: loadingInventario } =
    useSucursalInventario(form.values.origenId);

  const productoOptions = inventarioOrigen
    .filter((sp) => sp.stock > 0)
    .map((sp) => ({
      value: sp.productoId,
      label: `${sp.producto?.nombre ?? sp.productoId} (${sp.stock} u.)`,
    }));

  const sucursalOptions = sucursales.map((s) => ({
    value: s.id,
    label: s.nombre,
  }));

  const selectedProductoStock =
    inventarioOrigen.find((sp) => sp.productoId === form.values.productoId)
      ?.stock ?? null;

  const handleSubmit = async (values: TransferFormValues) => {
    try {
      const result = await transferir.mutateAsync(values);
      notifications.show({
        title: "Traslado exitoso",
        message: `Se trasladaron ${result.cantidad} unidades correctamente`,
        color: "green",
        icon: <IconArrowsTransferDown size={16} />,
      });
      form.reset();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "No se pudo realizar el traslado";
      notifications.show({ title: "Error", message: msg, color: "red" });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconArrowsTransferDown size={18} color="var(--primary)" />
          <Text fw={700}>Trasladar Mercancía</Text>
        </Group>
      }
      size="md"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert
            variant="light"
            color="blue"
            icon={<IconInfoCircle size={16} />}
          >
            <Text size="xs">
              Mueve unidades de un local a otro. El sistema descuenta en origen
              y suma en destino — ambos cambios son atómicos.
            </Text>
          </Alert>

          {loadingSucursales ? (
            <Group justify="center" py="md">
              <Loader size="sm" />
            </Group>
          ) : (
            <>
              <Group grow align="flex-start">
                <Select
                  label="Sucursal Origen"
                  placeholder="Selecciona origen"
                  data={sucursalOptions}
                  required
                  {...form.getInputProps("origenId")}
                  onChange={(v) => {
                    form.setFieldValue("origenId", v ?? "");
                    form.setFieldValue("productoId", ""); // reset product when origin changes
                  }}
                />
                <Select
                  label="Sucursal Destino"
                  placeholder="Selecciona destino"
                  data={sucursalOptions.filter(
                    (s) => s.value !== form.values.origenId,
                  )}
                  required
                  disabled={!form.values.origenId}
                  {...form.getInputProps("destinoId")}
                />
              </Group>

              <Select
                label="Producto"
                placeholder={
                  !form.values.origenId
                    ? "Selecciona origen primero"
                    : loadingInventario
                      ? "Cargando productos..."
                      : productoOptions.length === 0
                        ? "Sin productos con stock en esta sucursal"
                        : "Selecciona producto"
                }
                data={productoOptions}
                required
                disabled={!form.values.origenId || loadingInventario}
                searchable
                {...form.getInputProps("productoId")}
              />

              <NumberInput
                label="Cantidad a trasladar"
                min={1}
                max={selectedProductoStock ?? undefined}
                required
                description={
                  selectedProductoStock !== null
                    ? `Disponible en origen: ${selectedProductoStock} u.`
                    : undefined
                }
                {...form.getInputProps("cantidad")}
              />
            </>
          )}

          <Group justify="flex-end" mt="xs">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              leftSection={<IconArrowsTransferDown size={14} />}
              loading={transferir.isPending}
              disabled={!form.values.productoId}
            >
              Trasladar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
