import { useLocation, Link } from "react-router-dom";
import { spotlight } from "@mantine/spotlight";
import { useThemeStore } from "../../stores/theme.store";
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChevronRight,
  Home,
  Command,
  Settings,
} from "lucide-react";

interface TopBarProps {
  toggle?: () => void;
  onNewTicket?: () => void;
}

const ROUTE_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/reparaciones": "Reparaciones",
  "/clients": "Clientes",
  "/inventario": "Inventario",
  "/ventas": "Ventas & POS",
  "/finanzas": "Finanzas",
  "/sucursales": "Sucursales",
  "/usuarios": "Usuarios & Permisos",
  "/configuracion": "Configuración & Personalización",
};

export function TopBar({ toggle }: TopBarProps) {
  const location = useLocation();
  const { colorScheme, toggle: toggleTheme } = useThemeStore();
  const isDark = colorScheme === "dark";

  // Generate breadcrumbs from pathname
  const currentPath = location.pathname;
  const currentLabel = ROUTE_LABELS[currentPath] || (currentPath.split("/")[1] || "Módulo");

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 sm:px-6 bg-white/95 dark:bg-[#0b1320]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-[#1e324f] transition-all z-20 select-none relative">
      {/* Top SIRAC transition accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-amber-400 to-emerald-500 opacity-80 pointer-events-none" />

      {/* Left Section: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#18263d] transition-colors"
          title="Alternar Menú"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation (SIRAC + SIGEPAT Style) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs">
          <Link
            to="/"
            className="flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Home size={15} />
          </Link>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-600" />
          <span className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400 font-sirac-title">
            {currentLabel}
          </span>
        </nav>
      </div>

      {/* Center/Search Section */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => spotlight.open()}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/90 hover:bg-slate-200/70 dark:bg-[#131f33] dark:hover:bg-[#18263d] text-slate-500 dark:text-slate-300 border border-slate-200/80 dark:border-[#1e324f] transition-all text-xs shadow-xs hover:border-slate-300 dark:hover:border-blue-500/40 font-sirac-sub"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-slate-400 dark:text-slate-400" />
            <span className="text-slate-500 dark:text-slate-300 font-medium">
              Buscar tickets, clientes, repuestos...
            </span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-[#18263d] text-[10px] font-semibold text-slate-500 dark:text-slate-300 border border-slate-200/80 dark:border-[#294163] font-mono">
            <Command size={10} />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right Section: Status, Theme & Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          onClick={() => spotlight.open()}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#18263d] transition-colors"
          title="Buscar"
        >
          <Search size={18} />
        </button>

        {/* Operational Status (SIRAC + SIGEPAT Style) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/50">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
          <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-sirac-title">
            En Línea
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#18263d] transition-colors"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {isDark ? (
            <Sun size={18} className="text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon size={18} className="text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Quick Settings Link */}
        <Link
          to="/configuracion"
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-[#18263d] transition-colors"
          title="Configuración & Personalización"
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
}
