import { useState, useEffect } from "react";
import {
  SimpleGrid,
  Stack,
  Title,
  Text,
  Paper,
  Grid,
  Group,
  Divider,
  Button,
  NumberInput,
  Badge,
  Box,
  Tooltip,
  Notification,
  LoadingOverlay,
  SegmentedControl,
  Tabs,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCurrencyDollar,
  IconReceipt,
  IconTrendingUp,
  IconTrendingDown,
  IconArrowsExchange,
  IconCash,
  IconReportMoney,
  IconWallet,
  IconCheck,
  IconDeviceFloppy,
  IconRefresh,
  IconSun,
  IconCalendarStats,
  IconCalendar,
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { PaymentsTable } from "../components/PaymentsTable";
import { EgresosTable } from "../components/EgresosTable";
import { RecurringExpensesPanel } from "../components/RecurringExpensesPanel";
import { useMonedas, useUpdateTasa, useFinanceStats } from "../../../services";

type Periodo = "dia" | "semana" | "mes";

interface RateConfig {
  code: string;
  name: string;
  symbol: string;
  color: string;
  bgFrom: string;
  bgBorder: string;
}

const RATE_CONFIGS: RateConfig[] = [
  {
    code: "VES",
    name: "Bolívar Digital",
    symbol: "Bs.",
    color: "blue",
    bgFrom: "rgba(59, 130, 246, 0.15)",
    bgBorder: "rgba(59, 130, 246, 0.3)",
  },
  {
    code: "COP",
    name: "Peso Colombiano",
    symbol: "$",
    color: "yellow",
    bgFrom: "rgba(245, 158, 11, 0.15)",
    bgBorder: "rgba(245, 158, 11, 0.3)",
  },
];

const PERIODO_LABELS: Record<Periodo, string> = {
  dia: "del Día",
  semana: "de la Semana",
  mes: "del Mes",
};

export function FinancePage() {
  // -- Period state --
  const [periodo, setPeriodo] = useState<Periodo>("dia");

  // -- API hooks --
  const { data: monedas = [], isLoading } = useMonedas();
  const updateTasa = useUpdateTasa();
  const { data: stats } = useFinanceStats(periodo);

  // Build a map: code -> { id, tasa_cambio }
  const monedaMap = Object.fromEntries(
    monedas.map((m) => [m.codigo, { id: m.id, tasa: m.tasa_cambio }]),
  );

  // Local editing state
  const [editRates, setEditRates] = useState<Record<string, number>>({});
  const [showSaved, setShowSaved] = useState(false);

  // Sync edit state when monedas load from API
  useEffect(() => {
    if (monedas.length > 0) {
      const rates: Record<string, number> = {};
      for (const m of monedas) {
        rates[m.codigo] = m.tasa_cambio;
      }
      setEditRates(rates);
    }
  }, [monedas]);

  const hasChanges = RATE_CONFIGS.some(
    (r) => editRates[r.code] !== monedaMap[r.code]?.tasa,
  );

  const formattedLastUpdated = "—";

  const handleSaveRates = async () => {
    try {
      const promises = RATE_CONFIGS.map((r) => {
        const moneda = monedaMap[r.code];
        if (moneda && editRates[r.code] !== moneda.tasa) {
          return updateTasa.mutateAsync({
            id: moneda.id,
            tasa_cambio: editRates[r.code],
          });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2500);
      notifications.show({
        title: "Tasas actualizadas",
        message: "Las tasas de cambio fueron guardadas correctamente",
        color: "green",
      });
    } catch {
      notifications.show({
        title: "Error",
        message: "No se pudieron guardar las tasas",
        color: "red",
      });
    }
  };

  const handleResetRates = () => {
    const rates: Record<string, number> = {};
    for (const m of monedas) {
      rates[m.codigo] = m.tasa_cambio;
    }
    setEditRates(rates);
  };

  const periodoLabel = PERIODO_LABELS[periodo];

  return (
    <Stack gap="xl" pos="relative">
      <LoadingOverlay visible={isLoading} />

      {/* Header */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="xs">
          <IconWallet size={24} color="#22C55E" />
          <Title order={2}>Gestión Financiera</Title>
        </Group>

        {/* Period selector */}
        <SegmentedControl
          value={periodo}
          onChange={(v) => setPeriodo(v as Periodo)}
          size="xs"
          radius="md"
          data={[
            {
              value: "dia",
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconSun size={13} />
                  <span>Día</span>
                </Group>
              ),
            },
            {
              value: "semana",
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconCalendarStats size={13} />
                  <span>Semana</span>
                </Group>
              ),
            },
            {
              value: "mes",
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconCalendar size={13} />
                  <span>Mes</span>
                </Group>
              ),
            },
          ]}
        />
      </Group>

      {/* Two-column: Currency rates + KPIs */}
      <Grid gutter="md">
        {/* Left: Multimoneda & Tasas */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper
            p="lg"
            radius="lg"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
              height: "100%",
            }}
          >
            <Group justify="space-between" mb="lg">
              <Group gap="xs">
                <IconArrowsExchange size={18} color="#3B82F6" />
                <Text size="sm" fw={700}>
                  Multimoneda &amp; Tasas
                </Text>
              </Group>
              <Badge variant="dot" color="brand" size="xs">
                {formattedLastUpdated}
              </Badge>
            </Group>

            <Stack gap="md">
              {/* USD – base */}
              <Paper
                p="sm"
                radius="md"
                style={{
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                }}
              >
                <Group justify="space-between">
                  <div>
                    <Badge variant="filled" color="brand" size="sm" mb={4}>
                      USD
                    </Badge>
                    <Text size="sm" fw={500}>
                      Dólar Americano
                    </Text>
                  </div>
                  <Text ff="monospace" fw={700} size="lg" c="brand.6">
                    Base
                  </Text>
                </Group>
              </Paper>

              {/* Editable rates */}
              {RATE_CONFIGS.map((r) => (
                <Paper
                  key={r.code}
                  p="sm"
                  radius="md"
                  style={{
                    background: r.bgFrom,
                    border: `1px solid ${r.bgBorder}`,
                    transition: "box-shadow 200ms ease",
                    boxShadow:
                      editRates[r.code] !== monedaMap[r.code]?.tasa
                        ? "0 0 0 2px rgba(59,130,246,0.3)"
                        : "none",
                  }}
                >
                  <Group justify="space-between">
                    <div>
                      <Group gap={6} mb={4}>
                        <Badge variant="filled" color={r.color} size="sm">
                          {r.code}
                        </Badge>
                        {editRates[r.code] !== monedaMap[r.code]?.tasa && (
                          <Badge variant="filled" color="blue" size="xs">
                            Modificado
                          </Badge>
                        )}
                      </Group>
                      <Text size="sm" fw={600}>
                        {r.name}
                      </Text>
                      <Text size="sm" fw={500} c="dimmed" mt={2}>
                        1 USD = {r.symbol}{" "}
                        {editRates[r.code]?.toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </div>
                    <NumberInput
                      value={editRates[r.code] ?? 0}
                      onChange={(v) =>
                        setEditRates((prev) => ({
                          ...prev,
                          [r.code]: Number(v) || 0,
                        }))
                      }
                      decimalScale={2}
                      fixedDecimalScale
                      prefix={`${r.symbol} `}
                      size="sm"
                      hideControls
                      w={140}
                      min={0}
                      styles={{
                        input: {
                          fontFamily: '"Fira Code", monospace',
                          fontWeight: 700,
                          fontSize: "18px",
                          textAlign: "right",
                        },
                      }}
                    />
                  </Group>
                </Paper>
              ))}

              {/* Action buttons */}
              <Group justify="flex-end" gap="xs" mt="xs">
                {hasChanges && (
                  <Tooltip label="Deshacer cambios">
                    <Button
                      variant="subtle"
                      color="gray"
                      size="xs"
                      leftSection={<IconRefresh size={14} />}
                      onClick={handleResetRates}
                    >
                      Deshacer
                    </Button>
                  </Tooltip>
                )}
                <Button
                  size="xs"
                  leftSection={<IconDeviceFloppy size={14} />}
                  disabled={!hasChanges}
                  onClick={handleSaveRates}
                  loading={updateTasa.isPending}
                  variant={hasChanges ? "filled" : "light"}
                >
                  Guardar Tasas
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Right: 4 Financial KPIs */}
        <Grid.Col span={{ base: 12, md: 7 }}>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <StatCard
              title={`Ingresos ${periodoLabel}`}
              value={`$${(stats?.ingresosHoy ?? 0).toFixed(2)}`}
              icon={<IconCurrencyDollar size={20} />}
              accentColor="#22C55E"
            />
            <StatCard
              title={`Egresos ${periodoLabel}`}
              value={`-$${(stats?.egresosHoy ?? 0).toFixed(2)}`}
              icon={<IconTrendingDown size={20} />}
              accentColor="#EF4444"
              subtitle="Compras de inventario y gastos"
            />
            <StatCard
              title={`Balance ${periodoLabel}`}
              value={`$${(stats?.balanceHoy ?? 0).toFixed(2)}`}
              icon={<IconTrendingUp size={20} />}
              accentColor="#3B82F6"
            />
            <StatCard
              title={`Tickets Cobrados ${periodoLabel}`}
              value={String(stats?.ticketsCobradosHoy ?? 0)}
              icon={<IconReceipt size={20} />}
              accentColor="#8B5CF6"
            />
          </SimpleGrid>
        </Grid.Col>
      </Grid>

      {/* Saved notification */}
      {showSaved && (
        <Notification
          icon={<IconCheck size={18} />}
          color="green"
          title="Tasas actualizadas"
          withCloseButton={false}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 1000,
            maxWidth: 320,
          }}
        >
          Tasas guardadas en la base de datos
        </Notification>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="recaudacion" variant="outline" radius="md">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="recaudacion"
            leftSection={<IconReportMoney size={16} />}
          >
            Recaudación (Ingresos)
          </Tabs.Tab>
          <Tabs.Tab
            value="gastos"
            leftSection={<IconTrendingDown size={16} />}
            color="red"
          >
            Gastos & Egresos
          </Tabs.Tab>

          <Tabs.Tab
            value="recurrentes"
            leftSection={<IconCalendarStats size={16} />}
            color="violet"
          >
            Gastos Fijos Programados
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="recaudacion">
          <PaymentsTable periodo={periodo} />
        </Tabs.Panel>

        <Tabs.Panel value="gastos">
          <EgresosTable periodo={periodo} />
        </Tabs.Panel>

        <Tabs.Panel value="recurrentes">
          <RecurringExpensesPanel />
        </Tabs.Panel>
      </Tabs>

      {/* Arqueo de Caja */}
      <Paper
        p="lg"
        radius="lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
        }}
      >
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconCash size={20} color="#8B5CF6" />
            <Text size="sm" fw={700}>
              Arqueo de Caja &amp; Conciliación
            </Text>
          </Group>
          <Button
            variant="light"
            color="violet"
            size="xs"
            leftSection={<IconReportMoney size={14} />}
          >
            Generar Reporte
          </Button>
        </Group>

        <Text size="xs" c="dimmed" mb="md">
          Realice el recuento físico de billetes y verifique contra el saldo
          esperado. Esta acción registrará el cierre contable definitivo del
          turno actual.
        </Text>

        <Divider color="var(--border-subtle)" mb="md" />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
              Fondo USD
            </Text>
            <Text ff="monospace" fw={700} size="xl" c="brand.6">
              ${(stats?.ingresosHoy ?? 0).toFixed(2)}
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
              Fondo VES
            </Text>
            <Text ff="monospace" fw={700} size="xl" c="blue.5">
              Bs. 0.00
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
              Fondo COP
            </Text>
            <Text ff="monospace" fw={700} size="xl" c="yellow.5">
              $0.00
            </Text>
          </Box>
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
