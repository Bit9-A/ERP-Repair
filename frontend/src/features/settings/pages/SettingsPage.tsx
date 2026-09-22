import { motion } from "framer-motion";
import {
  useSettingsStore,
  SIDEBAR_COLOR_OPTIONS,
  FONT_OPTIONS,
} from "../../../stores/settings.store";
import { useThemeStore } from "../../../stores/theme.store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import {
  Palette,
  Sparkles,
  Keyboard,
  Moon,
  Sun,
  Check,
  Zap,
  Info,
  Type,
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function SettingsPage() {
  const {
    sidebarColor,
    setSidebarColor,
    fontFamily,
    setFontFamily,
    animationsEnabled,
    setAnimationsEnabled,
    shortcutsEnabled,
    setShortcutsEnabled,
  } = useSettingsStore();

  const { colorScheme, toggle: toggleColorScheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-5xl"
    >
      {/* Header Banner (SIGEPAT Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight uppercase">
            Configuración & <span className="text-blue-600 dark:text-blue-400">Personalización</span>
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Personaliza el tema visual, la tipografía del sistema, animaciones y comportamiento del ERP.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 text-xs font-bold font-mono self-start sm:self-auto">
          <Sparkles size={15} />
          <span>ESTILO PRO MAX</span>
        </div>
      </div>

      {/* Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 1. FONT SELECTOR CARD (Above Color Palette) */}
        <Card className="md:col-span-2 shadow-sm border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Type size={20} />
              </div>
              <div>
                <CardTitle>Tipografía del Sistema</CardTitle>
                <CardDescription>
                  Selecciona la fuente tipográfica para la interfaz. El cambio se aplica dinámicamente en todo el sistema.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {FONT_OPTIONS.map((f) => {
                const isSelected = fontFamily === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFontFamily(f.id)}
                    className={cn(
                      "flex flex-col text-left p-4 rounded-2xl border transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98]",
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
                    )}
                  >
                    {/* Header: Name + Badge + Check */}
                    <div className="flex items-start justify-between gap-2 w-full mb-2">
                      <div>
                        <span
                          style={{ fontFamily: f.fontFamilyCss }}
                          className="font-bold text-base text-slate-900 dark:text-white block leading-tight"
                        >
                          {f.name}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                          {f.category}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Live Preview Sample in this exact font */}
                    <div
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 my-2 w-full"
                      style={{ fontFamily: f.fontFamilyCss }}
                    >
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {f.previewText}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        1234567890 • Tickets, Inventario y Facturas
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-auto">
                      {f.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 2. COLOR PALETTE CARD */}
        <Card className="md:col-span-2 shadow-sm border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Palette size={20} />
              </div>
              <div>
                <CardTitle>Paleta de Color de la Barra Lateral</CardTitle>
                <CardDescription>
                  Selecciona el color y estilo visual para la barra de navegación principal.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {SIDEBAR_COLOR_OPTIONS.map((opt) => {
                const isSelected = sidebarColor === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSidebarColor(opt.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer active:scale-[0.98]",
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/40"
                    )}
                  >
                    {/* Swatch */}
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center shadow-inner flex-shrink-0 border border-white/20"
                      style={{ backgroundColor: opt.bgHex }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: opt.primaryHex }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate font-heading">
                        {opt.name}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 3. THEME MODE CARD */}
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <div>
                <CardTitle>Tema de la Interfaz</CardTitle>
                <CardDescription>
                  Alterna entre modo oscuro inmersivo y modo claro diurno.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-white font-heading block">
                  {isDark ? "Modo Oscuro Activo" : "Modo Claro Activo"}
                </span>
                <span className="text-xs text-slate-500">
                  {isDark ? "Recomendado para trabajo nocturno y descanso visual" : "Contraste alto y limpio"}
                </span>
              </div>

              <button
                onClick={toggleColorScheme}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Cambiar a {isDark ? "Claro" : "Oscuro"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 4. ANIMATIONS TOGGLE CARD */}
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <Zap size={20} />
              </div>
              <div>
                <CardTitle>Animaciones de Interfaz</CardTitle>
                <CardDescription>
                  Transiciones fluidas, efectos elásticos y micro-interacciones.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-white font-heading block">
                  Efectos y Movimiento
                </span>
                <span className="text-xs text-slate-500">
                  {animationsEnabled
                    ? "Transiciones suaves activadas con Framer Motion"
                    : "Modo rendimiento sin animaciones"}
                </span>
              </div>

              <button
                onClick={() => setAnimationsEnabled(!animationsEnabled)}
                className={cn(
                  "px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer",
                  animationsEnabled
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                )}
              >
                {animationsEnabled ? "Activadas" : "Desactivadas"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* 5. SHORTCUTS CARD */}
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <Keyboard size={20} />
              </div>
              <div>
                <CardTitle>Vía Rápida & Atajos</CardTitle>
                <CardDescription>
                  Atajos de teclado para operaciones ultrarrápidas en el ERP.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <span className="text-sm font-bold text-slate-800 dark:text-white font-heading block">
                  Buscador Global (Spotlight)
                </span>
                <span className="text-xs text-slate-500">
                  Acceso directo con tecla rápida a cualquier módulo, cliente o ticket
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs">
                  Ctrl + K
                </span>
                <button
                  onClick={() => setShortcutsEnabled(!shortcutsEnabled)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm cursor-pointer",
                    shortcutsEnabled
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  )}
                >
                  {shortcutsEnabled ? "Activo" : "Pausado"}
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 6. SYSTEM INFO CARD */}
        <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-500 flex items-center justify-center font-bold">
                <Info size={20} />
              </div>
              <div>
                <CardTitle>Información del Sistema</CardTitle>
                <CardDescription>
                  Detalles técnicos del entorno de ejecución.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs font-medium">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Versión del Sistema:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">v1.2.0 (Pro Max)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500">Motor de Render:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Tailwind 3.4 + Framer Motion 13</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Tipografía Activa:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400 uppercase">
                {FONT_OPTIONS.find((f) => f.id === fontFamily)?.name || fontFamily}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
