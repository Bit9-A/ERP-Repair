import type { ComponentType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/store/auth.store";
import { usePermissions } from "../../hooks/usePermissions";
import { useSettingsStore } from "../../stores/settings.store";
import type { UserPermisos } from "../../types";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wrench,
  Package,
  ShoppingCart,
  BadgeDollarSign,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  path: string;
  section: "GENERAL" | "OPERACIONES" | "ADMINISTRACIÓN";
  adminOnly?: boolean;
  moduleKey?: keyof Required<UserPermisos>;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    section: "GENERAL",
  },
  {
    label: "Taller Técnico",
    icon: Wrench,
    path: "/reparaciones",
    section: "OPERACIONES",
    moduleKey: "tickets",
  },
  {
    label: "Ventas & Pedidos",
    icon: ShoppingCart,
    path: "/ventas",
    section: "OPERACIONES",
    moduleKey: "ventas",
  },
  {
    label: "Inventario",
    icon: Package,
    path: "/inventario",
    section: "OPERACIONES",
    moduleKey: "inventario",
  },
  {
    label: "Finanzas & Facturación",
    icon: BadgeDollarSign,
    path: "/finanzas",
    section: "ADMINISTRACIÓN",
    moduleKey: "finanzas",
  },
  {
    label: "Sucursales",
    icon: Building2,
    path: "/sucursales",
    section: "ADMINISTRACIÓN",
    adminOnly: true,
  },
  {
    label: "Usuarios",
    icon: ShieldCheck,
    path: "/usuarios",
    section: "ADMINISTRACIÓN",
    adminOnly: true,
    moduleKey: "usuarios",
  },
  {
    label: "Configuración",
    icon: Settings,
    path: "/configuracion",
    section: "ADMINISTRACIÓN",
  },
];

interface SidebarProps {
  collapsed?: boolean;
  isMobile?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

const colorMap: Record<
  string,
  { bg: string; border: string; hover: string; accent: string; subBg: string }
> = {
  slate: {
    bg: "bg-[#0b1320]",
    border: "border-[#1e324f]",
    hover: "hover:bg-[#18263d]",
    accent: "bg-gradient-to-r from-[#243f5d] to-[#18263d] text-white border border-blue-400/30 shadow-md shadow-blue-950/50",
    subBg: "bg-[#131f33]/90",
  },
  "slate-light": {
    bg: "bg-[#0f1a2e]",
    border: "border-[#1e324f]",
    hover: "hover:bg-[#18263d]",
    accent: "bg-[#243f5d] text-white",
    subBg: "bg-[#131f33]/80",
  },
  blue: {
    bg: "bg-[#0b1320]",
    border: "border-[#1e324f]",
    hover: "hover:bg-blue-900/40",
    accent: "bg-blue-600 text-white shadow-md shadow-blue-950/50",
    subBg: "bg-blue-950/40",
  },
  indigo: {
    bg: "bg-[#0b1320]",
    border: "border-[#1e324f]",
    hover: "hover:bg-indigo-900/40",
    accent: "bg-indigo-600 text-white shadow-md shadow-indigo-950/50",
    subBg: "bg-indigo-950/40",
  },
  violet: {
    bg: "bg-[#0b1320]",
    border: "border-[#1e324f]",
    hover: "hover:bg-violet-900/40",
    accent: "bg-violet-600 text-white shadow-md shadow-violet-950/50",
    subBg: "bg-violet-950/40",
  },
  zinc: {
    bg: "bg-[#0b1320]",
    border: "border-[#1e324f]",
    hover: "hover:bg-[#18263d]",
    accent: "bg-zinc-700 text-white shadow-md shadow-zinc-950/50",
    subBg: "bg-[#131f33]/80",
  },
  stone: {
    bg: "bg-stone-950",
    border: "border-stone-900/80",
    hover: "hover:bg-stone-900/80",
    accent: "bg-stone-600",
    subBg: "bg-stone-900/50",
  },
  emerald: {
    bg: "bg-emerald-950",
    border: "border-emerald-900/80",
    hover: "hover:bg-emerald-900/80",
    accent: "bg-emerald-600",
    subBg: "bg-emerald-900/50",
  },
  cyan: {
    bg: "bg-cyan-950",
    border: "border-cyan-900/80",
    hover: "hover:bg-cyan-900/80",
    accent: "bg-cyan-600",
    subBg: "bg-cyan-900/50",
  },
  red: {
    bg: "bg-red-950",
    border: "border-red-900/80",
    hover: "hover:bg-red-900/80",
    accent: "bg-red-600",
    subBg: "bg-red-900/50",
  },
  amber: {
    bg: "bg-amber-950",
    border: "border-amber-900/80",
    hover: "hover:bg-amber-900/80",
    accent: "bg-amber-600",
    subBg: "bg-amber-900/50",
  },
};

export function Sidebar({
  collapsed = false,
  isMobile = false,
  onNavigate,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const permissions = usePermissions();
  const { sidebarColor } = useSettingsStore();

  const c = colorMap[sidebarColor] || colorMap.slate;

  const isCollapsed = isMobile ? false : collapsed;
  const isAdmin = user?.rol === "ADMIN";

  const handleLogout = () => {
    logout();
    navigate("/login");
    onNavigate?.();
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (isAdmin) return true;
    if (item.adminOnly) return false;
    if (item.moduleKey) {
      const modulePerms = permissions[item.moduleKey];
      if (!modulePerms?.ver) return false;
    }
    return true;
  });

  const sections: Array<"GENERAL" | "OPERACIONES" | "ADMINISTRACIÓN"> = [
    "GENERAL",
    "OPERACIONES",
    "ADMINISTRACIÓN",
  ];

  return (
    <aside
      className={cn(
        "h-full flex flex-col justify-between border-r text-slate-100 select-none transition-all duration-300 relative overflow-hidden font-sans",
        c.bg,
        c.border,
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Background glow overlay */}
      <div className="absolute top-0 left-0 w-full h-44 bg-gradient-to-b from-blue-500/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Header & Navigation */}
      <div className="flex-1 flex flex-col min-h-0 z-10">
        {/* Brand Header */}
        <div
          className={cn(
            "h-16 flex items-center px-4 border-b transition-all relative overflow-hidden",
            c.border,
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {/* SIGEPAT watermark icon */}
          <Wrench className="absolute -right-3 -top-2 w-16 h-16 text-white/[0.03] pointer-events-none rotate-12" />

          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden z-10">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#243f5d] to-blue-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/30 flex-shrink-0 font-sirac-title">
                TL
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-sirac-title font-bold text-sm tracking-wider text-white uppercase truncate">
                  TECHLAND
                </span>
                <span className="font-sirac-sub text-[9px] font-semibold text-blue-400 uppercase tracking-widest truncate">
                  SISTEMA DE GESTIÓN ERP
                </span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#243f5d] to-blue-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/30 font-sirac-title z-10 hover:ring-blue-400/80 hover:scale-105 transition-all cursor-pointer group"
              title="Expandir menú lateral"
            >
              <span className="group-hover:hidden">TL</span>
              <ChevronRight size={18} className="hidden group-hover:block" />
            </button>
          )}

          {/* Desktop collapse button */}
          {!isMobile && onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
              title="Colapsar menú"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {sections.map((sec) => {
            const itemsInSec = visibleNavItems.filter(
              (item) => item.section === sec
            );
            if (itemsInSec.length === 0) return null;

            return (
              <div key={sec} className="space-y-1.5">
                {!isCollapsed && (
                  <div className="px-3 text-[10px] font-bold text-slate-400/90 uppercase tracking-[0.18em] mb-2 font-sirac-title">
                    {sec}
                  </div>
                )}

                <div className="space-y-1">
                  {itemsInSec.map((item) => {
                    const isActive =
                      item.path === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.path);

                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative font-sirac-title",
                          isCollapsed ? "justify-center px-0 py-3" : "",
                          isActive
                            ? "bg-[#18263d] text-blue-300 border border-blue-400/40 shadow-md shadow-blue-950/50"
                            : "text-slate-400 hover:text-slate-100 hover:bg-[#18263d]/40"
                        )}
                      >
                        <Icon
                          size={19}
                          className={cn(
                            "flex-shrink-0 transition-transform duration-200",
                            isActive
                              ? "text-blue-400 scale-105"
                              : "text-slate-400 group-hover:text-blue-300 group-hover:scale-105"
                          )}
                        />

                        {!isCollapsed && (
                          <span className="truncate tracking-wide font-medium">
                            {item.label}
                          </span>
                        )}

                        {isActive && !isCollapsed && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Status Section */}
      <div
        className={cn(
          "p-3 border-t space-y-3 z-10 backdrop-blur-sm",
          c.border,
          c.bg
        )}
      >
        {/* Status indicator (SIGEPAT + SIRAC style) */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={cn(
                "rounded-2xl p-2.5 border flex items-center justify-between shadow-inner",
                c.subBg,
                c.border
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sirac-title">
                  ESTADO SISTEMA
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight font-sirac-sub">
                    En Línea • SIRAC/ALLCODE
                  </span>
                </div>
              </div>
              <ShieldCheck size={18} className="text-blue-400/80" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Card */}
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-2xl border transition-all overflow-hidden",
            c.subBg,
            c.border,
            isCollapsed ? "justify-center flex-col p-2.5 gap-3" : "px-3 py-2.5"
          )}
        >
          {/* Avatar */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#243f5d] to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-md ring-1 ring-blue-400/30 flex-shrink-0 font-sirac-title">
            {(user?.nombre || "A").charAt(0).toUpperCase()}
          </div>

          {!isCollapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs uppercase tracking-tight truncate text-white font-sirac-title">
                  {user?.nombre || "Usuario"}
                </div>
                <div className="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider truncate font-sirac-sub">
                  {user?.rol || "Técnico"}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer group/logout"
                title="Cerrar sesión"
              >
                <LogOut
                  size={15}
                  className="group-hover/logout:translate-x-0.5 transition-transform"
                />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 flex items-center justify-center transition-all"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
