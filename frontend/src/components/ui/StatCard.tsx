import { Card, Group, Text, ThemeIcon } from "@mantine/core";
import { type ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  accentColor: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  accentColor,
  subtitle,
}: StatCardProps) {
  return (
    <Card
      padding="lg"
      radius="lg"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        borderLeft: `3px solid ${accentColor}`,
        transition: "all 200ms ease",
        cursor: "pointer",
      }}
      className="stat-card"
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" mb={4}>
            {title}
          </Text>
          <Text size="xl" fw={700} ff="monospace" c="gray.1">
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </div>
        <ThemeIcon size="lg" radius="md" variant="light" color={accentColor}>
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
