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
} from "@tabler/icons-react";
import { StatCard } from "../../../components/ui/StatCard";
import { PaymentsTable } from "../components/PaymentsTable";

export function FinancePage() {
  return (
    <Stack gap="xl">
      {/* Header — matching Stitch "Gestión Financiera" */}
      <Group gap="xs">
        <IconWallet size={24} color="#22C55E" />
        <Title order={2} c="gray.1">
          Gestión Financiera
        </Title>
      </Group>

      {/* Two-column: Currency rates + KPIs — matching Stitch layout */}
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
            <Group gap="xs" mb="lg">
              <IconArrowsExchange size={18} color="#3B82F6" />
              <Text size="sm" fw={600} c="gray.1">
                Multimoneda & Tasas
              </Text>
            </Group>

            <Stack gap="md">
              {/* USD */}
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

              {/* VES */}
              <Paper
                p="sm"
                radius="md"
                style={{
                  background: "rgba(59, 130, 246, 0.08)",
                  border: "1px solid rgba(59, 130, 246, 0.15)",
                }}
              >
                <Group justify="space-between">
                  <div>
                    <Badge variant="light" color="blue" size="sm" mb={4}>
                      VES
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Bolívar Digital
                    </Text>
                  </div>
                  <NumberInput
                    value={40.5}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="Bs."
                    size="sm"
                    variant="unstyled"
                    styles={{
                      input: {
                        fontFamily: '"Fira Code", monospace',
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "#F8FAFC",
                        padding: 0,
                        textAlign: "right",
                      },
                    }}
                    readOnly
                  />
                </Group>
              </Paper>

              {/* COP */}
              <Paper
                p="sm"
                radius="md"
                style={{
                  background: "rgba(245, 158, 11, 0.08)",
                  border: "1px solid rgba(245, 158, 11, 0.15)",
                }}
              >
                <Group justify="space-between">
                  <div>
                    <Badge variant="light" color="yellow" size="sm" mb={4}>
                      COP
                    </Badge>
                    <Text size="xs" c="dimmed">
                      Peso Colombiano
                    </Text>
                  </div>
                  <NumberInput
                    value={4150}
                    decimalScale={2}
                    fixedDecimalScale
                    prefix="$"
                    size="sm"
                    variant="unstyled"
                    styles={{
                      input: {
                        fontFamily: '"Fira Code", monospace',
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "#F8FAFC",
                        padding: 0,
                        textAlign: "right",
                      },
                    }}
                    readOnly
                  />
                </Group>
              </Paper>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Right: 4 Financial KPIs — matching Stitch */}
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

      {/* Payments Table */}
      <PaymentsTable />

      {/* Arqueo de Caja — matching Stitch */}
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
