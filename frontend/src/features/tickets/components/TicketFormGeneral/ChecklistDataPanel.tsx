import {
  Accordion,
  Stack,
  Textarea,
  Checkbox,
  SimpleGrid,
  Text,
  Paper,
  Divider,
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
        <Text fw={600}>4. Estado al Recibir (Checklist)</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="md" aria-label="Sección de Checklist del Equipo">
          <Paper
            p="md"
            withBorder
            styles={{
              root: {
                backgroundColor: 'var(--mantine-color-body)',
                borderColor: 'var(--mantine-color-default-border)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                transition: 'border-color 200ms ease'
              }
            }}
          >
            <Stack gap="sm">
              <Text size="sm" fw={700} c="var(--mantine-color-text)" tt="uppercase" lts={1}>
                Verificación de Componentes
              </Text>
              <Divider mb="xs" color="var(--mantine-color-default-border)" />
              <SimpleGrid
                cols={{ base: 2, sm: 3, md: 4, xl: 5 }}
                spacing="md"
                verticalSpacing="xs"
              >
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Cámaras (Frontal/Trasera)" {...form.getInputProps("checklist.camaras", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Touch / Digitalizador" {...form.getInputProps("checklist.touch", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Señal / Antenas" {...form.getInputProps("checklist.senal", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Enciende (Power/Boot)" {...form.getInputProps("checklist.encendido", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Botones (Vol/Power)" {...form.getInputProps("checklist.botones", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Batería (Estado/Carga)" {...form.getInputProps("checklist.bateria", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Riesgos Explicados" {...form.getInputProps("checklist.riesgos_explicados", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Carcasa Rota / Tapa" {...form.getInputProps("checklist.carcasa_rota", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="SIM Card" {...form.getInputProps("checklist.accesorios_sim_sd", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Forro / Funda" {...form.getInputProps("checklist.funda", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Uso Diario (Desgaste)" {...form.getInputProps("checklist.uso_diario_desgaste", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Biometría (FaceID/Huella)" {...form.getInputProps("checklist.biometria", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Audio (Altavoz/Auri)" {...form.getInputProps("checklist.audio", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Sensor de Proximidad" {...form.getInputProps("checklist.sensor_proximidad", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Puerto de Carga" {...form.getInputProps("checklist.puerto_carga", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Wi-Fi / Bluetooth" {...form.getInputProps("checklist.conectividad_wifi_bt", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Flash / Linterna" {...form.getInputProps("checklist.flash_linterna", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Pantalla (Fallas Internas)" {...form.getInputProps("checklist.pantalla_fallas_internas", { type: "checkbox" })} />
                <Checkbox styles={{ label: { fontWeight: 500 } }} label="Tornillería Faltante" {...form.getInputProps("checklist.tornilleria_faltante", { type: "checkbox" })} />
              </SimpleGrid>
            </Stack>
          </Paper>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Textarea
              label="Falla Reportada"
              placeholder="Descripción de la falla reportada por el cliente"
              required
              aria-required="true"
              {...form.getInputProps("falla")}
              minRows={3}
            />
            <Textarea
              label="Observaciones"
              placeholder="Observaciones adicionales sobre el equipo en caso de daños específicos"
              {...form.getInputProps("observaciones")}
              minRows={3}
            />
          </SimpleGrid>


        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
