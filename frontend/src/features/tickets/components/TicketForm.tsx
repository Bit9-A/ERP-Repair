import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stack,
  Button,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import type { TicketFormValues } from "../types/tickets.types";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
}

export function TicketForm({ opened, onClose, onSubmit }: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    initialValues: {
      clienteNombre: "",
      clienteTelefono: "",
      equipo: "",
      falla: "",
      tecnicoId: null,
      mano_obra_usd: 0,
    },
    validate: {
      clienteNombre: (v) => (v.trim().length < 2 ? "Nombre requerido" : null),
      clienteTelefono: (v) =>
        v.trim().length < 7 ? "Teléfono inválido" : null,
      equipo: (v) => (v.trim().length < 3 ? "Equipo requerido" : null),
      falla: (v) => (v.trim().length < 5 ? "Describe la falla" : null),
    },
  });

  const handleSubmit = (values: TicketFormValues) => {
    onSubmit(values);
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Nuevo Ticket de Reparación"
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Nombre del Cliente"
              placeholder="Nombre completo"
              {...form.getInputProps("clienteNombre")}
            />
            <TextInput
              label="Teléfono"
              placeholder="04XX-XXXXXXX"
              {...form.getInputProps("clienteTelefono")}
            />
          </Group>

          <TextInput
            label="Equipo"
            placeholder="Ej: Samsung Galaxy A54"
            {...form.getInputProps("equipo")}
          />

          <Textarea
            label="Falla Reportada"
            placeholder="Describe el problema del equipo"
            minRows={3}
            {...form.getInputProps("falla")}
          />

          <Group grow>
            <Select
              label="Técnico Asignado"
              placeholder="Seleccionar técnico"
              data={[
                { value: "1", label: "Carlos Méndez" },
                { value: "2", label: "Ana Rodríguez" },
              ]}
              onChange={(v) =>
                form.setFieldValue("tecnicoId", v ? parseInt(v) : null)
              }
            />
            <NumberInput
              label="Mano de Obra (USD)"
              min={0}
              decimalScale={2}
              fixedDecimalScale
              prefix="$"
              {...form.getInputProps("mano_obra_usd")}
            />
          </Group>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Crear Ticket</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
