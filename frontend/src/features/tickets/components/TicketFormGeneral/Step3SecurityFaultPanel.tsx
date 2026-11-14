import { useState, useEffect, useMemo } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  Text,
  Paper,
  Group,
  ThemeIcon,
  Button,
  Badge,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBolt,
  IconCheck,
  IconDeviceMobile,
  IconCamera,
  IconVolume,
  IconDroplet,
  IconCpu,
  IconChevronRight,
  IconFolderPlus,
  IconTag,
  IconX,
  IconHierarchy2,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import {
  ARBOL_FALLAS,
  type FallaNodoDef,
} from "../../data/deviceCatalog";

interface Step3SecurityFaultPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  initialData?: any;
  onProceedNext?: () => void;
}

const STORAGE_KEY_ARBOL = "erp_repair_arbol_fallas_custom";

const MACRO_ICONS: Record<string, any> = {
  energia: IconBolt,
  pantalla: IconDeviceMobile,
  camaras: IconCamera,
  audio: IconVolume,
  humedad: IconDroplet,
  sistema: IconCpu,
};

export function Step3SecurityFaultPanel({
  form,
}: Step3SecurityFaultPanelProps) {
  // Árbol de fallas dinámico (Base + Personalizado)
  const [arbolNodos, setArbolNodos] = useState<FallaNodoDef[]>(ARBOL_FALLAS);
  const [selectedTroncoId, setSelectedTroncoId] = useState<string>("energia");

  // Inputs para crear nuevos grupos (troncos) y ramas
  const [mostrarCrearGrupo, setMostrarCrearGrupo] = useState(false);
  const [nuevoGrupoInput, setNuevoGrupoInput] = useState("");
  const [nuevaRamaInput, setNuevaRamaInput] = useState("");

  // Cargar árbol persistido de localStorage
  useEffect(() => {
    try {
      const storedArbol = localStorage.getItem(STORAGE_KEY_ARBOL);
      if (storedArbol) {
        const parsed = JSON.parse(storedArbol);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArbolNodos(parsed);
        }
      }
    } catch {
      // Ignorar fallback
    }
  }, []);

  const activeTronco = useMemo(() => {
    return arbolNodos.find((t) => t.id === selectedTroncoId) || arbolNodos[0];
  }, [arbolNodos, selectedTroncoId]);

  // Verificar si una rama está seleccionada en el texto actual de falla
  const isRamaSelected = (rama: string): boolean => {
    const fallaText = (form.values.falla || "").toLowerCase();
    return fallaText.includes(rama.toLowerCase());
  };

  // Alternar selección de una rama (Progressive Disclosure)
  const handleToggleRama = (rama: string, troncoLabel: string) => {
    const current = (form.values.falla || "").trim();
    const isSelected = isRamaSelected(rama);

    if (!isSelected) {
      if (!current) {
        form.setFieldValue("falla", `${troncoLabel}: ${rama}`);
      } else if (!current.toLowerCase().includes(troncoLabel.toLowerCase())) {
        form.setFieldValue("falla", `${current} | ${troncoLabel}: ${rama}`);
      } else {
        form.setFieldValue("falla", `${current}, ${rama}`);
      }
    } else {
      const regex = new RegExp(`(?:,\\s*)?${rama}`, "gi");
      let updated = current.replace(regex, "").trim();
      updated = updated.replace(/:\s*,/g, ":").replace(/\|\s*\|/g, "|").replace(/^\||\|$/g, "").trim();
      form.setFieldValue("falla", updated);
    }
  };

  // Agregar una nueva rama al tronco actual
  const handleAddRamaToCurrentTronco = () => {
    const texto = nuevaRamaInput.trim();
    if (!texto || !activeTronco) return;

    if (!activeTronco.ramas.some((r) => r.toLowerCase() === texto.toLowerCase())) {
      const updatedArbol = arbolNodos.map((nodo) => {
        if (nodo.id === activeTronco.id) {
          return { ...nodo, ramas: [...nodo.ramas, texto] };
        }
        return nodo;
      });
      setArbolNodos(updatedArbol);
      try {
        localStorage.setItem(STORAGE_KEY_ARBOL, JSON.stringify(updatedArbol));
      } catch {
        // Fallback
      }
    }

    handleToggleRama(texto, activeTronco.label);
    setNuevaRamaInput("");
  };

  // Eliminar una rama del tronco activo (por si quedó mal escrita o errata)
  const handleDeleteRama = (ramaToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeTronco) return;

    const updatedArbol = arbolNodos.map((nodo) => {
      if (nodo.id === activeTronco.id) {
        return {
          ...nodo,
          ramas: nodo.ramas.filter((r) => r !== ramaToDelete),
        };
      }
      return nodo;
    });

    setArbolNodos(updatedArbol);
    try {
      localStorage.setItem(STORAGE_KEY_ARBOL, JSON.stringify(updatedArbol));
    } catch {
      // Fallback
    }

    // Si estaba seleccionada, removerla de la falla
    if (isRamaSelected(ramaToDelete)) {
      handleToggleRama(ramaToDelete, activeTronco.label);
    }

    notifications.show({
      title: "Rama eliminada",
      message: `Se eliminó "${ramaToDelete}" del grupo`,
      color: "gray",
    });
  };

  // Crear un nuevo grupo / tronco de fallas
  const handleCreateNewTronco = () => {
    const nombre = nuevoGrupoInput.trim();
    if (!nombre) return;

    const id = nombre.toLowerCase().replace(/[^a-z0-9]/g, "_");
    if (!arbolNodos.some((n) => n.id === id)) {
      const nuevoNodo: FallaNodoDef = {
        id,
        label: nombre,
        color: "blue",
        ramas: [],
      };
      const updatedArbol = [...arbolNodos, nuevoNodo];
      setArbolNodos(updatedArbol);
      setSelectedTroncoId(id);
      try {
        localStorage.setItem(STORAGE_KEY_ARBOL, JSON.stringify(updatedArbol));
      } catch {
        // Fallback
      }
      notifications.show({
        title: "Categoría creada",
        message: `Se creó el grupo "${nombre}"`,
        color: "green",
      });
    }
    setNuevoGrupoInput("");
    setMostrarCrearGrupo(false);
  };

  // Eliminar un grupo / tronco completo (por si se escribió mal como "Biometriá")
  const handleDeleteTronco = (troncoIdToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedArbol = arbolNodos.filter((n) => n.id !== troncoIdToDelete);
    setArbolNodos(updatedArbol);
    if (selectedTroncoId === troncoIdToDelete && updatedArbol.length > 0) {
      setSelectedTroncoId(updatedArbol[0].id);
    }
    try {
      localStorage.setItem(STORAGE_KEY_ARBOL, JSON.stringify(updatedArbol));
    } catch {
      // Fallback
    }
    notifications.show({
      title: "Grupo eliminado",
      message: "Se eliminó la categoría del árbol",
      color: "gray",
    });
  };

  return (
    <Stack gap="lg">
      {/* ── 1. Cabecera del Árbol de Diagnóstico ── */}
      <Paper
        p="lg"
        radius="lg"
        withBorder
        className="bg-white dark:bg-[#0b1320] border-slate-200 dark:border-[#1e324f] shadow-xs"
      >
        <Stack gap="md">
          <div className="flex items-center justify-between">
            <Group gap="sm">
              <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                <IconHierarchy2 size={22} strokeWidth={2.2} />
              </ThemeIcon>
              <div>
                <Text fw={800} size="sm" className="font-sirac-title text-slate-900 dark:text-white uppercase tracking-wider">
                  Árbol de Diagnóstico Rápido (2 Niveles)
                </Text>
                <Text size="xs" c="dimmed" className="font-sirac-title">
                  Toca el sistema afectado (Tronco) y especifica sus fallas (Ramas) al lado con 2 toques
                </Text>
              </div>
            </Group>

            <Button
              variant="light"
              color="blue"
              size="compact-xs"
              leftSection={<IconFolderPlus size={14} />}
              onClick={() => setMostrarCrearGrupo(!mostrarCrearGrupo)}
              className="font-sirac-title text-xs font-bold cursor-pointer"
            >
              {mostrarCrearGrupo ? "Cerrar" : "+ Agrupar Nuevas Fallas"}
            </Button>
          </div>

          {/* Mini-panel para crear nuevo grupo / categoría */}
          {mostrarCrearGrupo && (
            <Paper
              p="xs"
              radius="md"
              className="border border-dashed border-blue-400 dark:border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20"
            >
              <Group gap="xs" wrap="nowrap">
                <TextInput
                  placeholder="Nombre de la nueva categoría (Ej: Conectividad Wi-Fi, Teclado, Biometría...)"
                  size="xs"
                  value={nuevoGrupoInput}
                  onChange={(e) => setNuevoGrupoInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateNewTronco();
                    }
                  }}
                  className="flex-1 font-sirac-title text-xs"
                  styles={{
                    input: { borderRadius: "10px", fontWeight: 600 },
                  }}
                />
                <Button
                  size="xs"
                  color="blue"
                  onClick={handleCreateNewTronco}
                  disabled={!nuevoGrupoInput.trim()}
                  className="font-sirac-title text-xs font-bold"
                >
                  Crear Grupo
                </Button>
              </Group>
            </Paper>
          )}

          {/* ── ÁRBOL EN 2 COLUMNAS: TRONCO (Izquierda) → RAMAS (Derecha) ── */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-[#1e324f] bg-slate-50/70 dark:bg-[#131f33]/70">
            {/* ── NIVEL 1: TRONCO (Macro-sistemas) ── */}
            <div className="md:col-span-5 space-y-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1e324f] pb-3 md:pb-0 md:pr-3">
              <div className="flex items-center justify-between mb-1">
                <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts={0.5} className="font-sirac-title">
                  Nivel 1: Macro-sistema (Tronco)
                </Text>
                <span className="text-[10px] text-slate-400 font-medium">({arbolNodos.length})</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {arbolNodos.map((tronco) => {
                  const Icon = MACRO_ICONS[tronco.id] || IconTag;
                  const isSelected = activeTronco?.id === tronco.id;
                  const isDefaultBase = ARBOL_FALLAS.some((base) => base.id === tronco.id);

                  // Contar cuántas ramas de este tronco están activas en el texto
                  const activeBranchesCount = tronco.ramas.filter((r) => isRamaSelected(r)).length;

                  return (
                    <div
                      key={tronco.id}
                      onClick={() => setSelectedTroncoId(tronco.id)}
                      className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-between font-sirac-title ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} className={isSelected ? "text-white" : `text-${tronco.color}-500`} />
                        <span>{tronco.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {activeBranchesCount > 0 && (
                          <Badge
                            size="xs"
                            color={isSelected ? "white" : "blue"}
                            variant={isSelected ? "filled" : "light"}
                            className={isSelected ? "text-blue-900 font-bold" : "font-bold"}
                          >
                            {activeBranchesCount}
                          </Badge>
                        )}

                        {/* Botón de eliminar si es un grupo personalizado creado por el técnico */}
                        {!isDefaultBase && (
                          <Tooltip label="Eliminar grupo personalizado">
                            <ActionIcon
                              size="xs"
                              variant="transparent"
                              color={isSelected ? "white" : "red"}
                              onClick={(e) => handleDeleteTronco(tronco.id, e)}
                              className="opacity-70 hover:opacity-100"
                            >
                              <IconTrash size={13} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        <IconChevronRight
                          size={14}
                          className={`transition-transform ${isSelected ? "text-white translate-x-0.5" : "text-slate-400"}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── NIVEL 2: RAMAS (Sub-chips inmediatos) ── */}
            <div className="md:col-span-7 space-y-2.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts={0.5} className="font-sirac-title">
                    Nivel 2: Ramas de {activeTronco?.label}
                  </Text>
                  <span className="text-[10px] text-slate-400 font-medium font-sirac-title">
                    Toca para marcar o desmarcar
                  </span>
                </div>

                {/* Sub-chips de especificación inmediata con botón de eliminar por errata */}
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeTronco?.ramas.map((rama) => {
                    const isSelected = isRamaSelected(rama);
                    return (
                      <div
                        key={rama}
                        onClick={() => handleToggleRama(rama, activeTronco.label)}
                        className={`group px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 font-sirac-title ${
                          isSelected
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-rose-400"
                        }`}
                      >
                        {isSelected && <IconCheck size={12} strokeWidth={3} />}
                        <span>{rama}</span>

                        {/* Botón sutil para eliminar rama por si está mal escrita */}
                        <ActionIcon
                          size="xs"
                          variant="transparent"
                          color={isSelected ? "white" : "gray"}
                          onClick={(e) => handleDeleteRama(rama, e)}
                          className="opacity-40 hover:opacity-100 hover:text-red-500"
                          title="Eliminar esta rama"
                        >
                          <IconX size={10} />
                        </ActionIcon>
                      </div>
                    );
                  })}
                  {activeTronco?.ramas.length === 0 && (
                    <Text size="xs" c="dimmed" py="xs" className="font-sirac-title">
                      No hay ramas aún en este grupo. Agrega una abajo:
                    </Text>
                  )}
                </div>
              </div>

              {/* Agregar nueva rama rápida al tronco activo */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-[#1e324f]">
                <Group gap="xs" wrap="nowrap">
                  <TextInput
                    placeholder={`+ Agregar nueva rama a ${activeTronco?.label}...`}
                    size="xs"
                    value={nuevaRamaInput}
                    onChange={(e) => setNuevaRamaInput(e.currentTarget.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRamaToCurrentTronco();
                      }
                    }}
                    className="flex-1 font-sirac-title text-xs"
                    styles={{
                      input: { borderRadius: "10px", fontWeight: 600 },
                    }}
                  />
                  <Button
                    size="xs"
                    color="blue"
                    variant="light"
                    leftSection={<IconPlus size={14} />}
                    onClick={handleAddRamaToCurrentTronco}
                    disabled={!nuevaRamaInput.trim()}
                    className="font-sirac-title text-xs font-bold cursor-pointer"
                  >
                    Agregar Rama
                  </Button>
                </Group>
              </div>
            </div>
          </div>

          {/* ── Resumen de Falla Reportada (Textarea) ── */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5 uppercase tracking-wide">
                <IconAlertCircle size={15} className="text-rose-500" />
                <span>Resumen de Falla Reportada <span className="text-rose-500">*</span></span>
              </label>
              {form.values.falla && (
                <Button
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  leftSection={<IconX size={12} />}
                  onClick={() => form.setFieldValue("falla", "")}
                  className="font-sirac-title text-[11px]"
                >
                  Limpiar Texto
                </Button>
              )}
            </div>
            <Textarea
              placeholder="Describe o afina la falla diagnosticada..."
              required
              minRows={3}
              {...form.getInputProps("falla")}
              error={form.errors.falla}
              description="Se redacta automáticamente al tocar las ramas o puedes escribir detalles técnicos adicionales"
              className="font-sirac-title text-xs"
              styles={{
                input: { borderRadius: "12px", fontSize: "12px", fontWeight: 600 },
              }}
            />
          </div>
        </Stack>
      </Paper>
    </Stack>
  );
}
