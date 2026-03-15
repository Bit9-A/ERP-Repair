import { Card, Group, NumberInput, Text, Stack, Badge } from "@mantine/core";
import { IconCurrencyDollar, IconArrowsExchange } from "@tabler/icons-react";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  symbol: string;
}

const DEMO_RATES: ExchangeRate[] = [
  { code: "COP", name: "Peso Colombiano", rate: 1.0, symbol: "COP" },
  { code: "USD", name: "Dólar Americano", rate: 0.00024, symbol: "$" },
  { code: "VES", name: "Bolívar Venezolano", rate: 0.0095, symbol: "Bs." },
];

export function ExchangeRates() {
  return (
    <Stack gap="md">
      <Group gap="xs" mb={4}>
        <IconArrowsExchange size={18} color="#3B82F6" />
        <Text size="sm" fw={600}>
          Tasas de Cambio
        </Text>
      </Group>

      <Group gap="md" grow>
        {DEMO_RATES.map((rate) => (
          <Card
            key={rate.code}
            padding="md"
            radius="lg"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderTop: `3px solid ${rate.code === "COP" ? "#22C55E" : rate.code === "USD" ? "#3B82F6" : "#F59E0B"}`,
            }}
          >
            <Group justify="space-between" mb="xs">
              <Badge
                variant="light"
                color={
                  rate.code === "COP"
                    ? "brand"
                    : rate.code === "USD"
                      ? "blue"
                      : "yellow"
                }
                size="sm"
              >
                {rate.code}
              </Badge>
              <IconCurrencyDollar size={16} color="#64748B" />
            </Group>
            <Text size="xs" c="dimmed" mb={4}>
              {rate.name}
            </Text>
            {rate.code === "COP" ? (
              <Text ff="monospace" size="lg" fw={700}>
                Moneda Base
              </Text>
            ) : (
              <NumberInput
                value={rate.rate}
                decimalScale={2}
                fixedDecimalScale
                prefix={rate.symbol}
                size="sm"
                variant="unstyled"
                styles={{
                  input: {
                    fontFamily: '"Fira Code", monospace',
                    fontWeight: 700,
                    fontSize: "18px",
                    padding: 0,
                  },
                }}
                readOnly
              />
            )}
          </Card>
        ))}
      </Group>
    </Stack>
  );
}
