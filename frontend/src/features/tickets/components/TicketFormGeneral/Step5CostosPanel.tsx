import {
  Stack,
  SimpleGrid,
  NumberInput,
  Select,
  Group,
  Text,
  Badge,
  Slider,
  Paper,
  ThemeIcon,
  Divider,
} from "@mantine/core";
import {
  IconCurrencyDollar,
  IconUserCircle,
  IconPercentage,
  IconReceipt2,
  IconBuildingStore,
  IconCash,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import { useMonedas } from "../../../../services";

interface Step5CostosPanelProps {
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

export function Step5CostosPanel({
  form,
  isEdit,
  queries,
  computed,
  permissions,
}: Step5CostosPanelProps) {
  const { tecnicoOptions } = queries;
  const { canAsignarTecnico = true, canEditarComision = true } = permissions;
  const {
    totalRepuestosCliente,
    porcentaje,
    pagoTecnicoCreate,
    precioTotalCreate,
    gananciaLocalCreate,
    pagoTecnicoEdit,
    precioTotalEdit,
    gananciaLocalEdit,
  } = computed;

  const { data: monedas } = useMonedas();
  const tasaCop = monedas?.find((m) => m.codigo === "COP")?.tasa_cambio || 1;

  const currentUsdPrice = Number(form.values.mano_de_obra_usd) || 0;
  const currentCopPrice = currentUsdPrice * tasaCop;

  const handleCopChange = (val: string | number) => {
    const copVal = Number(val) || 0;
    form.setFieldValue("mano_de_obra_usd", copVal / tasaCop);
  };

  const finalPriceUsd = isEdit ? precioTotalEdit : precioTotalCreate;
  const finalPriceCop = finalPriceUsd * tasaCop;
  const finalTechPayUsd = isEdit ? pagoTecnicoEdit : pagoTecnicoCreate;
  const finalTechPayCop = finalTechPayUsd * tasaCop;
  const finalProfitUsd = isEdit ? gananciaLocalEdit : gananciaLocalCreate;
  const finalProfitCop = finalProfitUsd * tasaCop;

  return (
    <Stack gap="lg">
      {/* ── Presupuesto y Mano de Obra (Dual Currency) ── */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                <IconCurrencyDollar size={20} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" className="font-heading">
                  Precio Cobrado al Cliente
                </Text>
                <Text size="xs" c="dimmed">
                  Mano de obra y servicios en dólares americanos con tasa en pesos
                </Text>
              </div>
            </Group>

            <Badge variant="outline" color="blue" size="sm">
              Tasa: 1 USD = ${tasaCop.toLocaleString("es-CO")} COP
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <div>
              <Text size="xs" fw={600} mb={4} c="dimmed">
                MONTO EN USD ($)
              </Text>
              <NumberInput
                prefix="$ "
                min={0}
                decimalScale={2}
                fixedDecimalScale
                placeholder="0.00"
                size="md"
                styles={{
                  input: {
                    fontSize: "18px",
                    fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                  },
                }}
                {...form.getInputProps("mano_de_obra_usd")}
              />
            </div>

            <div>
              <Text size="xs" fw={600} mb={4} c="dimmed">
                EQUIVALENTE EN COP ($)
              </Text>
              <NumberInput
                min={0}
                decimalScale={0}
                value={currentCopPrice}
                onChange={handleCopChange}
                placeholder="0"
                thousandSeparator="."
                decimalSeparator=","
                prefix="$ "
                size="md"
                styles={{
                  input: {
                    fontSize: "18px",
                    fontWeight: 700,
                    fontFamily: "var(--font-heading)",
                  },
                }}
              />
            </div>
          </SimpleGrid>

          {isEdit && totalRepuestosCliente > 0 && (
            <Paper
              p="xs"
              radius="sm"
              style={{
                background: "rgba(245, 158, 11, 0.08)",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <Group justify="space-between">
                <Text size="xs" fw={600} c="orange">
                  Repuestos añadidos al ticket:
                </Text>
                <Text size="sm" fw={700} className="font-heading" c="orange">
                  +${totalRepuestosCliente.toFixed(2)} USD
                </Text>
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* ── Asignación Técnica y Comisión ── */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" color="indigo" variant="light">
              <IconUserCircle size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700} size="sm" className="font-heading">
                Técnico Responsable & Comisión de Pago
              </Text>
              <Text size="xs" c="dimmed">
                Asigna al especialista y ajusta el porcentaje pactado por reparación
              </Text>
            </div>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Select
              label="Técnico Asignado"
              placeholder="Seleccionar especialista..."
              data={tecnicoOptions}
              searchable
              clearable
              disabled={!canAsignarTecnico}
              nothingFoundMessage="Sin técnicos registrados"
              onChange={(v) => form.setFieldValue("tecnicoId", v || undefined)}
              value={form.values.tecnicoId || null}
              leftSection={<IconUserCircle size={16} />}
            />

            {canEditarComision && (
              <Stack gap={4}>
                <Group justify="space-between" align="center">
                  <Text size="xs" fw={600} c="dimmed">
                    PORCENTAJE DE COMISIÓN
                  </Text>
                  <Badge size="lg" variant="filled" color="indigo">
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
                    { value: 50, label: "50%" },
                    { value: 60, label: "60%" },
                  ]}
                  color="indigo"
                />
              </Stack>
            )}
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* ── Desglose Financiero Ejecutivo en Tiempo Real ── */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-elevated)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <ThemeIcon size="md" radius="md" color="green" variant="light">
                <IconReceipt2 size={16} />
              </ThemeIcon>
              <Text fw={700} size="sm" className="font-heading">
                Liquidación Estimada de la Orden
              </Text>
            </Group>
            <Badge color="green" variant="light" size="sm">
              Cálculo Automático
            </Badge>
          </Group>

          <Divider color="var(--border-subtle)" />

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            {/* 1. Cobro Cliente */}
            <Paper
              p="md"
              radius="md"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Group gap="xs" mb={4}>
                <IconCash size={16} color="var(--mantine-color-blue-6)" />
                <Text size="xs" fw={600} c="dimmed">
                  TOTAL A COBRAR
                </Text>
              </Group>
              <Text size="xl" fw={800} className="font-heading" c="blue">
                ${finalPriceUsd.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                COP ${finalPriceCop.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
              </Text>
            </Paper>

            {/* 2. Pago Técnico */}
            <Paper
              p="md"
              radius="md"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <Group gap="xs" mb={4}>
                <IconPercentage size={16} color="var(--mantine-color-indigo-6)" />
                <Text size="xs" fw={600} c="dimmed">
                  PAGO TÉCNICO ({(porcentaje * 100).toFixed(0)}%)
                </Text>
              </Group>
              <Text size="xl" fw={800} className="font-heading" c="indigo">
                ${finalTechPayUsd.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                COP ${finalTechPayCop.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
              </Text>
            </Paper>

            {/* 3. Ganancia Neta Local */}
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(34, 197, 94, 0.08)",
                border: "1px solid rgba(34, 197, 94, 0.25)",
              }}
            >
              <Group gap="xs" mb={4}>
                <IconBuildingStore size={16} color="var(--mantine-color-green-6)" />
                <Text size="xs" fw={700} c="green">
                  GANANCIA TALLER
                </Text>
              </Group>
              <Text size="xl" fw={800} className="font-heading" c="green">
                ${finalProfitUsd.toFixed(2)}
              </Text>
              <Text size="xs" c="dimmed" mt={2}>
                COP ${finalProfitCop.toLocaleString("es-CO", { maximumFractionDigits: 0 })}
              </Text>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  );
}
