import {
  Accordion,
  Stack,
  Textarea,
  Checkbox,
  SimpleGrid,
  Text,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";

interface ChecklistDataPanelProps {
  form: UseFormReturnType<TicketFormValues>;
}

export function ChecklistDataPanel({ form }: ChecklistDataPanelProps) {
  return (
    <Accordion.Item value="estado">
      <Accordion.Control>
        <Text fw={600}>3. Estado al Recibir (Checklist)</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <SimpleGrid cols={{ base: 2, sm: 3, md: 5 }}>
            <Checkbox
              label="Cámaras"
              {...form.getInputProps("checklist.camaras", { type: "checkbox" })}
            />
            <Checkbox
              label="Touch"
              {...form.getInputProps("checklist.touch", { type: "checkbox" })}
            />
            <Checkbox
              label="Señal"
              {...form.getInputProps("checklist.senal", { type: "checkbox" })}
            />
            <Checkbox
              label="Enciende"
              {...form.getInputProps("checklist.encendido", {
                type: "checkbox",
              })}
            />
            <Checkbox
              label="Botones"
              {...form.getInputProps("checklist.botones", { type: "checkbox" })}
            />
          </SimpleGrid>
          <Textarea
            label="Falla Reportada"
            required
            {...form.getInputProps("falla")}
          />
          <Textarea
            label="Observaciones"
            {...form.getInputProps("observaciones")}
          />
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
