import { useState, useEffect, useMemo } from "react";
import {
  Stack,
  TextInput,
  Textarea,
  SimpleGrid,
  Text,
  Paper,
  Group,
  Switch,
  Popover,
  ThemeIcon,
  Button,
  Badge,
} from "@mantine/core";
import {
  IconLock,
  IconFingerprint,
  IconAlertCircle,
  IconNotes,
  IconShieldCheck,
  IconShieldLock,
  IconBolt,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
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
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import { PatternCanvas } from "../PatternCanvas";
import {
  ARBOL_FALLAS,
  DEFAULT_OBSERVACIONES_FRECUENTES,
  type FallaNodoDef,
} from "../../data/deviceCatalog";

interface Step3SecurityFaultPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  initialData?: any;
  onProceedNext?: () => void;
}

const STORAGE_KEY_ARBOL = "erp_repair_arbol_fallas_custom";
const STORAGE_KEY_OBSERVACIONES = "erp_repair_observaciones_rapidas";

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
  initialData,
}: Step3SecurityFaultPanelProps) {
  const hasExistingLock = Boolean(
    form.values.clave?.trim() || form.values.patron_visual?.trim()
  );
  const [hasPassword, setHasPassword] = useState<boolean>(
    hasExistingLock || (initialData?.clave || initialData?.patron_visual ? true : false)
  );

  // Árbol de fallas dinámico (Base + Personalizado)
  const [arbolNodos, setArbolNodos] = useState<FallaNodoDef[]>(ARBOL_FALLAS);
  const [selectedTroncoId, setSelectedTroncoId] = useState<string>("energia");

  // Inputs para crear nuevos grupos (troncos) y ramas
  const [mostrarCrearGrupo, setMostrarCrearGrupo] = useState(false);
  const [nuevoGrupoInput, setNuevoGrupoInput] = useState("");
  const [nuevaRamaInput, setNuevaRamaInput] = useState("");

  // Observaciones rápidas
  const [expandObservaciones, setExpandObservaciones] = useState(false);
  const [observacionesRapidas, setObservacionesRapidas] = useState<string[]>(DEFAULT_OBSERVACIONES_FRECUENTES);
  const [nuevaObsInput, setNuevaObsInput] = useState("");

  // Cargar estado guardado de localStorage
  useEffect(() => {
    try {
      const storedArbol = localStorage.getItem(STORAGE_KEY_ARBOL);
      if (storedArbol) {
        const parsed = JSON.parse(storedArbol);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArbolNodos(parsed);
        }
      }

      const storedObs = localStorage.getItem(STORAGE_KEY_OBSERVACIONES);
      if (storedObs) {
        const parsed = JSON.parse(storedObs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setObservacionesRapidas(parsed);
        }
      }
    } catch {
      // Ignorar fallback
    }
  }, []);

  const handleTogglePassword = (checked: boolean) => {
    setHasPassword(checked);
    if (!checked) {
      form.setFieldValue("clave", "");
      form.setFieldValue("patron_visual", "");
    }
  };

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
      // Agregar rama con contexto de su macro-sistema si no existe aún
      if (!current) {
        form.setFieldValue("falla", `${troncoLabel}: ${rama}`);
      } else if (!current.toLowerCase().includes(troncoLabel.toLowerCase())) {
        form.setFieldValue("falla", `${current} | ${troncoLabel}: ${rama}`);
      } else {
        form.setFieldValue("falla", `${current}, ${rama}`);
      }
    } else {
      // Remover la rama del texto
      const regex = new RegExp(`(?:,\\s*)?${rama}`, "gi");
      let updated = current.replace(regex, "").trim();
      // Limpiar separadores sobrantes
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
    }
    setNuevoGrupoInput("");
    setMostrarCrearGrupo(false);
  };

  // Observaciones handlers
  const handleApplyObservacion = (texto: string) => {
    const current = (form.values.observaciones || "").trim();
    if (!current) {
      form.setFieldValue("observaciones", texto);
    } else if (!current.toLowerCase().includes(texto.toLowerCase())) {
      form.setFieldValue("observaciones", `${current}, ${texto}`);
    }
  };

  const handleAddNewObservacion = () => {
    const texto = nuevaObsInput.trim();
    if (!texto) return;
    if (!observacionesRapidas.includes(texto)) {
      const updated = [texto, ...observacionesRapidas];
      setObservacionesRapidas(updated);
      try {
        localStorage.setItem(STORAGE_KEY_OBSERVACIONES, JSON.stringify(updated));
      } catch {
        // Fallback
      }
    }
    handleApplyObservacion(texto);
    setNuevaObsInput("");
  };

  return (
    <Stack gap="lg">
      {/* ── 1. Seguridad y Desbloqueo de Pantalla ── */}
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
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <ThemeIcon
                size="lg"
                radius="md"
                variant="light"
                color={hasPassword ? "indigo" : "gray"}
              >
                {hasPassword ? <IconShieldLock size={20} /> : <IconShieldCheck size={20} />}
              </ThemeIcon>
              <div>
                <Text fw={700} size="sm" className="font-heading">
                  Seguridad y Bloqueo de Pantalla
                </Text>
                <Text size="xs" c="dimmed">
                  ¿El equipo requiere PIN, contraseña o patrón para pruebas técnicas en taller?
                </Text>
              </div>
            </Group>

            <Switch
              size="md"
              checked={hasPassword}
              onChange={(e) => handleTogglePassword(e.currentTarget.checked)}
              label={hasPassword ? "Tiene contraseña / bloqueo" : "Sin contraseña"}
              color="indigo"
            />
          </Group>

          {hasPassword && (
            <Paper
              p="md"
              radius="md"
              style={{
                background: "rgba(99, 102, 241, 0.05)",
                border: "1px dashed rgba(99, 102, 241, 0.25)",
              }}
            >
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                <TextInput
                  label="PIN / Contraseña alfanumérica"
                  placeholder="Ej: 1234 o MiClave2024"
                  leftSection={<IconLock size={16} />}
                  {...form.getInputProps("clave")}
                  className="font-sirac-title text-xs"
                />

                <Popover width={300} position="bottom" withArrow shadow="md">
                  <Popover.Target>
                    <TextInput
                      label="Patrón Visual de Puntos"
                      placeholder="Click para dibujar patrón"
                      readOnly
                      leftSection={<IconFingerprint size={16} />}
                      style={{ cursor: "pointer" }}
                      value={form.values.patron_visual || ""}
                      rightSection={
                        form.values.patron_visual ? (
                          <Button
                            variant="subtle"
                            size="compact-xs"
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setFieldValue("patron_visual", "");
                            }}
                          >
                            Limpiar
                          </Button>
                        ) : undefined
                      }
                      description={
                        form.values.patron_visual
                          ? `Secuencia guardada: ${form.values.patron_visual}`
                          : "Haz clic para trazar el patrón 3x3"
                      }
                      className="font-sirac-title text-xs"
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
              </SimpleGrid>
            </Paper>
          )}
        </Stack>
      </Paper>

      {/* ── 2. Diagnóstico en 2 Niveles: Progressive Disclosure (Tronco -> Ramas) ── */}
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
                Árbol de Diagnóstico Rápido (2 Niveles)
              </Text>
              <Text size="xs" c="dimmed">
                Selecciona el sistema afectado (Tronco) y toca sus fallas específicas (Ramas) al lado
              </Text>
            </div>
            <Button
              variant="subtle"
              color="blue"
              size="compact-xs"
              leftSection={<IconFolderPlus size={14} />}
              onClick={() => setMostrarCrearGrupo(!mostrarCrearGrupo)}
              className="font-sirac-title text-xs font-bold cursor-pointer"
            >
              {mostrarCrearGrupo ? "Cancelar" : "+ Agrupar Nuevas Fallas"}
            </Button>
          </div>

          {/* Mini-panel para crear nuevo grupo / categoría si el técnico lo solicita */}
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 rounded-2xl border border-slate-200 dark:border-[#1e324f] bg-slate-50/70 dark:bg-[#131f33]/70">
            {/* ── NIVEL 1: TRONCO (Macro-sistemas) ── */}
            <div className="md:col-span-5 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#1e324f] pb-3 md:pb-0 md:pr-3">
              <Text size="10px" fw={800} c="dimmed" tt="uppercase" lts={0.5} className="font-sirac-title mb-2">
                Nivel 1: Macro-sistema (Tronco)
              </Text>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {arbolNodos.map((tronco) => {
                  const Icon = MACRO_ICONS[tronco.id] || IconTag;
                  const isSelected = activeTronco?.id === tronco.id;

                  // Contar cuántas ramas de este tronco están activas en el texto
                  const activeBranchesCount = tronco.ramas.filter((r) => isRamaSelected(r)).length;

                  return (
                    <button
                      key={tronco.id}
                      type="button"
                      onClick={() => setSelectedTroncoId(tronco.id)}
                      className={`w-full p-2 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-between font-sirac-title ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-blue-400"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={15} className={isSelected ? "text-white" : `text-${tronco.color}-500`} />
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
                        <IconChevronRight
                          size={14}
                          className={`transition-transform ${isSelected ? "text-white translate-x-0.5" : "text-slate-400"}`}
                        />
                      </div>
                    </button>
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
                  <span className="text-[10px] text-slate-400 font-medium">Toca para marcar</span>
                </div>

                {/* Sub-chips de especificación inmediata */}
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {activeTronco?.ramas.map((rama) => {
                    const isSelected = isRamaSelected(rama);
                    return (
                      <button
                        key={rama}
                        type="button"
                        onClick={() => handleToggleRama(rama, activeTronco.label)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 font-sirac-title ${
                          isSelected
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white dark:bg-[#0b1320] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-rose-400"
                        }`}
                      >
                        {isSelected && <IconCheck size={12} strokeWidth={3} />}
                        <span>{rama}</span>
                      </button>
                    );
                  })}
                  {activeTronco?.ramas.length === 0 && (
                    <Text size="xs" c="dimmed" py="xs">
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

          {/* ── Textarea Principal y Observaciones ── */}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            {/* Textarea Falla Reportada */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5">
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
                    Limpiar
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Falla diagnosticada por el cliente..."
                required
                minRows={3}
                {...form.getInputProps("falla")}
                error={form.errors.falla}
                description="Se completa automáticamente al tocar las ramas o puedes escribir detalles libres"
                className="font-sirac-title text-xs"
              />
            </div>

            {/* Observaciones Físicas y de Recepción */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5">
                  <IconNotes size={15} className="text-amber-500" />
                  <span>Observaciones Físicas y de Recepción</span>
                </label>
                <button
                  type="button"
                  onClick={() => setExpandObservaciones(!expandObservaciones)}
                  className="text-[11px] font-bold text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{expandObservaciones ? "Menos" : `Más atajos (+${observacionesRapidas.length - 4})`}</span>
                  {expandObservaciones ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />}
                </button>
              </div>

              {/* Chips rápidos de observaciones */}
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {(expandObservaciones ? observacionesRapidas : observacionesRapidas.slice(0, 4)).map((obs) => {
                  const isAdded = (form.values.observaciones || "").toLowerCase().includes(obs.toLowerCase());
                  return (
                    <button
                      key={obs}
                      type="button"
                      onClick={() => handleApplyObservacion(obs)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer flex items-center gap-1 font-sirac-title ${
                        isAdded
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-amber-400"
                      }`}
                    >
                      {isAdded && <IconCheck size={11} strokeWidth={3} />}
                      <span>{obs}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input para guardar nueva observación personalizada */}
              {expandObservaciones && (
                <div className="p-2 border border-slate-200 dark:border-[#1e324f] rounded-xl bg-slate-50/70 dark:bg-[#131f33]/70 mb-1.5">
                  <Group gap="xs" wrap="nowrap">
                    <TextInput
                      placeholder="Nueva observación frecuente para guardar..."
                      size="xs"
                      value={nuevaObsInput}
                      onChange={(e) => setNuevaObsInput(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddNewObservacion();
                        }
                      }}
                      className="flex-1 font-sirac-title text-xs"
                    />
                    <Button
                      size="xs"
                      color="yellow"
                      variant="light"
                      leftSection={<IconPlus size={14} />}
                      onClick={handleAddNewObservacion}
                      disabled={!nuevaObsInput.trim()}
                      className="font-sirac-title text-xs font-bold"
                    >
                      Guardar
                    </Button>
                  </Group>
                </div>
              )}

              <Textarea
                placeholder="Detalles de golpes, rayones o piezas externas faltantes..."
                minRows={3}
                {...form.getInputProps("observaciones")}
                description="Detalla el estado estético y componentes externos recibidos"
                className="font-sirac-title text-xs"
              />
            </div>
          </SimpleGrid>
        </Stack>
      </Paper>
    </Stack>
  );
}
