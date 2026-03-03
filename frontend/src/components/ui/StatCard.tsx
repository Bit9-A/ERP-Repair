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
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)",
        borderTop: `3px solid ${accentColor}`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      className="stat-card"
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" c="dimmed" mb={4}>
            {title}
          </Text>
          <Text size="xl" fw={700} ff="monospace">
            {value}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={4}>
              {subtitle}
            </Text>
          )}
        </div>
        <ThemeIcon
          size="xl"
          radius="md"
          variant="light"
          color={accentColor}
          style={{
            background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          }}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Card>
  );
}
