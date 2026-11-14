import { useState, useEffect } from "react";
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
  IconArrowRight,
  IconBolt,
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconCheck,
} from "@tabler/icons-react";
import type { UseFormReturnType } from "@mantine/form";
import type { TicketFormValues } from "../../types/tickets.types";
import { PatternCanvas } from "../PatternCanvas";
import {
  DEFAULT_FALLAS_FRECUENTES,
  DEFAULT_OBSERVACIONES_FRECUENTES,
} from "../../data/deviceCatalog";

interface Step3SecurityFaultPanelProps {
  form: UseFormReturnType<TicketFormValues>;
  initialData?: any;
  onProceedNext?: () => void;
}

const STORAGE_KEY_FALLAS = "erp_repair_fallas_rapidas";
const STORAGE_KEY_OBSERVACIONES = "erp_repair_observaciones_rapidas";

export function Step3SecurityFaultPanel({
  form,
  initialData,
  onProceedNext,
}: Step3SecurityFaultPanelProps) {
  const hasExistingLock = Boolean(
    form.values.clave?.trim() || form.values.patron_visual?.trim()
  );
  const [hasPassword, setHasPassword] = useState<boolean>(
    hasExistingLock || (initialData?.clave || initialData?.patron_visual ? true : false)
  );

  // Estados de acordeón para accesos directos
  const [expandFallas, setExpandFallas] = useState(false);
  const [expandObservaciones, setExpandObservaciones] = useState(false);

  // Estados de lista dinámica de accesos rápidos
  const [fallasRapidas, setFallasRapidas] = useState<string[]>(DEFAULT_FALLAS_FRECUENTES);
  const [observacionesRapidas, setObservacionesRapidas] = useState<string[]>(DEFAULT_OBSERVACIONES_FRECUENTES);

  // Inputs para agregar nuevos atajos al vuelo
  const [nuevaFallaInput, setNuevaFallaInput] = useState("");
  const [nuevaObsInput, setNuevaObsInput] = useState("");

  // Cargar atajos personalizados guardados en localStorage
  useEffect(() => {
    try {
      const storedFallas = localStorage.getItem(STORAGE_KEY_FALLAS);
      if (storedFallas) {
        const parsed = JSON.parse(storedFallas);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFallasRapidas(parsed);
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
      // Usar defaults si hay error en parse
    }
  }, []);

  const handleTogglePassword = (checked: boolean) => {
    setHasPassword(checked);
    if (!checked) {
      form.setFieldValue("clave", "");
      form.setFieldValue("patron_visual", "");
    }
  };

  // Función para aplicar un atajo de falla
  const handleApplyFalla = (texto: string) => {
    const current = (form.values.falla || "").trim();
    if (!current) {
      form.setFieldValue("falla", texto);
    } else if (!current.toLowerCase().includes(texto.toLowerCase())) {
      form.setFieldValue("falla", `${current}, ${texto}`);
    }
  };

  // Función para agregar un nuevo atajo de falla al vuelo
  const handleAddNewFalla = () => {
    const texto = nuevaFallaInput.trim();
    if (!texto) return;
    if (!fallasRapidas.includes(texto)) {
      const updated = [texto, ...fallasRapidas];
      setFallasRapidas(updated);
      try {
        localStorage.setItem(STORAGE_KEY_FALLAS, JSON.stringify(updated));
      } catch {
        // Silenciar error en storage
      }
    }
    handleApplyFalla(texto);
    setNuevaFallaInput("");
  };

  // Función para aplicar un atajo de observación
  const handleApplyObservacion = (texto: string) => {
    const current = (form.values.observaciones || "").trim();
    if (!current) {
      form.setFieldValue("observaciones", texto);
    } else if (!current.toLowerCase().includes(texto.toLowerCase())) {
      form.setFieldValue("observaciones", `${current}, ${texto}`);
    }
  };

  // Función para agregar un nuevo atajo de observación al vuelo
  const handleAddNewObservacion = () => {
    const texto = nuevaObsInput.trim();
    if (!texto) return;
    if (!observacionesRapidas.includes(texto)) {
      const updated = [texto, ...observacionesRapidas];
      setObservacionesRapidas(updated);
      try {
        localStorage.setItem(STORAGE_KEY_OBSERVACIONES, JSON.stringify(updated));
      } catch {
        // Silenciar error en storage
      }
    }
    handleApplyObservacion(texto);
    setNuevaObsInput("");
  };

  return (
    <Stack gap="lg">
      {/* ── 1. Seguridad y Desbloqueo ── */}
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
                  ¿El equipo requiere PIN, contraseña o patrón para pruebas técnicas?
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

      {/* ── 2. Diagnóstico y Falla Reportada + Observaciones (Con Accesos Directos Estilo SIRAC) ── */}
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{
          background: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Stack gap="lg">
          <div>
            <Text fw={700} size="sm" className="font-heading">
              Diagnóstico, Falla y Estado Físico
            </Text>
            <Text size="xs" c="dimmed">
              Usa los accesos directos de 1-toque o escribe la descripción detallada
            </Text>
          </div>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
            {/* ── COLUMNA 1: FALLA REPORTADA + ACCESOS RÁPIDOS ── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5">
                  <IconAlertCircle size={15} className="text-rose-500" />
                  <span>Falla Reportada por el Cliente <span className="text-rose-500">*</span></span>
                </label>
                <Badge variant="light" color="rose" size="xs" className="font-sirac-title font-bold">
                  Requerido
                </Badge>
              </div>

              {/* Los 3-4 accesos directos visibles en pantalla directa */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <IconBolt size={12} className="text-amber-500" />
                  <Text size="10px" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                    Accesos Directos (Toca para agregar):
                  </Text>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {fallasRapidas.slice(0, 4).map((falla) => {
                    const isAdded = (form.values.falla || "").toLowerCase().includes(falla.toLowerCase());
                    return (
                      <button
                        key={falla}
                        type="button"
                        onClick={() => handleApplyFalla(falla)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 font-sirac-title ${
                          isAdded
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-rose-400"
                        }`}
                      >
                        {isAdded && <IconCheck size={12} strokeWidth={3} />}
                        <span>{falla}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón Acordeón Desplegable para ver más fallas o crear nuevas */}
              <div>
                <button
                  type="button"
                  onClick={() => setExpandFallas(!expandFallas)}
                  className="w-full py-1 px-2 rounded-lg bg-slate-100/70 dark:bg-[#131f33]/70 hover:bg-slate-200/70 dark:hover:bg-[#1e324f] flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <IconBolt size={13} className="text-amber-500" />
                    <span>
                      {expandFallas ? "Ocultar catálogo de fallas" : `Ver más fallas frecuentes (+${fallasRapidas.length - 4})`}
                    </span>
                  </span>
                  {expandFallas ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </button>

                {/* Contenedor Contenido de Fallas Frecuentes (Nunca pasa del modal) */}
                {expandFallas && (
                  <div className="mt-1.5 p-2.5 bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1e324f] rounded-xl max-h-48 overflow-y-auto space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {fallasRapidas.slice(4).map((falla) => {
                        const isAdded = (form.values.falla || "").toLowerCase().includes(falla.toLowerCase());
                        return (
                          <button
                            key={falla}
                            type="button"
                            onClick={() => handleApplyFalla(falla)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                              isAdded
                                ? "bg-rose-600 text-white border-rose-600"
                                : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-rose-400"
                            }`}
                          >
                            {falla}
                          </button>
                        );
                      })}
                    </div>

                    {/* Crear nuevo atajo de falla */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#1e324f]">
                      <Group gap="xs" wrap="nowrap">
                        <TextInput
                          placeholder="Nueva falla frecuente para guardar..."
                          size="xs"
                          value={nuevaFallaInput}
                          onChange={(e) => setNuevaFallaInput(e.currentTarget.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddNewFalla();
                            }
                          }}
                          className="flex-1 font-sirac-title text-xs"
                        />
                        <Button
                          size="xs"
                          color="rose"
                          variant="light"
                          leftSection={<IconPlus size={14} />}
                          onClick={handleAddNewFalla}
                          disabled={!nuevaFallaInput.trim()}
                          className="font-sirac-title text-xs font-bold"
                        >
                          Crear
                        </Button>
                      </Group>
                    </div>
                  </div>
                )}
              </div>

              {/* Textarea Principal */}
              <Textarea
                placeholder="Describe la falla manifestada por el cliente..."
                required
                minRows={3}
                {...form.getInputProps("falla")}
                error={form.errors.falla}
                description="Mínimo 5 caracteres explicando el problema"
                className="font-sirac-title text-xs"
              />
            </div>

            {/* ── COLUMNA 2: OBSERVACIONES FÍSICAS + ACCESOS RÁPIDOS ── */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title flex items-center gap-1.5">
                  <IconNotes size={15} className="text-amber-500" />
                  <span>Observaciones Físicas y de Recepción</span>
                </label>
                <Badge variant="light" color="gray" size="xs" className="font-sirac-title font-bold">
                  Opcional
                </Badge>
              </div>

              {/* Los 3-4 accesos directos visibles en pantalla directa */}
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <IconBolt size={12} className="text-amber-500" />
                  <Text size="10px" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                    Accesos Directos (Toca para agregar):
                  </Text>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {observacionesRapidas.slice(0, 4).map((obs) => {
                    const isAdded = (form.values.observaciones || "").toLowerCase().includes(obs.toLowerCase());
                    return (
                      <button
                        key={obs}
                        type="button"
                        onClick={() => handleApplyObservacion(obs)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1 font-sirac-title ${
                          isAdded
                            ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-amber-400"
                        }`}
                      >
                        {isAdded && <IconCheck size={12} strokeWidth={3} />}
                        <span>{obs}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Botón Acordeón Desplegable para ver más observaciones o crear nuevas */}
              <div>
                <button
                  type="button"
                  onClick={() => setExpandObservaciones(!expandObservaciones)}
                  className="w-full py-1 px-2 rounded-lg bg-slate-100/70 dark:bg-[#131f33]/70 hover:bg-slate-200/70 dark:hover:bg-[#1e324f] flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <IconBolt size={13} className="text-amber-500" />
                    <span>
                      {expandObservaciones ? "Ocultar observaciones" : `Ver más observaciones (+${observacionesRapidas.length - 4})`}
                    </span>
                  </span>
                  {expandObservaciones ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                </button>

                {/* Contenedor Contenido de Observaciones Frecuentes */}
                {expandObservaciones && (
                  <div className="mt-1.5 p-2.5 bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-[#1e324f] rounded-xl max-h-48 overflow-y-auto space-y-2">
                    <div className="flex flex-wrap gap-1.5">
                      {observacionesRapidas.slice(4).map((obs) => {
                        const isAdded = (form.values.observaciones || "").toLowerCase().includes(obs.toLowerCase());
                        return (
                          <button
                            key={obs}
                            type="button"
                            onClick={() => handleApplyObservacion(obs)}
                            className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all border cursor-pointer ${
                              isAdded
                                ? "bg-amber-600 text-white border-amber-600"
                                : "bg-slate-50 dark:bg-[#131f33] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-[#243f5d] hover:border-amber-400"
                            }`}
                          >
                            {obs}
                          </button>
                        );
                      })}
                    </div>

                    {/* Crear nuevo atajo de observación */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#1e324f]">
                      <Group gap="xs" wrap="nowrap">
                        <TextInput
                          placeholder="Nueva observación física para guardar..."
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
                          Crear
                        </Button>
                      </Group>
                    </div>
                  </div>
                )}
              </div>

              {/* Textarea Principal */}
              <Textarea
                placeholder="Detalles de golpes, rayones o piezas externas faltantes..."
                minRows={3}
                {...form.getInputProps("observaciones")}
                description="Estado estético y de componentes externos al recibir"
                className="font-sirac-title text-xs"
              />
            </div>
          </SimpleGrid>

          {/* ── Inline Action: Continuar a Checklist ── */}
          {onProceedNext && (
            <Group justify="flex-end" pt="sm" className="border-t border-slate-100 dark:border-[#1e324f]">
              <Button
                size="sm"
                color="blue"
                rightSection={<IconArrowRight size={15} />}
                onClick={onProceedNext}
                disabled={!form.values.falla || form.values.falla.trim().length < 5}
                className="font-sirac-title uppercase tracking-wider text-xs font-bold shadow-sm cursor-pointer"
              >
                Continuar a Checklist Técnico
              </Button>
            </Group>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
