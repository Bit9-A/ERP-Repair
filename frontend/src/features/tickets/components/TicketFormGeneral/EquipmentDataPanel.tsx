import {
  Accordion,
  Stack,
  TextInput,
  Select,
  SimpleGrid,
  Text,
  Button,
  Loader,
  Popover,
  Paper,
} from "@mantine/core";
import { IconFingerprint, IconPlus } from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import { PatternCanvas } from "../PatternCanvas";

interface EquipmentDataPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  initialData?: any;
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
    createMarca: any; // UseMutationResult
    createModelo: any; // UseMutationResult
  };
}

export function EquipmentDataPanel({
  form,
  initialData,
  state,
  queries,
  actions,
}: EquipmentDataPanelProps) {
  const {
    selectedMarcaId,
    marcaSearch,
    setMarcaSearch,
    modeloSearch,
    setModeloSearch,
  } = state;
  const { loadingMarcas, loadingModelos, marcaOptions, modeloOptions } =
    queries;
  const {
    handleMarcaChange,
    handleCreateMarcaInline,
    handleCreateModeloInline,
    createMarca,
    createModelo,
  } = actions;

  return (
    <Accordion.Item value="equipo">
      <Accordion.Control>
        <Text fw={600}>3. Información del Equipo</Text>
      </Accordion.Control>
      <Accordion.Panel>
        <Stack gap="sm">
          <Paper
            p="md"
            withBorder
            styles={{
              root: {
                backgroundColor: 'var(--bg-elevated)',
                borderColor: 'var(--border-subtle)',
              }
            }}
          >
            <SimpleGrid cols={{ base: 1, sm: 3 }}>
              <Select
                label="Tipo de Equipo"
                aria-label="Seleccionar tipo de equipo a reparar"
                data={[
                  { value: "Smartphone", label: "Smartphone" },
                  { value: "Tablet", label: "Tablet" },
                  { value: "Laptop", label: "Laptop" },
                  { value: "Otro", label: "Otro" },
                ]}
                {...form.getInputProps("tipo_equipo")}
              />

              {/* ── MARCA select with inline create ── */}
              <Select
                label="Marca"
                aria-label="Seleccionar o buscar marca"
                placeholder="Buscar marca..."
                data={marcaOptions}
                value={form.values.marca || null}
                onChange={handleMarcaChange}
                error={form.errors.marca}
                searchable
                onSearchChange={setMarcaSearch}
                rightSection={loadingMarcas ? <Loader size={14} aria-label="Cargando marcas" /> : undefined}
                nothingFoundMessage={
                  marcaSearch.trim() ? (
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      leftSection={<IconPlus size={14} aria-hidden="true" />}
                      fullWidth
                      onClick={handleCreateMarcaInline}
                      loading={createMarca.isPending}
                    >
                      Crear &quot;{marcaSearch.trim()}&quot;
                    </Button>
                  ) : (
                    "Escribe para buscar"
                  )
                }
              />

              {/* ── MODELO select with inline create ── */}
              <Select
                label="Modelo"
                aria-label="Seleccionar o buscar modelo"
                placeholder={
                  selectedMarcaId
                    ? "Buscar modelo..."
                    : "Selecciona marca primero"
                }
                data={modeloOptions}
                value={form.values.modelo || null}
                onChange={(v) => form.setFieldValue("modelo", v || "")}
                error={form.errors.modelo}
                searchable
                onSearchChange={setModeloSearch}
                disabled={!form.values.marca}
                rightSection={loadingModelos ? <Loader size={14} aria-label="Cargando modelos" /> : undefined}
                nothingFoundMessage={
                  modeloSearch.trim() && selectedMarcaId ? (
                    <Button
                      variant="subtle"
                      size="compact-sm"
                      leftSection={<IconPlus size={14} aria-hidden="true" />}
                      fullWidth
                      onClick={handleCreateModeloInline}
                      loading={createModelo.isPending}
                    >
                      Crear &quot;{modeloSearch.trim()}&quot;
                    </Button>
                  ) : (
                    "Escribe para buscar"
                  )
                }
              />
            </SimpleGrid>
          </Paper>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label="IMEI"
              placeholder="15 dígitos"
              {...form.getInputProps("imei")}
            />
            <TextInput
              label="Clave/PIN"
              placeholder="1234"
              {...form.getInputProps("clave")}
            />
          </SimpleGrid>

          <Popover width={300} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <TextInput
                label="Patrón Visual"
                placeholder="Click para dibujar"
                readOnly
                leftSection={<IconFingerprint size={16} />}
                style={{ cursor: "pointer" }}
                {...form.getInputProps("patron_visual")}
              />
            </Popover.Target>
            <Popover.Dropdown bg="gray.9">
              <Text size="xs" fw={700} mb="xs" c="white" ta="center">
                {initialData
                  ? "PATRÓN GUARDADO (ANIMACIÓN)"
                  : "DIBUJA EL PATRÓN EN LOS PUNTOS"}
              </Text>
              <PatternCanvas
                mode={initialData ? "view" : "draw"}
                value={form.values.patron_visual || ""}
                onPatternComplete={(pattern) =>
                  form.setFieldValue("patron_visual", pattern)
                }
                aria-label="Dibujo de Patrón de desbloqueo"
              />
            </Popover.Dropdown>
          </Popover>
        </Stack>
      </Accordion.Panel>
    </Accordion.Item>
  );
}
