import {
  Stack,
  TextInput,
  Select,
  SimpleGrid,
  Text,
  Button,
  Loader,
  Paper,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import {
  IconPlus,
  IconDeviceMobile,
  IconDeviceTablet,
  IconDeviceLaptop,
  IconDeviceTv,
  IconDeviceGamepad2,
  IconDeviceDesktop,
  IconDeviceWatch,
  IconDevices,
  IconBarcode,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";

interface Step2EquipmentPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  state: {
    selectedMarcaId: string | null;
    marcaSearch: string;
    setMarcaSearch: (val: string) => void;
    modeloSearch: string;
    setModeloSearch: (val: string) => void;
  };
  queries: {
    loadingMarcas: boolean;
    loadingModelos: boolean;
    marcaOptions: { value: string; label: string }[];
    modeloOptions: { value: string; label: string }[];
  };
  actions: {
    handleMarcaChange: (value: string | null) => void;
    handleCreateMarcaInline: () => Promise<void>;
    handleCreateModeloInline: () => Promise<void>;
    createMarca: any;
    createModelo: any;
  };
}

const DEVICE_TYPES = [
  { value: "Smartphone", label: "Smartphone", icon: IconDeviceMobile, color: "blue" },
  { value: "Tablet", label: "Tablet", icon: IconDeviceTablet, color: "teal" },
  { value: "Laptop", label: "Laptop", icon: IconDeviceLaptop, color: "indigo" },
  { value: "TV", label: "TV / Monitor", icon: IconDeviceTv, color: "orange" },
  { value: "Consola", label: "Consola", icon: IconDeviceGamepad2, color: "violet" },
  { value: "PC", label: "PC Escritorio", icon: IconDeviceDesktop, color: "cyan" },
  { value: "Smartwatch", label: "Smartwatch", icon: IconDeviceWatch, color: "pink" },
  { value: "Otro", label: "Otro Dispositivo", icon: IconDevices, color: "gray" },
];

export function Step2EquipmentPanel({
  form,
  state,
  queries,
  actions,
}: Step2EquipmentPanelProps) {
  const {
    selectedMarcaId,
    marcaSearch,
    setMarcaSearch,
    modeloSearch,
    setModeloSearch,
  } = state;
  const { loadingMarcas, loadingModelos, marcaOptions, modeloOptions } = queries;
  const {
    handleMarcaChange,
    handleCreateMarcaInline,
    handleCreateModeloInline,
    createMarca,
    createModelo,
  } = actions;

  const currentType = form.values.tipo_equipo || "Smartphone";

  return (
    <Stack gap="lg">
      {/* ── Selector de Tipo de Dispositivo (Chips Interactivos) ── */}
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="sm">
          <div>
            <Text fw={700} size="sm" className="font-heading">
              Tipo de Dispositivo
            </Text>
            <Text size="xs" c="dimmed">
              Selecciona la categoría del equipo a reparar
            </Text>
          </div>

          <SimpleGrid cols={{ base: 2, xs: 4, sm: 4 }} spacing="xs">
            {DEVICE_TYPES.map((dt) => {
              const Icon = dt.icon;
              const isSelected = currentType === dt.value;
              return (
                <UnstyledButton
                  key={dt.value}
                  onClick={() => form.setFieldValue("tipo_equipo", dt.value)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "8px",
                    border: isSelected
                      ? `2px solid var(--mantine-color-${dt.color}-filled)`
                      : "1px solid var(--border-subtle)",
                    backgroundColor: isSelected
                      ? `rgba(59, 130, 246, 0.08)`
                      : "var(--bg-elevated)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ThemeIcon
                    size="sm"
                    radius="sm"
                    color={isSelected ? dt.color : "gray"}
                    variant={isSelected ? "filled" : "light"}
                  >
                    <Icon size={14} />
                  </ThemeIcon>
                  <Text
                    size="xs"
                    fw={isSelected ? 700 : 500}
                    style={{
                      color: isSelected
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {dt.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        </Stack>
      </Paper>

      {/* ── Marca y Modelo con alta rápida inline ── */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="md">
          <div>
            <Text fw={700} size="sm" className="font-heading">
              Especificación del Hardware
            </Text>
            <Text size="xs" c="dimmed">
              Indica la marca, modelo y número de serie / IMEI
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {/* ── MARCA ── */}
            <Select
              label="Marca"
              placeholder="Buscar o escribir marca..."
              data={marcaOptions}
              value={form.values.marca || null}
              onChange={handleMarcaChange}
              error={form.errors.marca}
              searchable
              required
              onSearchChange={setMarcaSearch}
              rightSection={
                loadingMarcas ? (
                  <Loader size={14} aria-label="Cargando marcas" />
                ) : undefined
              }
              nothingFoundMessage={
                marcaSearch.trim() ? (
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    leftSection={<IconPlus size={14} />}
                    fullWidth
                    onClick={handleCreateMarcaInline}
                    loading={createMarca.isPending}
                  >
                    Crear marca &quot;{marcaSearch.trim()}&quot;
                  </Button>
                ) : (
                  "Escribe para buscar o crear"
                )
              }
            />

            {/* ── MODELO ── */}
            <Select
              label="Modelo"
              placeholder={
                selectedMarcaId
                  ? "Buscar modelo..."
                  : "Selecciona una marca primero"
              }
              data={modeloOptions}
              value={form.values.modelo || null}
              onChange={(v) => form.setFieldValue("modelo", v || "")}
              error={form.errors.modelo}
              searchable
              required
              onSearchChange={setModeloSearch}
              disabled={!form.values.marca}
              rightSection={
                loadingModelos ? (
                  <Loader size={14} aria-label="Cargando modelos" />
                ) : undefined
              }
              nothingFoundMessage={
                modeloSearch.trim() && selectedMarcaId ? (
                  <Button
                    variant="subtle"
                    size="compact-sm"
                    leftSection={<IconPlus size={14} />}
                    fullWidth
                    onClick={handleCreateModeloInline}
                    loading={createModelo.isPending}
                  >
                    Crear modelo &quot;{modeloSearch.trim()}&quot;
                  </Button>
                ) : (
                  "Escribe para buscar o crear"
                )
              }
            />
          </SimpleGrid>

          {/* ── IMEI / Serial ── */}
          <TextInput
            label="IMEI o Número de Serie"
            placeholder="15 dígitos de IMEI o N° Serie del fabricante (Opcional)"
            leftSection={<IconBarcode size={18} />}
            {...form.getInputProps("imei")}
            description="Recomendado para identificar inequívocamente el equipo del cliente"
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
