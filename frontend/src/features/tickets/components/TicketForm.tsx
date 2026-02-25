import { useEffect } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  NumberInput,
  Select,
  Stack,
  Button,
  Group,
  Divider,
  Checkbox,
  SimpleGrid,
  Text,
  Paper,
  Slider,
  Badge,
  Popover,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconFingerprint } from "@tabler/icons-react";
import type { TicketFormValues } from "../types/tickets.types";
import type { TicketReparacion } from "../../../types";
import { calcularTotales } from "../utils/calculations";
import { PatternCanvas } from "./PatternCanvas";

interface TicketFormProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: TicketFormValues) => void;
  initialData?: TicketReparacion | null;
}

export function TicketForm({
  opened,
  onClose,
  onSubmit,
  initialData,
}: TicketFormProps) {
  const form = useForm<TicketFormValues>({
    initialValues: {
      clienteId: "",
      tecnicoId: undefined,
      tipo_equipo: "Smartphone",
      marca: "",
      modelo: "",
      imei: "",
      clave: "",
      patron_visual: "",
      checklist: {
        camaras: false,
        touch: false,
        senal: false,
        encendido: false,
        botones: false,
      },
      falla: "",
      falla_reportada: "",
      observaciones: "",
      costo_repuestos_usd: 0,
      precio_total_usd: 0,
      porcentaje_tecnico: 0.4,
    },
  });

  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues({
          clienteId: initialData.clienteId,
          tecnicoId: initialData.tecnicoId,
          tipo_equipo: initialData.tipo_equipo,
          marca: initialData.marca,
          modelo: initialData.modelo,
          imei: initialData.imei || "",
          clave: initialData.clave || "",
          patron_visual: initialData.patron_visual || "",
          checklist:
            (initialData.checklist as TicketFormValues["checklist"]) || {
              camaras: false,
              touch: false,
              senal: false,
              encendido: false,
              botones: false,
            },
          falla: initialData.falla,
          falla_reportada: initialData.falla_reportada || "",
          observaciones: initialData.observaciones || "",
          costo_repuestos_usd: initialData.costo_repuestos_usd,
          precio_total_usd: initialData.precio_total_usd,
          porcentaje_tecnico: initialData.porcentaje_tecnico,
        });
      } else {
        form.reset();
      }
    }
  }, [initialData, opened]);

  const precioTotal = Number(form.values.precio_total_usd || 0);
  const costoRepuestos = Number(form.values.costo_repuestos_usd || 0);
  const porcentaje = Number(form.values.porcentaje_tecnico || 0);

  const { pagoTecnico, gananciaLocal } = calcularTotales(
    precioTotal,
    costoRepuestos,
    porcentaje,
  );

  const modalTitle = initialData
    ? `Editar Ticket #T-${initialData.id.substring(0, 6)}`
    : "Ingreso de Orden de Servicio";

  const handleSubmit = (values: TicketFormValues) => {
    onSubmit(values);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={modalTitle} size="xl">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Divider label="1. Datos del Cliente" labelPosition="center" />
          <TextInput
            label="ID del Cliente"
            placeholder="Seleccionar o crear cliente"
            required
            {...form.getInputProps("clienteId")}
          />

          <Divider label="2. Información del Equipo" labelPosition="center" />
          <SimpleGrid cols={3}>
            <Select
              label="Tipo de Equipo"
              data={[
                { value: "Smartphone", label: "Smartphone" },
                { value: "Tablet", label: "Tablet" },
                { value: "Laptop", label: "Laptop" },
                { value: "Otro", label: "Otro" },
              ]}
              {...form.getInputProps("tipo_equipo")}
            />
            <TextInput
              label="Marca"
              placeholder="Ej: Apple"
              {...form.getInputProps("marca")}
            />
            <TextInput
              label="Modelo"
              placeholder="Ej: iPhone 13 Pro"
              {...form.getInputProps("modelo")}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="IMEI"
              placeholder="15 dígitos"
              {...form.getInputProps("imei")}
            />
            <TextInput
              label="Clave/PIN"
              placeholder="1234"
              {...form.getInputProps("clave")}
            />
          </SimpleGrid>

          <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <TextInput
                label="Patrón Visual"
                placeholder="Click para dibujar"
                readOnly
                leftSection={<IconFingerprint size={16} />}
                style={{ cursor: "pointer" }}
                {...form.getInputProps("patron_visual")}
              />
            </Popover.Target>
            <Popover.Dropdown bg="gray.9">
              <Text size="xs" fw={700} mb="xs" c="white" ta="center">
                DIBUJA EL PATRÓN EN LOS PUNTOS
              </Text>
              <PatternCanvas
                value={form.values.patron_visual || ""}
                onPatternComplete={(pattern) =>
                  form.setFieldValue("patron_visual", pattern)
                }
              />
            </Popover.Dropdown>
          </Popover>

          <Divider
            label="3. Estado al Recibir (Checklist)"
            labelPosition="center"
          />
          <SimpleGrid cols={5}>
            <Checkbox
              label="Cámaras"
              {...form.getInputProps("checklist.camaras", { type: "checkbox" })}
            />
            <Checkbox
              label="Touch"
              {...form.getInputProps("checklist.touch", { type: "checkbox" })}
            />
            <Checkbox
              label="Señal"
              {...form.getInputProps("checklist.senal", { type: "checkbox" })}
            />
            <Checkbox
              label="Enciende"
              {...form.getInputProps("checklist.encendido", {
                type: "checkbox",
              })}
            />
            <Checkbox
              label="Botones"
              {...form.getInputProps("checklist.botones", { type: "checkbox" })}
            />
          </SimpleGrid>
          <Textarea
            label="Falla Reportada"
            required
            {...form.getInputProps("falla")}
          />
          <Textarea
            label="Observaciones"
            {...form.getInputProps("observaciones")}
          />

          <Divider label="4. Costos y Split Dinámico" labelPosition="center" />
          <SimpleGrid cols={3} mb="sm">
            <NumberInput
              label="Precio Cliente ($)"
              prefix="$"
              min={0}
              {...form.getInputProps("precio_total_usd")}
            />
            <NumberInput
              label="Costo Repuestos ($)"
              prefix="$"
              min={0}
              {...form.getInputProps("costo_repuestos_usd")}
            />
            <Select
              label="Técnico"
              placeholder="Asignar"
              data={[
                { value: "u2", label: "María López" },
                { value: "u3", label: "José Ramírez" },
                { value: "u5", label: "Pedro Castillo" },
              ]}
              onChange={(v) => form.setFieldValue("tecnicoId", v || undefined)}
              value={form.values.tecnicoId || null}
            />
          </SimpleGrid>

          <Stack gap={5} px="md" py="xs">
            <Group justify="space-between">
              <Text size="sm" fw={700}>
                Comisión Técnico:
              </Text>
              <Badge size="lg" variant="light">
                {(porcentaje * 100).toFixed(0)}%
              </Badge>
            </Group>
            <Slider
              step={5}
              min={0}
              max={100}
              label={(val) => `${Math.round(val)}%`}
              value={porcentaje * 100}
              onChange={(val) =>
                form.setFieldValue("porcentaje_tecnico", val / 100)
              }
              marks={[
                { value: 20, label: "20%" },
                { value: 40, label: "40%" },
                { value: 60, label: "60%" },
              ]}
            />
          </Stack>

          {/* Resumen Final */}
          <Paper withBorder p="sm" bg="gray.0" mt="md">
            <Group justify="space-around">
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Mano de Obra Neta
                </Text>
                <Text fw={700}>
                  ${(precioTotal - costoRepuestos).toFixed(2)}
                </Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Pago Técnico ({(porcentaje * 100).toFixed(0)}%)
                </Text>
                <Text fw={700} c="blue">
                  ${(Number(pagoTecnico) || 0).toFixed(2)}
                </Text>
              </Stack>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Tu Ganancia
                </Text>
                <Text fw={700} c="green">
                  ${(Number(gananciaLocal) || 0).toFixed(2)}
                </Text>
              </Stack>
            </Group>
          </Paper>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Actualizar Ticket" : "Crear Ticket"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
