import { useState } from "react";
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
} from "@mantine/core";
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
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { PaymentsTable } from "../components/PaymentsTable";
import {
  useExchangeRatesStore,
  type ExchangeRates,
} from "../../../stores/exchangeRates.store";

interface RateConfig {
  code: keyof ExchangeRates;
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
    bgFrom: "rgba(59, 130, 246, 0.08)",
    bgBorder: "rgba(59, 130, 246, 0.15)",
  },
  {
    code: "COP",
    name: "Peso Colombiano",
    symbol: "$",
    color: "yellow",
    bgFrom: "rgba(245, 158, 11, 0.08)",
    bgBorder: "rgba(245, 158, 11, 0.15)",
  },
];

export function FinancePage() {
  const { rates, lastUpdated, setAllRates } = useExchangeRatesStore();

  // Local editing state (so we only commit to store on save)
  const [editRates, setEditRates] = useState<ExchangeRates>({ ...rates });
  const [showSaved, setShowSaved] = useState(false);

  const hasChanges = editRates.VES !== rates.VES || editRates.COP !== rates.COP;

  const formattedLastUpdated = new Date(lastUpdated).toLocaleString("es-VE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleSaveRates = () => {
    setAllRates(editRates);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2500);
    // TODO: API call to persist rates
  };

  const handleResetRates = () => {
    setEditRates({ ...rates });
  };

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group gap="xs">
        <IconWallet size={24} color="#22C55E" />
        <Title order={2} c="gray.1">
          Gestión Financiera
        </Title>
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
              height: "100%",
            }}
          >
            <Group justify="space-between" mb="lg">
              <Group gap="xs">
                <IconArrowsExchange size={18} color="#3B82F6" />
                <Text size="sm" fw={600} c="gray.1">
                  Multimoneda & Tasas
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
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.15)",
                }}
              >
                <Group justify="space-between">
                  <div>
                    <Badge variant="light" color="brand" size="sm" mb={4}>
                      USD
                    </Badge>
                    <Text size="xs" c="dimmed">
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
                      editRates[r.code] !== rates[r.code]
                        ? "0 0 0 2px rgba(59,130,246,0.3)"
                        : "none",
                  }}
                >
                  <Group justify="space-between">
                    <div>
                      <Group gap={6} mb={4}>
                        <Badge variant="light" color={r.color} size="sm">
                          {r.code}
                        </Badge>
                        {editRates[r.code] !== rates[r.code] && (
                          <Badge variant="outline" color="blue" size="xs">
                            Modificado
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {r.name}
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        1 USD = {r.symbol}{" "}
                        {editRates[r.code]?.toLocaleString("es-VE", {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    </div>
                    <NumberInput
                      value={editRates[r.code]}
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
                          color: "#F8FAFC",
                          textAlign: "right",
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "var(--mantine-radius-sm)",
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
              title="Ingresos del Día"
              value="$1,245.50"
              icon={<IconCurrencyDollar size={20} />}
              accentColor="#22C55E"
            />
            <StatCard
              title="Egresos Totales"
              value="-$210.00"
              icon={<IconTrendingDown size={20} />}
              accentColor="#EF4444"
              subtitle="Promedio de gasto operativo"
            />
            <StatCard
              title="Balance Neto"
              value="$1,035.50"
              icon={<IconTrendingUp size={20} />}
              accentColor="#3B82F6"
            />
            <StatCard
              title="Tickets Cobrados"
              value="18"
              icon={<IconReceipt size={20} />}
              accentColor="#8B5CF6"
              subtitle="Avg. $69.20 p/ ticket"
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
          VES: Bs. {rates.VES?.toFixed(2)} — COP: ${rates.COP?.toFixed(2)}
        </Notification>
      )}

      {/* Payments Table */}
      <PaymentsTable />

      {/* Arqueo de Caja */}
      <Paper
        p="lg"
        radius="lg"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <Group justify="space-between" mb="md">
          <Group gap="xs">
            <IconCash size={20} color="#8B5CF6" />
            <Text size="sm" fw={600} c="gray.1">
              Arqueo de Caja & Conciliación
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

        <Divider color="dark.6" mb="md" />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
              Fondo USD
            </Text>
            <Text ff="monospace" fw={700} size="xl" c="brand.6">
              $420.00
            </Text>
          </Box>
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
              Fondo VES
            </Text>
            <Text ff="monospace" fw={700} size="xl" c="blue.5">
              Bs. 8,450.00
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              ≈ ${(8450 / rates.VES).toFixed(2)} USD
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
