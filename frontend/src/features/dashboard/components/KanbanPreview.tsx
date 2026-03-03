import { Badge, Group, Paper, Stack, Text, Progress } from "@mantine/core";
import { IconBinaryTree } from "@tabler/icons-react";
import { TICKET_STATUS, KANBAN_COLUMNS } from "../../../lib/constants";

interface KanbanPreviewProps {
  counts: Record<string, number>;
}

const defaultCounts: Record<string, number> = {
  RECIBIDO: 5,
  EN_REVISION: 8,
  ESPERANDO_REPUESTO: 4,
  REPARADO: 5,
  ENTREGADO: 2,
};

// Utilizaremos directamente TICKET_STATUS[col].color en lugar de código hexadecimales
// para que Mantine aplique correctamente las clases de light/dark modes.

export function KanbanPreview({ counts = defaultCounts }: KanbanPreviewProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
      }}
    >
      <Group gap="xs" mb="md">
        <IconBinaryTree size={18} color="#22C55E" />
        <Text size="sm" fw={600}>
          Workflow Status
        </Text>
      </Group>

      <Stack gap="sm">
        {KANBAN_COLUMNS.map((col) => {
          const status = TICKET_STATUS[col];
          const count = counts[col] ?? 0;
          const pct = (count / total) * 100;

          return (
            <div key={col}>
              <Group justify="space-between" mb={4}>
                <Text size="xs" c="dimmed">
                  {status.label}
                </Text>
                <Badge
                  variant="filled"
                  color={status.color}
                  size="sm"
                  radius="xl"
                  style={{
                    minWidth: 28,
                    textAlign: "center",
                  }}
                >
                  {count}
                </Badge>
              </Group>
              <Progress
                value={pct}
                size="sm"
                radius="xl"
                color={status.color}
                styles={{
                  root: { backgroundColor: "var(--border-subtle)" },
                }}
              />
            </div>
          );
        })}
      </Stack>
    </Paper>
  );
}
