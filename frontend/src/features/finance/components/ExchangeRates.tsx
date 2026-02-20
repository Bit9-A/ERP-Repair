import { Card, Group, NumberInput, Text, Stack, Badge } from "@mantine/core";
import { IconCurrencyDollar, IconArrowsExchange } from "@tabler/icons-react";

interface ExchangeRate {
  code: string;
  name: string;
  rate: number;
  symbol: string;
}

const DEMO_RATES: ExchangeRate[] = [
  { code: "USD", name: "Dólar Americano", rate: 1.0, symbol: "$" },
  { code: "VES", name: "Bolívar Venezolano", rate: 40.5, symbol: "Bs." },
  { code: "COP", name: "Peso Colombiano", rate: 4150.0, symbol: "$" },
];

export function ExchangeRates() {
  return (
    <Stack gap="md">
      <Group gap="xs" mb={4}>
        <IconArrowsExchange size={18} color="#3B82F6" />
        <Text size="sm" fw={600} c="gray.1">
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
              background: "#1E293B",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              borderTop: `3px solid ${rate.code === "USD" ? "#22C55E" : rate.code === "VES" ? "#3B82F6" : "#F59E0B"}`,
            }}
          >
            <Group justify="space-between" mb="xs">
              <Badge
                variant="light"
                color={
                  rate.code === "USD"
                    ? "brand"
                    : rate.code === "VES"
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
            {rate.code === "USD" ? (
              <Text ff="monospace" size="lg" fw={700} c="gray.1">
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
                    color: "#F8FAFC",
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
