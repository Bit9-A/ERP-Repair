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
  Users,
  BadgeDollarSign,
  Building2,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronLeft,
  Globe,
  Receipt,
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
    label: "Reparaciones",
    icon: Wrench,
    path: "/reparaciones",
    section: "OPERACIONES",
    moduleKey: "tickets",
  },
  {
    label: "Clientes",
    icon: Users,
    path: "/clients",
    section: "OPERACIONES",
  },
  {
    label: "Inventario",
    icon: Package,
    path: "/inventario",
    section: "OPERACIONES",
    moduleKey: "inventario",
  },
  {
    label: "Ventas",
    icon: ShoppingCart,
    path: "/ventas",
    section: "OPERACIONES",
    moduleKey: "ventas",
  },
  {
    label: "Pedidos Web",
    icon: Globe,
    path: "/pedidos-web",
    section: "OPERACIONES",
  },
  {
    label: "Finanzas",
    icon: BadgeDollarSign,
    path: "/finanzas",
    section: "ADMINISTRACIÓN",
    moduleKey: "finanzas",
  },
  {
    label: "Facturación a2",
    icon: Receipt,
    path: "/facturacion",
    section: "ADMINISTRACIÓN",
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
    bg: "bg-slate-950",
    border: "border-slate-900/80",
    hover: "hover:bg-slate-900",
    accent: "bg-blue-600",
    subBg: "bg-slate-900/60",
  },
  "slate-light": {
    bg: "bg-slate-900",
    border: "border-slate-800",
    hover: "hover:bg-slate-800",
    accent: "bg-slate-600",
    subBg: "bg-slate-800/50",
  },
  blue: {
    bg: "bg-blue-950",
    border: "border-blue-900/80",
    hover: "hover:bg-blue-900/80",
    accent: "bg-blue-600",
    subBg: "bg-blue-900/50",
  },
  indigo: {
    bg: "bg-indigo-950",
    border: "border-indigo-900/80",
    hover: "hover:bg-indigo-900/80",
    accent: "bg-indigo-600",
    subBg: "bg-indigo-900/50",
  },
  violet: {
    bg: "bg-violet-950",
    border: "border-violet-900/80",
    hover: "hover:bg-violet-900/80",
    accent: "bg-violet-600",
    subBg: "bg-violet-900/50",
  },
  zinc: {
    bg: "bg-zinc-950",
    border: "border-zinc-900/80",
    hover: "hover:bg-zinc-900/80",
    accent: "bg-zinc-700",
    subBg: "bg-zinc-900/50",
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
            "h-16 flex items-center px-4 border-b transition-all",
            c.border,
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          {!isCollapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20 flex-shrink-0 font-heading">
                TL
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-extrabold text-sm tracking-tight text-white uppercase truncate">
                  TECHLAND
                </span>
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest truncate">
                  ERP & Store B2B
                </span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-blue-500/20 ring-2 ring-blue-400/20 font-heading">
              TL
            </div>
          )}

          {/* Desktop collapse button */}
          {!isMobile && onToggleCollapse && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
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
                  <div className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 font-heading">
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
                          "w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative",
                          isCollapsed ? "justify-center px-0 py-3" : "",
                          isActive
                            ? cn(c.accent, "text-white font-semibold shadow-md shadow-black/20")
                            : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                        )}
                      >
                        <Icon
                          size={20}
                          className={cn(
                            "flex-shrink-0 transition-transform duration-200",
                            isActive
                              ? "text-white scale-105"
                              : "text-slate-400 group-hover:text-blue-400 group-hover:scale-110"
                          )}
                        />

                        {!isCollapsed && (
                          <span className="truncate tracking-tight font-semibold">
                            {item.label}
                          </span>
                        )}

                        {isActive && !isCollapsed && (
                          <motion.div
                            layoutId="activeIndicator"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm"
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
        {/* Status indicator (SIGEPAT style) */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className={cn(
                "rounded-xl p-3 border flex items-center justify-between shadow-inner",
                c.subBg,
                c.border
              )}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-heading">
                  ESTADO SISTEMA
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-200 uppercase tracking-tight font-mono">
                    En Línea
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-md ring-2 ring-blue-500/20 flex-shrink-0 font-heading">
            {(user?.nombre || "A").charAt(0).toUpperCase()}
          </div>

          {!isCollapsed ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs uppercase tracking-tight truncate text-white font-heading">
                  {user?.nombre || "Usuario"}
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
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
