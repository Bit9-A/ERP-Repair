import {
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Button,
  Divider,
} from "@mantine/core";
import { IconCash, IconReportMoney, IconReceipt } from "@tabler/icons-react";

export function CashClosure() {
  return (
    <Card
      padding="lg"
      radius="lg"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <Group justify="space-between" mb="md">
        <Group gap="xs">
          <IconCash size={20} color="#8B5CF6" />
          <Text size="sm" fw={600}>
            Cierre de Caja — Hoy
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

      <Divider color="dark.6" mb="md" />

      <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Efectivo
          </Text>
          <Text ff="monospace" fw={700} size="lg">
            $95.00
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Transferencias
          </Text>
          <Text ff="monospace" fw={700} size="lg">
            $63.00
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Punto de Venta
          </Text>
          <Text ff="monospace" fw={700} size="lg">
            $16.00
          </Text>
        </Stack>
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase">
            Pago Móvil
          </Text>
          <Text ff="monospace" fw={700} size="lg">
            $32.50
          </Text>
        </Stack>
      </SimpleGrid>

      <Divider color="dark.6" my="md" />

      <Group justify="space-between">
        <Group gap="xs">
          <IconReceipt size={16} color="#94A3B8" />
          <Text size="sm" c="dimmed">
            Total del Día
          </Text>
        </Group>
        <Text ff="monospace" fw={700} size="xl" c="brand.6">
          $206.50
        </Text>
      </Group>
    </Card>
  );
}
