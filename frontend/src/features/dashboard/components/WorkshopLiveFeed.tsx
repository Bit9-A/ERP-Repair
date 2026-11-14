import { Radio, Wrench, CheckCircle2, Clock } from "lucide-react";
import type { TicketReparacion } from "../../../types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");

interface WorkshopLiveFeedProps {
  repairs: TicketReparacion[];
}

export function WorkshopLiveFeed({ repairs }: WorkshopLiveFeedProps) {
  // Generate feed events from recent repairs and movements
  const feedItems = repairs.slice(0, 5).map((r) => {
    const isRepaired = r.estado === "REPARADO";
    const isDelivered = r.estado === "ENTREGADO";
    const isWaiting = r.estado === "ESPERANDO_REPUESTO";

    let icon = Wrench;
    let color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
    let actionText = "Ingreso a revisión técnica";

    if (isDelivered) {
      icon = CheckCircle2;
      color = "text-purple-500 bg-purple-500/10 border-purple-500/20";
      actionText = "Orden entregada con éxito a cliente";
    } else if (isRepaired) {
      icon = CheckCircle2;
      color = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      actionText = "Equipo finalizado y listo para entrega";
    } else if (isWaiting) {
      icon = Clock;
      color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      actionText = "En pausa: espera de repuestos";
    }

    return {
      id: r.id,
      ticketNumber: `#T-${r.id.substring(0, 6)}`,
      device: `${r.marca} ${r.modelo}`,
      client: r.cliente?.nombre || "Cliente Particular",
      time: dayjs(r.fecha_ingreso).fromNow(),
      action: actionText,
      icon,
      color,
    };
  });

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs dark:shadow-md dark:shadow-[#070d18]/40 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1e324f]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 animate-pulse text-emerald-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-sirac-title truncate">
              Bitácora Operativa en Vivo
            </h3>
            <p className="text-[11px] text-slate-400 font-sirac-sub truncate">
              Stream de eventos del laboratorio en tiempo real
            </p>
          </div>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 shrink-0 font-sirac-title">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          EN LÍNEA
        </span>
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {feedItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-sirac-sub">
            No hay actividad reciente registrada en el taller.
          </div>
        ) : (
          feedItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#18263d]/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-[#1e324f]/60"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${item.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {item.ticketNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-sirac-sub">
                      {item.time}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-sirac-title truncate">
                    {item.device} • {item.client}
                  </p>

                  <p className="text-[11px] text-slate-400 font-sirac-sub">
                    {item.action}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer System Status */}
      <div className="pt-2 border-t border-slate-100 dark:border-[#1e324f] flex items-center justify-between text-[11px] font-sirac-sub text-slate-400">
        <span>Sincronización WebSocket</span>
        <span className="text-emerald-500 font-bold font-mono">LATENCIA &lt; 20ms</span>
      </div>
    </div>
  );
}
