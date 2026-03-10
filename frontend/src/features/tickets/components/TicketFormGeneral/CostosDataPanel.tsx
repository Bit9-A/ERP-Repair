import {
  Accordion,
  Stack,
  SimpleGrid,
  NumberInput,
  Select,
  Group,
  Text,
  Badge,
  Slider,
  Paper,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";

interface CostosDataPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  isEdit: boolean;
  queries: {
    tecnicoOptions: { value: string; label: string }[];
  };
  computed: {
    totalRepuestosCliente: number;
    manoDeObra: number;
    porcentaje: number;
    pagoTecnicoCreate: number;
    precioTotalCreate: number;
    gananciaLocalCreate: number;
    pagoTecnicoEdit: number;
    precioTotalEdit: number;
    gananciaLocalEdit: number;
    costoRepuestosManual: number;
  };
  permissions: {
    canAsignarTecnico?: boolean;
    canEditarComision?: boolean;
  };
}

export function CostosDataPanel({
  form,
  isEdit,
  queries,
  computed,
  permissions,
}: CostosDataPanelProps) {
  const { tecnicoOptions } = queries;
  const { canAsignarTecnico, canEditarComision } = permissions;
  const {
    totalRepuestosCliente,
    manoDeObra,
    porcentaje,
    pagoTecnicoCreate,
    precioTotalCreate,
    gananciaLocalCreate,
    pagoTecnicoEdit,
    precioTotalEdit,
    gananciaLocalEdit,
  } = computed;

  return (
    <Accordion.Item value="costos">
      <Accordion.Control>
        <Text fw={600}>5. Costos y Split Dinámico</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 1, sm: isEdit ? 3 : 2 }} mb="sm">
            <NumberInput
              label="Mano de Obra ($)"
              description="Lo que cobras por reparar"
              prefix="$"
              min={0}
              {...form.getInputProps("mano_de_obra_usd")}
            />
            {isEdit && (
              <NumberInput
                label="Repuestos en Ticket ($)"
                description="Calculado automáticamente"
                prefix="$"
                readOnly
                value={totalRepuestosCliente}
              />
            )}
            <Select
              label="Técnico"
              placeholder="Asignar"
              description="Según tecnico a reparar"
              data={tecnicoOptions}
              searchable
              clearable
              disabled={!canAsignarTecnico}
              nothingFoundMessage="Sin técnicos disponibles"
              onChange={(v) => form.setFieldValue("tecnicoId", v || undefined)}
              value={form.values.tecnicoId || null}
            />
          </SimpleGrid>

          {canEditarComision && (
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
          )}

          <Paper withBorder p="sm" mt="md">
            <Group justify="space-between" mb="sm">
              <Text fw={700}>Total a Cobrar al Cliente:</Text>
              <Badge size="lg" color="blue" variant="filled">
                $
                {isEdit
                  ? precioTotalEdit.toFixed(2)
                  : precioTotalCreate.toFixed(2)}
              </Badge>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: canEditarComision ? 3 : 2 }}>
              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  Mano de Obra Neta
                </Text>
                <Text fw={700}>${manoDeObra.toFixed(2)}</Text>
              </Stack>

              {canEditarComision && (
                <Stack align="center" gap={0}>
                  <Text size="xs" c="dimmed">
                    Pago Técnico ({(porcentaje * 100).toFixed(0)}%)
                  </Text>
                  <Text fw={700} c="blue">
                    $
                    {isEdit
                      ? pagoTecnicoEdit.toFixed(2)
                      : pagoTecnicoCreate.toFixed(2)}
                  </Text>
                </Stack>
              )}

              <Stack align="center" gap={0}>
                <Text size="xs" c="dimmed">
                  {canEditarComision ? "Tu Ganancia" : "Total Reparación"}
                </Text>
                <Text fw={700} c={canEditarComision ? "green" : "blue"}>
                  $
                  {canEditarComision
                    ? (isEdit
                      ? gananciaLocalEdit
                      : gananciaLocalCreate
                    ).toFixed(2)
                    : (isEdit ? precioTotalEdit : precioTotalCreate).toFixed(2)}
                </Text>
              </Stack>
            </SimpleGrid>
          </Paper>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
