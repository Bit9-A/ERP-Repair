import { Group, TextInput, ActionIcon, Indicator } from "@mantine/core";
import { IconBell, IconPlus, IconSearch } from "@tabler/icons-react";

interface TopBarProps {
  onNewTicket?: () => void;
}

export function TopBar({ onNewTicket }: TopBarProps) {
  return (
    <Group h="100%" px="md" justify="space-between">
      {/* Search bar */}
      <TextInput
        placeholder="Buscar tickets, clientes, productos..."
        leftSection={<IconSearch size={16} />}
        w={{ base: 200, md: 350 }}
        size="sm"
        styles={{
          input: {
            background: "rgba(255, 255, 255, 0.04)",
            borderColor: "rgba(255, 255, 255, 0.06)",
          },
        }}
      />

      <Group gap="sm">
        <Indicator color="red" size={8} offset={4}>
          <ActionIcon variant="subtle" size="lg" radius="md" color="gray">
            <IconBell size={20} stroke={1.5} />
          </ActionIcon>
        </Indicator>

        <ActionIcon
          variant="filled"
          size="lg"
          radius="md"
          color="brand"
          onClick={onNewTicket}
        >
          <IconPlus size={18} />
        </ActionIcon>
      </Group>
    </Group>
  );
}
