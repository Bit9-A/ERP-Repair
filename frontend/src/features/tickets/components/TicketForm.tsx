import { useEffect } from "react";
import {
  Modal, TextInput, Textarea, NumberInput, Select, Stack,
  Button, Group, Divider, Checkbox, SimpleGrid, Text, Paper, Slider, Badge, Popover
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFingerprint } from "@tabler/icons-react";
import type { TicketFormValues, TicketReparacion } from "../types/tickets.types";
import { calcularTotales } from "../utils/calculations";
import { PatternCanvas } from "./PatternCanvas";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
  initialData?: TicketReparacion | null;
}

export function TicketForm({ opened, onClose, onSubmit, initialData }: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    initialValues: {
      cliente: { nombre: "", cedula: "", telefono: "", correo: "" },
      equipo: { tipo: "Smartphone", marca: "", modelo: "", imei: "", clave: "", patron: "" },
      checklist: { camaras: false, touch: false, senal: false, encendido: false, botones: false },
      falla: "",
      estado: "RECIBIDO",
      tecnicoId: null,
      costo_repuestos_usd: 0,
      precio_total_usd: 0,
      porcentaje_tecnico: 0.40,
    },
  });

  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues(initialData);
      } else {
        form.reset();
      }
    }
  }, [initialData, opened]);

  // --- CORRECCIÓN DE SEGURIDAD AQUÍ ---
  // Convertimos a número y aseguramos un 0 si el valor es null/undefined/vacío
  const precioTotal = Number(form.values.precio_total_usd || 0);
  const costoRepuestos = Number(form.values.costo_repuestos_usd || 0);
  const porcentaje = Number(form.values.porcentaje_tecnico || 0);

  const { pagoTecnico, gananciaLocal } = calcularTotales(
    precioTotal,
    costoRepuestos,
    porcentaje
  );

  const modalTitle = initialData ? `Editar Ticket #T-${initialData.id}` : "Ingreso de Orden de Servicio";

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="xl">
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Divider label="1. Datos del Cliente" labelPosition="center" />
          <SimpleGrid cols={2}>
            <TextInput label="Nombre" required {...form.getInputProps("cliente.nombre")} />
            <TextInput label="Cédula" required {...form.getInputProps("cliente.cedula")} />
            <TextInput label="Teléfono" required {...form.getInputProps("cliente.telefono")} />
            <TextInput label="Correo (Opcional)" {...form.getInputProps("cliente.correo")} />
          </SimpleGrid>

          <Divider label="2. Información del Equipo" labelPosition="center" />
          <SimpleGrid cols={3}>
            <TextInput label="Marca" placeholder="Ej: iPhone" {...form.getInputProps("equipo.marca")} />
            <TextInput label="Modelo" placeholder="Ej: 13 Pro" {...form.getInputProps("equipo.modelo")} />
            <TextInput label="IMEI" placeholder="15 dígitos" {...form.getInputProps("equipo.imei")} />
          </SimpleGrid>

          <Group grow align="flex-end">
            <TextInput label="Clave/PIN" placeholder="1234" {...form.getInputProps("equipo.clave")} />
            <Popover width={300} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <TextInput
                  label="Patrón Visual"
                  placeholder="Click para dibujar"
                  readOnly
                  leftSection={<IconFingerprint size={16} />}
                  style={{ cursor: 'pointer' }}
                  {...form.getInputProps("equipo.patron")}
                />
              </Popover.Target>
              <Popover.Dropdown bg="gray.9">
                <Text size="xs" fw={700} mb="xs" c="white" ta="center">DIBUJA EL PATRÓN EN LOS PUNTOS</Text>
                <PatternCanvas
                  value={form.values.equipo.patron}
                  onPatternComplete={(pattern) => form.setFieldValue('equipo.patron', pattern)}
                />
              </Popover.Dropdown>
            </Popover>
          </Group>

          <Divider label="3. Estado al Recibir (Checklist)" labelPosition="center" />
          <SimpleGrid cols={5}>
            <Checkbox label="Cámaras" {...form.getInputProps("checklist.camaras", { type: 'checkbox' })} />
            <Checkbox label="Touch" {...form.getInputProps("checklist.touch", { type: 'checkbox' })} />
            <Checkbox label="Señal" {...form.getInputProps("checklist.senal", { type: 'checkbox' })} />
            <Checkbox label="Enciende" {...form.getInputProps("checklist.encendido", { type: 'checkbox' })} />
            <Checkbox label="Botones" {...form.getInputProps("checklist.botones", { type: 'checkbox' })} />
          </SimpleGrid>
          <Textarea label="Falla y Observaciones" required {...form.getInputProps("falla")} />

          <Divider label="4. Costos y Split Dinámico" labelPosition="center" />
          <SimpleGrid cols={3} mb="sm">
            <NumberInput label="Precio Cliente ($)" prefix="$" min={0} {...form.getInputProps("precio_total_usd")} />
            <NumberInput label="Costo Repuestos ($)" prefix="$" min={0} {...form.getInputProps("costo_repuestos_usd")} />
            <Select
              label="Técnico"
              placeholder="Asignar"
              data={[{ value: '1', label: 'Técnico Principal' }, { value: '2', label: 'Técnico Apoyo' }]}
              onChange={(v) => form.setFieldValue('tecnicoId', v ? Number(v) : null)}
              value={form.values.tecnicoId?.toString()}
            />
          </SimpleGrid>

          <Stack gap={5} px="md" py="xs">
            <Group justify="space-between">
              <Text size="sm" fw={700}>Comisión Técnico:</Text>
              <Badge size="lg" variant="light">{(porcentaje * 100).toFixed(0)}%</Badge>
            </Group>
            <Slider
              step={5}
              min={0}
              max={100}
              label={(val) => `${Math.round(val)}%`}
              value={porcentaje * 100}
              onChange={(val) => form.setFieldValue('porcentaje_tecnico', val / 100)}
              marks={[
                { value: 20, label: '20%' },
                { value: 40, label: '40%' },
                { value: 60, label: '60%' },
              ]}
            />
          </Stack>

          {/* Resumen Final con validación de tipo */}
          <Paper withBorder p="sm" bg="gray.0" mt="md">
            <Group justify="space-around">
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">Mano de Obra Neta</Text>
                <Text fw={700}>${(precioTotal - costoRepuestos).toFixed(2)}</Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">Pago Técnico ({(porcentaje * 100).toFixed(0)}%)</Text>
                <Text fw={700} c="blue">${(Number(pagoTecnico) || 0).toFixed(2)}</Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">Tu Ganancia</Text>
                <Text fw={700} c="green">${(Number(gananciaLocal) || 0).toFixed(2)}</Text>
              </Stack>
            </Group>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>Cancelar</Button>
            <Button type="submit">
              {initialData ? "Actualizar Ticket" : "Crear Ticket"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}