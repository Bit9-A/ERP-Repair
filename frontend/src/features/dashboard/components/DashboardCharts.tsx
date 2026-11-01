import { Text, Badge } from "@mantine/core";
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardChartsProps {
  kanbanCounts: Record<string, number>;
  metrics: {
    activeTickets: number;
    waitingParts: number;
    lowStockCount: number;
    todayRevenue: number;
  };
  financeStats?: {
    ingresosHoy: number;
    egresosHoy: number;
    balanceHoy: number;
    ticketsCobradosHoy: number;
  };
}

export function DashboardCharts({
  kanbanCounts,
  metrics,
  financeStats,
}: DashboardChartsProps) {
  const recibido = kanbanCounts["RECIBIDO"] || 0;
  const enRevision = kanbanCounts["EN_REVISION"] || 0;
  const esperandoRepuesto = kanbanCounts["ESPERANDO_REPUESTO"] || 0;
  const reparado = kanbanCounts["REPARADO"] || 0;
  const entregado = kanbanCounts["ENTREGADO"] || 0;

  const totalWorkflow = recibido + enRevision + esperandoRepuesto + reparado + entregado || 1;
  const resolutionRate = totalWorkflow > 0 ? Math.round(((reparado + entregado) / totalWorkflow) * 100) : 0;

  const pipelineStages = [
    { label: "Recibidos", count: recibido, color: "#3B82F6", text: "text-blue-500", bg: "bg-blue-500" },
    { label: "En Revisión", count: enRevision, color: "#EAB308", text: "text-amber-500", bg: "bg-amber-500" },
    { label: "Esperando Rep.", count: esperandoRepuesto, color: "#F97316", text: "text-orange-500", bg: "bg-orange-500" },
    { label: "Reparados", count: reparado, color: "#10B981", text: "text-emerald-500", bg: "bg-emerald-500" },
    { label: "Entregados", count: entregado, color: "#14B8A6", text: "text-teal-500", bg: "bg-teal-500" },
  ];

  const maxStageCount = Math.max(...pipelineStages.map((s) => s.count), 5);

  const ingresos = financeStats?.ingresosHoy ?? metrics.todayRevenue ?? 0;
  const egresos = financeStats?.egresosHoy ?? 0;
  const balance = financeStats?.balanceHoy ?? (ingresos - egresos);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* ── Card 1: Pipeline de Eficiencia Técnica ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <Text size="sm" fw={700} className="font-heading text-slate-900 dark:text-white">
                  Capacidad de Laboratorio Técnico
                </Text>
                <Text size="xs" className="text-slate-400 dark:text-slate-500">
                  Volumen actual por etapa operativa
                </Text>
              </div>
            </div>

            <Badge
              variant="light"
              color={resolutionRate >= 50 ? "green" : "blue"}
              size="sm"
              radius="md"
              className="font-mono font-bold"
            >
              {resolutionRate}% Resuelto
            </Badge>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="mt-6 space-y-3">
            {pipelineStages.map((stage, idx) => {
              const barWidth = Math.max(8, (stage.count / maxStageCount) * 100);
              return (
                <div key={stage.label} className="group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {stage.label}
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {stage.count} <span className="text-[10px] text-slate-400 font-normal">equipos</span>
                    </span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.7, delay: idx * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${stage.color} 0%, color-mix(in srgb, ${stage.color} 70%, white) 100%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Insight */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>{metrics.activeTickets} órdenes en taller hoy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>{reparado + entregado} listas para entrega</span>
          </div>
        </div>
      </div>

      {/* ── Card 2: Balance Financiero & Alerta de Inventario ── */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <Text size="sm" fw={700} className="font-heading text-slate-900 dark:text-white">
                  Balance y Salud de Inventario
                </Text>
                <Text size="xs" className="text-slate-400 dark:text-slate-500">
                  Rendimiento de caja diaria y repuestos críticos
                </Text>
              </div>
            </div>

            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
              Tiempo Real
            </span>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Ingresos del Día
              </span>
              <span className="text-xl font-extrabold font-heading text-emerald-600 dark:text-emerald-400">
                ${ingresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Egresos / Gastos
              </span>
              <span className="text-xl font-extrabold font-heading text-slate-700 dark:text-slate-300">
                ${egresos.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Net Balance Pill */}
          <div className="mt-3 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                Neto Operativo Diario
              </span>
              <span className="text-xs text-slate-400">
                Tickets cobrados: {financeStats?.ticketsCobradosHoy ?? 0}
              </span>
            </div>
            <span className="text-xl font-extrabold font-heading text-blue-600 dark:text-blue-400">
              ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Low Stock Alert Capsule */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${
              metrics.lowStockCount > 0
                ? "border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`w-4 h-4 ${metrics.lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`} />
              <div>
                <span className="text-xs font-bold block">
                  {metrics.lowStockCount > 0
                    ? `${metrics.lowStockCount} Repuestos en Stock Crítico`
                    : "Inventario en Niveles Óptimos"}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {metrics.lowStockCount > 0
                    ? "Genera una orden de compra o traspaso de sucursal"
                    : "Todos los artículos superan el stock mínimo"}
                </span>
              </div>
            </div>

            {metrics.lowStockCount > 0 && (
              <Badge variant="filled" color="yellow" size="sm" radius="md">
                Reponer
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
