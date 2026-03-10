import {
  Accordion,
  Stack,
  Textarea,
  Checkbox,
  SimpleGrid,
  Text,
  Alert,
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
        <style dangerouslySetInnerHTML={{
          __html: `
          /* MEJORA DE CONTRASTE: CHECKLIST */
          [data-mantine-color-scheme="light"] .checklist-section-premium .mantine-Checkbox-label {
            color: #000000 !important;
          }
          [data-mantine-color-scheme="dark"] .checklist-section-premium .mantine-Checkbox-label {
            color: #ffffff !important;
          }
          
          /* MEJORA DE CONTRASTE: CLÁUSULA (ALERTA) */
          [data-mantine-color-scheme="light"] .clausula-alert-premium,
          [data-mantine-color-scheme="light"] .clausula-alert-premium .mantine-Alert-title,
          [data-mantine-color-scheme="light"] .clausula-alert-premium .mantine-Alert-message,
          [data-mantine-color-scheme="light"] .clausula-alert-premium .mantine-Text-root,
          [data-mantine-color-scheme="light"] .clausula-alert-premium b {
            color: #000000 !important;
          }

          [data-mantine-color-scheme="dark"] .clausula-alert-premium,
          [data-mantine-color-scheme="dark"] .clausula-alert-premium .mantine-Alert-title,
          [data-mantine-color-scheme="dark"] .clausula-alert-premium .mantine-Alert-message,
          [data-mantine-color-scheme="dark"] .clausula-alert-premium .mantine-Text-root,
          [data-mantine-color-scheme="dark"] .clausula-alert-premium b {
            color: #ffffff !important;
          }
        `}} />
        <Stack gap="md" className="checklist-section-premium">
          <Paper
            p="md"
            withBorder
            bg="var(--mantine-color-default)"
            style={{
              borderColor: "var(--mantine-color-default-hover)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
            }}
          >
            <Stack gap="sm">
              <Text size="sm" fw={600} c="dimmed" tt="uppercase" lts={1}>
                Verificación de Componentes
              </Text>
              <Divider mb="xs" opacity={0.5} />
              <SimpleGrid
                cols={{ base: 2, sm: 3, md: 4, xl: 5 }}
                spacing="md"
                verticalSpacing="xs"
              >
                <Checkbox label="Cámaras (Frontal/Trasera)" {...form.getInputProps("checklist.camaras", { type: "checkbox" })} />
                <Checkbox label="Touch / Digitalizador" {...form.getInputProps("checklist.touch", { type: "checkbox" })} />
                <Checkbox label="Señal / Antenas" {...form.getInputProps("checklist.senal", { type: "checkbox" })} />
                <Checkbox label="Enciende (Power/Boot)" {...form.getInputProps("checklist.encendido", { type: "checkbox" })} />
                <Checkbox label="Botones (Vol/Power)" {...form.getInputProps("checklist.botones", { type: "checkbox" })} />
                <Checkbox label="Batería (Estado/Carga)" {...form.getInputProps("checklist.bateria", { type: "checkbox" })} />
                <Checkbox label="Riesgos Explicados" {...form.getInputProps("checklist.riesgos_explicados", { type: "checkbox" })} />
                <Checkbox label="Carcasa Rota / Tapa" {...form.getInputProps("checklist.carcasa_rota", { type: "checkbox" })} />
                <Checkbox label="SIM Card" {...form.getInputProps("checklist.accesorios_sim_sd", { type: "checkbox" })} />
                <Checkbox label="Forro / Funda" {...form.getInputProps("checklist.funda", { type: "checkbox" })} />
                <Checkbox label="Uso Diario (Desgaste)" {...form.getInputProps("checklist.uso_diario_desgaste", { type: "checkbox" })} />
                <Checkbox label="Biometría (FaceID/Huella)" {...form.getInputProps("checklist.biometria", { type: "checkbox" })} />
                <Checkbox label="Audio (Altavoz/Auri)" {...form.getInputProps("checklist.audio", { type: "checkbox" })} />
                <Checkbox label="Sensor de Proximidad" {...form.getInputProps("checklist.sensor_proximidad", { type: "checkbox" })} />
                <Checkbox label="Puerto de Carga" {...form.getInputProps("checklist.puerto_carga", { type: "checkbox" })} />
                <Checkbox label="Wi-Fi / Bluetooth" {...form.getInputProps("checklist.conectividad_wifi_bt", { type: "checkbox" })} />
                <Checkbox label="Flash / Linterna" {...form.getInputProps("checklist.flash_linterna", { type: "checkbox" })} />
                <Checkbox label="Pantalla (Fallas Internas)" {...form.getInputProps("checklist.pantalla_fallas_internas", { type: "checkbox" })} />
                <Checkbox label="Tornillería Faltante" {...form.getInputProps("checklist.tornilleria_faltante", { type: "checkbox" })} />
              </SimpleGrid>
            </Stack>
          </Paper>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Textarea
              label="Falla Reportada"
              placeholder="Descripción de la falla reportada por el cliente"
              required
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
