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

const COLUMN_COLORS: Record<string, string> = {
  RECIBIDO: "#64748B",
  EN_REVISION: "#3B82F6",
  ESPERANDO_REPUESTO: "#F59E0B",
  REPARADO: "#22C55E",
  ENTREGADO: "#8B5CF6",
};

export function KanbanPreview({ counts = defaultCounts }: KanbanPreviewProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <Paper
      p="lg"
      radius="lg"
      style={{
        background: "#1E293B",
        border: "1px solid rgba(255, 255, 255, 0.06)",
      }}
    >
      <Group gap="xs" mb="md">
        <IconBinaryTree size={18} color="#22C55E" />
        <Text size="sm" fw={600} c="gray.1">
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
                  size="sm"
                  radius="xl"
                  style={{
                    backgroundColor: COLUMN_COLORS[col],
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
                color={COLUMN_COLORS[col]}
                styles={{
                  root: { backgroundColor: "rgba(255,255,255,0.04)" },
                }}
              />
            </div>
          );
        })}
      </Stack>
    </Paper>
  );
}
