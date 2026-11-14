import { useState, useMemo } from "react";
import {
  Stack,
  TextInput,
  SimpleGrid,
  Text,
  Button,
  Paper,
  ThemeIcon,
  UnstyledButton,
  ActionIcon,
  Tooltip,
  Group,
  Badge,
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
  IconDeviceSpeaker,
  IconDevices,
  IconBarcode,
  IconScan,
  IconArrowRight,
  IconCheck,
  IconSearch,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconSparkles,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import { BarcodeScanner } from "../../../sales/components/BarcodeScanner";
import {
  getBrandsForCategory,
  POPULAR_MODELS_BY_BRAND,
} from "../../data/deviceCatalog";

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
  onProceedNext?: () => void;
}

const CATEGORY_ITEMS = [
  { id: "Smartphone", label: "Smartphone", icon: IconDeviceMobile, color: "blue" },
  { id: "Tablet", label: "Tablet", icon: IconDeviceTablet, color: "teal" },
  { id: "Laptop", label: "Laptop", icon: IconDeviceLaptop, color: "indigo" },
  { id: "TV", label: "TV / Monitor", icon: IconDeviceTv, color: "orange" },
  { id: "Consola", label: "Consola", icon: IconDeviceGamepad2, color: "violet" },
  { id: "PC", label: "PC Escritorio", icon: IconDeviceDesktop, color: "cyan" },
  { id: "Smartwatch", label: "Smartwatch", icon: IconDeviceWatch, color: "pink" },
  { id: "Audio", label: "Corneta / Audio", icon: IconDeviceSpeaker, color: "yellow" },
  { id: "Otro", label: "Otro Dispositivo", icon: IconDevices, color: "gray" },
];

export function Step2EquipmentPanel({
  form,
  state,
  queries,
  actions,
  onProceedNext,
}: Step2EquipmentPanelProps) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [expandAllBrands, setExpandAllBrands] = useState(false);
  const [expandAllModels, setExpandAllModels] = useState(false);

  const {
    selectedMarcaId,
    marcaSearch,
    setMarcaSearch,
    modeloSearch,
    setModeloSearch,
  } = state;
  const { marcaOptions, modeloOptions } = queries;
  const {
    handleMarcaChange,
    handleCreateMarcaInline,
    handleCreateModeloInline,
    createMarca,
    createModelo,
  } = actions;

  const currentType = form.values.tipo_equipo || "Smartphone";

  // Identificar si la categoría actual es una de las predefinidas o un dispositivo personalizado
  const isCustomType = !CATEGORY_ITEMS.some((c) => c.id === currentType && c.id !== "Otro");
  const activeCategoryId = isCustomType ? "Otro" : currentType;

  // Catálogo inteligente de marcas para la categoría seleccionada
  const { popular: popularBrands, all: allCategoryBrands } = useMemo(() => {
    // Convertir marcaOptions a formato de marcas
    const dbBrands = marcaOptions.map((o) => ({ nombre: o.value }));
    return getBrandsForCategory(activeCategoryId, dbBrands);
  }, [activeCategoryId, marcaOptions]);

  // Marcas filtradas por el término de búsqueda
  const filteredBrands = useMemo(() => {
    const query = marcaSearch.trim().toUpperCase();
    if (!query) return allCategoryBrands;
    return allCategoryBrands.filter((b) => b.toUpperCase().includes(query));
  }, [allCategoryBrands, marcaSearch]);

  // Modelos sugeridos para la marca seleccionada
  const brandUpper = (form.values.marca || "").trim().toUpperCase();
  const suggestedModels = useMemo(() => {
    if (!brandUpper) return [];
    const presets = POPULAR_MODELS_BY_BRAND[brandUpper] || [];
    const fromDb = modeloOptions.map((m) => m.value);
    const set = new Set([...presets, ...fromDb]);
    return Array.from(set);
  }, [brandUpper, modeloOptions]);

  const filteredModels = useMemo(() => {
    const query = modeloSearch.trim().toUpperCase();
    if (!query) return suggestedModels;
    return suggestedModels.filter((m) => m.toUpperCase().includes(query));
  }, [suggestedModels, modeloSearch]);

  const handleSelectCategory = (catId: string) => {
    if (catId === "Otro") {
      form.setFieldValue("tipo_equipo", "Otro: Dispositivo Personalizado");
    } else {
      form.setFieldValue("tipo_equipo", catId);
    }
    // Si la marca actual no concuerda con la nueva categoría, permitir que el usuario elija una limpia
    setMarcaSearch("");
    setModeloSearch("");
  };

  const handleSelectBrand = (brandName: string) => {
    handleMarcaChange(brandName);
    setMarcaSearch("");
    setExpandAllBrands(false);
  };

  const handleSelectModel = (modelName: string) => {
    form.setFieldValue("modelo", modelName);
    setModeloSearch("");
    setExpandAllModels(false);
  };

  return (
    <Stack gap="lg">
      {/* ── 1. Selector de Tipo de Dispositivo (Chips Interactivos) ── */}
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
          <div className="flex items-center justify-between">
            <div>
              <Text fw={700} size="sm" className="font-heading">
                Categoría del Dispositivo
              </Text>
              <Text size="xs" c="dimmed">
                Selecciona la categoría del equipo para filtrar marcas y modelos correspondientes
              </Text>
            </div>
            <Badge variant="outline" color="blue" size="sm" className="font-sirac-title uppercase font-bold">
              {activeCategoryId}
            </Badge>
          </div>

          <SimpleGrid cols={{ base: 2, xs: 3, sm: 5 }} spacing="xs">
            {CATEGORY_ITEMS.map((dt) => {
              const Icon = dt.icon;
              const isSelected = activeCategoryId === dt.id;
              return (
                <UnstyledButton
                  key={dt.id}
                  onClick={() => handleSelectCategory(dt.id)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: "10px",
                    border: isSelected
                      ? `2px solid var(--mantine-color-${dt.color}-filled)`
                      : "1px solid var(--border-subtle)",
                    backgroundColor: isSelected
                      ? `rgba(59, 130, 246, 0.12)`
                      : "var(--bg-elevated)",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  className="cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                >
                  <ThemeIcon
                    size="md"
                    radius="md"
                    color={isSelected ? dt.color : "gray"}
                    variant={isSelected ? "filled" : "light"}
                  >
                    <Icon size={16} strokeWidth={2.2} />
                  </ThemeIcon>
                  <Text
                    size="xs"
                    fw={isSelected ? 800 : 600}
                    style={{
                      color: isSelected
                        ? "var(--text-primary)"
                        : "var(--text-secondary)",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    className="font-sirac-title"
                  >
                    {dt.label}
                  </Text>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>

          {/* Campo de especificación personalizada si seleccionó 'Otro' */}
          {activeCategoryId === "Otro" && (
            <Paper
              p="xs"
              radius="md"
              className="mt-1 border border-dashed border-amber-300 dark:border-amber-600/50 bg-amber-50/50 dark:bg-amber-950/20"
            >
              <TextInput
                label="Especificar Tipo de Dispositivo *"
                description="Describe el tipo de equipo recibido (ej: Corneta Bluetooth, Impresora 3D, Dron, Micrófono, Amplificador...)"
                placeholder="Ej: Corneta Bluetooth JBL / Impresora EPSON / Dron DJI"
                size="xs"
                value={form.values.tipo_equipo}
                onChange={(e) => form.setFieldValue("tipo_equipo", e.currentTarget.value)}
                required
                className="font-sirac-title text-xs"
              />
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* ── 2. Especificación de Hardware: Marca y Modelo (Estilo SIRAC Contenido) ── */}
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
          <div className="flex items-center justify-between">
            <div>
              <Text fw={700} size="sm" className="font-heading">
                Especificación del Hardware
              </Text>
              <Text size="xs" c="dimmed">
                Marcas y modelos agrupados por <span className="font-bold text-blue-500">{activeCategoryId}</span> para evitar mezclas erróneas
              </Text>
            </div>
            {form.values.marca && (
              <Badge
                variant="filled"
                color="blue"
                size="md"
                className="font-sirac-title font-bold uppercase"
                rightSection={
                  <ActionIcon
                    size="xs"
                    color="blue"
                    radius="xl"
                    variant="transparent"
                    onClick={() => {
                      handleMarcaChange("");
                      form.setFieldValue("modelo", "");
                    }}
                    aria-label="Quitar marca"
                  >
                    <IconX size={12} className="text-white" />
                  </ActionIcon>
                }
              >
                {form.values.marca} {form.values.modelo ? `• ${form.values.modelo}` : ""}
              </Badge>
            )}
          </div>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* ── SELECCIÓN DE MARCA (Contenida sin desbordar el modal) ── */}
            <div className="border border-slate-200 dark:border-[#1e324f] rounded-2xl p-3 bg-slate-50/70 dark:bg-[#131f33]/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5">
                  <IconSparkles size={14} className="text-amber-500" />
                  <span>Marca *</span>
                </label>
                {form.values.marca && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Seleccionada
                  </span>
                )}
              </div>

              {/* Accesos directos de marcas populares para la categoría actual */}
              <div>
                <Text size="10px" fw={700} c="dimmed" tt="uppercase" lts={0.5} mb={4}>
                  Frecuentes en {activeCategoryId}:
                </Text>
                <div className="flex flex-wrap gap-1.5">
                  {popularBrands.map((bName) => {
                    const isSelected = form.values.marca.toUpperCase() === bName.toUpperCase();
                    return (
                      <button
                        key={bName}
                        type="button"
                        onClick={() => handleSelectBrand(bName)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 font-sirac-title ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-blue-400"
                        }`}
                      >
                        {isSelected && <IconCheck size={12} strokeWidth={3} />}
                        <span>{bName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Búsqueda y Catálogo Desplegable Contenido (Estilo SIRAC Acordeón) */}
              <div className="pt-1">
                <TextInput
                  placeholder="Buscar o escribir otra marca..."
                  leftSection={<IconSearch size={14} />}
                  size="xs"
                  value={marcaSearch}
                  onChange={(e) => {
                    setMarcaSearch(e.currentTarget.value);
                    if (!expandAllBrands) setExpandAllBrands(true);
                  }}
                  onFocus={() => setExpandAllBrands(true)}
                  rightSection={
                    marcaSearch ? (
                      <ActionIcon size="xs" variant="subtle" onClick={() => setMarcaSearch("")}>
                        <IconX size={12} />
                      </ActionIcon>
                    ) : undefined
                  }
                  className="font-sirac-title text-xs"
                />

                {/* Botón para expandir / contraer el panel de marcas */}
                <button
                  type="button"
                  onClick={() => setExpandAllBrands(!expandAllBrands)}
                  className="w-full mt-1 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-blue-500 transition-colors cursor-pointer"
                >
                  <span>
                    {expandAllBrands ? "Ocultar catálogo" : `Ver todas las marcas de ${activeCategoryId} (${allCategoryBrands.length})`}
                  </span>
                  {expandAllBrands ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </button>

                {/* Panel Bounded / Contenido: nunca desborda el modal */}
                {expandAllBrands && (
                  <div className="mt-1.5 p-2 bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1e324f] rounded-xl max-h-44 overflow-y-auto space-y-1.5">
                    {filteredBrands.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {filteredBrands.map((bName) => {
                          const isSelected = form.values.marca.toUpperCase() === bName.toUpperCase();
                          return (
                            <button
                              key={bName}
                              type="button"
                              onClick={() => handleSelectBrand(bName)}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                                isSelected
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-blue-400"
                              }`}
                            >
                              {bName}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-2 space-y-2">
                        <Text size="xs" c="dimmed">
                          No existe la marca &quot;{marcaSearch}&quot; en el catálogo
                        </Text>
                        <Button
                          variant="light"
                          color="blue"
                          size="compact-xs"
                          leftSection={<IconPlus size={14} />}
                          onClick={handleCreateMarcaInline}
                          loading={createMarca.isPending}
                          className="font-sirac-title text-xs font-bold"
                        >
                          Crear y registrar marca &quot;{marcaSearch.toUpperCase()}&quot;
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── SELECCIÓN DE MODELO (Contenida sin desbordar el modal) ── */}
            <div className="border border-slate-200 dark:border-[#1e324f] rounded-2xl p-3 bg-slate-50/70 dark:bg-[#131f33]/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5">
                  <IconSparkles size={14} className="text-blue-500" />
                  <span>Modelo *</span>
                </label>
                {form.values.modelo && (
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Definido
                  </span>
                )}
              </div>

              {/* Si no hay marca seleccionada */}
              {!form.values.marca ? (
                <div className="py-6 px-3 text-center border border-dashed border-slate-200 dark:border-[#243f5d] rounded-xl bg-white/50 dark:bg-[#0b1320]/50">
                  <Text size="xs" c="dimmed" fw={600} className="font-sirac-title">
                    Selecciona una marca primero para ver o definir sus modelos
                  </Text>
                </div>
              ) : (
                <>
                  {/* Modelos rápidos sugeridos para esta marca */}
                  {suggestedModels.length > 0 && (
                    <div>
                      <Text size="10px" fw={700} c="dimmed" tt="uppercase" lts={0.5} mb={4}>
                        Sugerencias para {form.values.marca}:
                      </Text>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedModels.slice(0, 6).map((mName) => {
                          const isSelected = form.values.modelo.toUpperCase() === mName.toUpperCase();
                          return (
                            <button
                              key={mName}
                              type="button"
                              onClick={() => handleSelectModel(mName)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 font-sirac-title ${
                                isSelected
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-indigo-400"
                              }`}
                            >
                              {isSelected && <IconCheck size={12} strokeWidth={3} />}
                              <span>{mName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Búsqueda o escritura directa de modelo */}
                  <div className="pt-1">
                    <TextInput
                      placeholder={`Escribir o buscar modelo de ${form.values.marca}...`}
                      leftSection={<IconSearch size={14} />}
                      size="xs"
                      value={form.values.modelo || modeloSearch}
                      onChange={(e) => {
                        const val = e.currentTarget.value;
                        form.setFieldValue("modelo", val);
                        setModeloSearch(val);
                        if (!expandAllModels && val.length > 0) setExpandAllModels(true);
                      }}
                      onFocus={() => {
                        if (suggestedModels.length > 6) setExpandAllModels(true);
                      }}
                      rightSection={
                        form.values.modelo ? (
                          <ActionIcon
                            size="xs"
                            variant="subtle"
                            onClick={() => {
                              form.setFieldValue("modelo", "");
                              setModeloSearch("");
                            }}
                          >
                            <IconX size={12} />
                          </ActionIcon>
                        ) : undefined
                      }
                      className="font-sirac-title text-xs"
                    />

                    {suggestedModels.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setExpandAllModels(!expandAllModels)}
                        className="w-full mt-1 py-1 flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-indigo-500 transition-colors cursor-pointer"
                      >
                        <span>
                          {expandAllModels ? "Ocultar lista" : `Ver todos los modelos conocidos (${suggestedModels.length})`}
                        </span>
                        {expandAllModels ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                      </button>
                    )}

                    {/* Panel Bounded de Modelos */}
                    {expandAllModels && (
                      <div className="mt-1.5 p-2 bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1e324f] rounded-xl max-h-40 overflow-y-auto space-y-1.5">
                        {filteredModels.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {filteredModels.map((mName) => {
                              const isSelected = form.values.modelo.toUpperCase() === mName.toUpperCase();
                              return (
                                <button
                                  key={mName}
                                  type="button"
                                  onClick={() => handleSelectModel(mName)}
                                  className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                                    isSelected
                                      ? "bg-indigo-600 text-white border-indigo-600"
                                      : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-indigo-400"
                                  }`}
                                >
                                  {mName}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-2 space-y-1.5">
                            <Text size="xs" c="dimmed">
                              Modelo no catalogado. Presiona para registrarlo:
                            </Text>
                            <Button
                              variant="light"
                              color="indigo"
                              size="compact-xs"
                              leftSection={<IconPlus size={14} />}
                              onClick={handleCreateModeloInline}
                              disabled={!selectedMarcaId}
                              loading={createModelo.isPending}
                              className="font-sirac-title text-xs font-bold"
                            >
                              Registrar modelo &quot;{(modeloSearch || form.values.modelo).toUpperCase()}&quot;
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </SimpleGrid>

          {/* ── 3. IMEI / Número de Serie con Escáner de Cámara ── */}
          <div className="border border-slate-200 dark:border-[#1e324f] rounded-2xl p-3 bg-slate-50/70 dark:bg-[#131f33]/70 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title">
                  IMEI o Número de Serie del Equipo
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Recomendado para identificar inequívocamente el equipo del cliente y garantías
                </p>
              </div>
              <Button
                variant="light"
                size="compact-xs"
                color="blue"
                leftSection={<IconScan size={14} />}
                onClick={() => setScannerOpen(true)}
                className="font-sirac-title text-[11px] font-bold shadow-xs cursor-pointer"
              >
                Escanear Código / IMEI
              </Button>
            </div>

            <TextInput
              placeholder="15 dígitos de IMEI o Serial del fabricante (Opcional)"
              leftSection={<IconBarcode size={18} />}
              rightSection={
                <Tooltip label="Escanear código de barras o QR con la cámara">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    size="sm"
                    onClick={() => setScannerOpen(true)}
                    className="cursor-pointer"
                  >
                    <IconScan size={16} />
                  </ActionIcon>
                </Tooltip>
              }
              {...form.getInputProps("imei")}
              className="font-sirac-title text-xs"
            />
          </div>

          {/* Barcode Scanner Modal */}
          <BarcodeScanner
            opened={scannerOpen}
            onClose={() => setScannerOpen(false)}
            onDetected={(code) => {
              const cleanCode = code.trim();
              form.setFieldValue("imei", cleanCode);
              setScannerOpen(false);
              notifications.show({
                title: "Código Capturado",
                message: `Serial / IMEI identificado: ${cleanCode}`,
                color: "green",
              });
            }}
          />

          {/* ── Inline Action: Continuar a Seguridad & Falla ── */}
          {onProceedNext && (
            <Group justify="flex-end" pt="sm" className="border-t border-slate-100 dark:border-[#1e324f]">
              <Button
                size="sm"
                color="blue"
                rightSection={<IconArrowRight size={15} />}
                onClick={onProceedNext}
                disabled={!form.values.marca || !form.values.modelo}
                className="font-sirac-title uppercase tracking-wider text-xs font-bold shadow-sm cursor-pointer"
              >
                Continuar a Seguridad &amp; Falla
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
