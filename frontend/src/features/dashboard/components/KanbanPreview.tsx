import { Badge, Group, Text } from "@mantine/core";
import { Activity, ArrowRight, CheckCircle2, Clock, Wrench, ShieldAlert } from "lucide-react";
import { TICKET_STATUS, KANBAN_COLUMNS } from "../../../lib/constants";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface KanbanPreviewProps {
  counts: Record<string, number>;
}

const defaultCounts: Record<string, number> = {
  RECIBIDO: 0,
  EN_REVISION: 0,
  ESPERANDO_REPUESTO: 0,
  REPARADO: 0,
  ENTREGADO: 0,
};

const STATUS_ICONS: Record<string, any> = {
  RECIBIDO: Clock,
  EN_REVISION: Wrench,
  ESPERANDO_REPUESTO: Activity,
  REPARADO: CheckCircle2,
  ENTREGADO: CheckCircle2,
  ABANDONO: ShieldAlert,
};

const COLOR_HEX_MAP: Record<string, string> = {
  gray: "#64748b",
  blue: "#3b82f6",
  yellow: "#eab308",
  brand: "#10b981",
  violet: "#8b5cf6",
  red: "#ef4444",
};

export function KanbanPreview({ counts = defaultCounts }: KanbanPreviewProps) {
  const navigate = useNavigate();
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <Text size="sm" fw={700} className="font-heading text-slate-900 dark:text-white">
              Flujo de Reparaciones
            </Text>
            <Text size="xs" className="text-slate-400 dark:text-slate-500">
              Distribución en vivo del Kanban ({total} órdenes)
            </Text>
          </div>
        </div>

        <button
          onClick={() => navigate("/reparaciones")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors group cursor-pointer"
        >
          <span>Abrir Tablero</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Multi-segment visual progress bar */}
      <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex mb-6 p-0.5 gap-0.5">
        {KANBAN_COLUMNS.map((col) => {
          const count = counts[col] ?? 0;
          const pct = Math.max(0, (count / total) * 100);
          if (pct === 0) return null;
          const status = TICKET_STATUS[col];
          const colorHex = COLOR_HEX_MAP[status.color] || "#3b82f6";

          return (
            <motion.div
              key={col}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ backgroundColor: colorHex }}
              title={`${status.label}: ${count} (${pct.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Columns Grid */}
      <div className="space-y-3">
        {KANBAN_COLUMNS.map((col) => {
          const status = TICKET_STATUS[col];
          const count = counts[col] ?? 0;
          const pct = ((count / total) * 100).toFixed(0);
          const IconComponent = STATUS_ICONS[col] || Activity;

          return (
            <motion.div
              key={col}
              whileHover={{ x: 2, transition: { duration: 0.15 } }}
              onClick={() => navigate("/reparaciones")}
              className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
              <Group gap="sm" wrap="nowrap">
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-lg text-xs"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--mantine-color-${status.color}-filled) 12%, transparent)`,
                    color: `var(--mantine-color-${status.color}-filled)`,
                  }}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div>
                  <Text size="xs" fw={600} className="text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {status.label}
                  </Text>
                </div>
              </Group>

              <Group gap="xs" wrap="nowrap">
                <Text size="xs" className="text-slate-400 dark:text-slate-500 font-mono">
                  {pct}%
                </Text>
                <Badge
                  variant="filled"
                  color={status.color}
                  size="sm"
                  radius="md"
                  className="font-mono font-bold min-w-7 text-center shadow-xs"
                >
                  {count}
                </Badge>
              </Group>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
