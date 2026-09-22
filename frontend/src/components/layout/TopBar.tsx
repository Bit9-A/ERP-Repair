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
    <header className="h-16 w-full flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-900/80 transition-all z-20 select-none">
      {/* Left Section: Mobile Menu + Breadcrumbs */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Toggle Sidebar Button */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors"
          title="Alternar Menú"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation (SIGEPAT Style) */}
        <nav className="flex items-center gap-1.5 sm:gap-2 text-xs">
          <Link
            to="/"
            className="flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Home size={15} />
          </Link>
          <ChevronRight size={13} className="text-slate-300 dark:text-slate-700" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-heading">
            {currentLabel}
          </span>
        </nav>
      </div>

      {/* Center/Search Section */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={() => spotlight.open()}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-900/80 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/80 transition-all text-xs shadow-sm hover:border-slate-300 dark:hover:border-slate-700 font-sans"
        >
          <div className="flex items-center gap-2.5">
            <Search size={15} className="text-slate-400" />
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              Buscar tickets, clientes, productos...
            </span>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-semibold text-slate-400 border border-slate-200/80 dark:border-slate-700/80 font-mono">
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
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors"
          title="Buscar"
        >
          <Search size={18} />
        </button>

        {/* Operational Status (SIGEPAT Style) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
          <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest font-heading">
            En Línea
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900 transition-colors"
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
          className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-900 transition-colors"
          title="Configuración & Personalización"
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
}
