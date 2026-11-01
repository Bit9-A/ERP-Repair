import { Text } from "@mantine/core";
import {
  Wrench,
  PackagePlus,
  ShoppingCart,
  UserPlus,
  Receipt,
  Store,
  ChevronRight,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface QuickAction {
  label: string;
  description: string;
  icon: any;
  color: string;
  path: string;
  badge?: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: "Nueva Orden",
    description: "Ingresar equipo al taller",
    icon: Wrench,
    color: "#22C55E",
    path: "/reparaciones",
    badge: "F1",
  },
  {
    label: "Punto de Venta",
    description: "Registrar venta o salida",
    icon: ShoppingCart,
    color: "#3B82F6",
    path: "/ventas",
    badge: "F2",
  },
  {
    label: "Entrada de Stock",
    description: "Cargar repuestos / productos",
    icon: PackagePlus,
    color: "#8B5CF6",
    path: "/inventario",
  },
  {
    label: "Nuevo Cliente",
    description: "Ficha o mayorista",
    icon: UserPlus,
    color: "#06B6D4",
    path: "/clients",
  },
  {
    label: "Cierre de Caja",
    description: "Balance e ingresos diarios",
    icon: Receipt,
    color: "#F59E0B",
    path: "/finanzas",
  },
  {
    label: "Gestionar Sucursales",
    description: "Sedes y transferencias",
    icon: Store,
    color: "#EC4899",
    path: "/sucursales",
  },
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <Text size="sm" fw={700} className="font-heading text-slate-900 dark:text-white">
              Operaciones Rápidas
            </Text>
            <Text size="xs" className="text-slate-400 dark:text-slate-500">
              Accesos directos más frecuentes del personal
            </Text>
          </div>
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="group relative flex items-center justify-between p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800/80 bg-white/50 dark:bg-slate-800/30 hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:bg-white dark:hover:bg-slate-800/60 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden"
            >
              {/* Left accent bar on hover */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: action.color }}
              />

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-200 group-hover:scale-105 shrink-0"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${action.color} 12%, transparent)`,
                    color: action.color,
                    border: `1px solid color-mix(in srgb, ${action.color} 25%, transparent)`,
                  }}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <Text
                    size="sm"
                    fw={700}
                    className="text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-heading leading-tight truncate transition-colors"
                  >
                    {action.label}
                  </Text>
                  <Text size="xs" className="text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                    {action.description}
                  </Text>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {action.badge && (
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.badge}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
