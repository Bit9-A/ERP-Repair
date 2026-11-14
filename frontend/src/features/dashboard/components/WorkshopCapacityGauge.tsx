import { AlertTriangle, ShieldCheck, Zap, Activity } from "lucide-react";

interface WorkshopCapacityGaugeProps {
  activeTickets: number;
  maxCapacity?: number;
}

export function WorkshopCapacityGauge({
  activeTickets,
  maxCapacity = 30,
}: WorkshopCapacityGaugeProps) {
  const porcentaje = Math.min(
    Math.round((activeTickets / maxCapacity) * 100),
    100
  );

  // Workshop operational load states
  const estado =
    porcentaje >= 85
      ? {
          nivel: "SATURADO",
          color: "#EF4444",
          bgColor: "bg-rose-500/10",
          borderColor: "border-rose-500/30",
          textColor: "text-rose-500 dark:text-rose-400",
          icono: AlertTriangle,
          mensaje: "Capacidad de mesas al límite. Priorizar entregas antes de nuevos ingresos.",
        }
      : porcentaje >= 60
      ? {
          nivel: "CARGA MEDIA",
          color: "#F59E0B",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-500 dark:text-amber-400",
          icono: Zap,
          mensaje: "Ritmo de taller activo con rotación continua de diagnósticos.",
        }
      : {
          nivel: "ÓPTIMO",
          color: "#10B981",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/30",
          textColor: "text-emerald-500 dark:text-emerald-400",
          icono: ShieldCheck,
          mensaje: "Disponibilidad de bancos técnicos para recepción inmediata.",
        };

  const IconoEstado = estado.icono;

  // Semicírculo Radial SVG Calculation
  const radius = 64;
  const strokeWidth = 12;
  const circumference = Math.PI * radius; // Half-circle length
  const strokeDashoffset = circumference - (porcentaje / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs dark:shadow-md dark:shadow-[#070d18]/40 flex flex-col justify-between space-y-4">
      {/* Background glow overlay */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: estado.color }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-[#1e324f]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white font-sirac-title truncate">
              Capacidad Operativa de Taller
            </h3>
            <p className="text-[11px] text-slate-400 font-sirac-sub truncate">
              Ocupación de estaciones de trabajo técnico
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 shrink-0 font-sirac-title ${estado.bgColor} ${estado.borderColor} ${estado.textColor}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: estado.color }}
          />
          {estado.nivel}
        </span>
      </div>

      {/* Semicircle SVG Gauge */}
      <div className="flex flex-col items-center justify-center py-1">
        <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
          <svg viewBox="0 0 160 85" className="w-full h-full overflow-visible">
            {/* Background Arc */}
            <path
              d="M 16 80 A 64 64 0 0 1 144 80"
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="text-slate-100 dark:text-[#18263d]"
            />
            {/* Value Arc */}
            <path
              d="M 16 80 A 64 64 0 0 1 144 80"
              fill="none"
              stroke={estado.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: "stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </svg>

          {/* Number Overlay in Center */}
          <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
            <span className="text-2xl font-black font-heading text-slate-900 dark:text-white leading-none">
              {porcentaje}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 font-sirac-title uppercase tracking-widest mt-0.5">
              Ocupación
            </span>
          </div>
        </div>

        {/* Counter Details */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs font-sirac-sub">
          <div className="text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">En Reparación</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{activeTickets}</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-[#1e324f]" />
          <div className="text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Cupo Máximo</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-100">{maxCapacity}</span>
          </div>
          <div className="h-4 w-px bg-slate-200 dark:bg-[#1e324f]" />
          <div className="text-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Bancos Libres</span>
            <span className="font-mono font-bold text-emerald-500">{Math.max(0, maxCapacity - activeTickets)}</span>
          </div>
        </div>
      </div>

      {/* Footer Insight Box */}
      <div className={`p-2.5 rounded-xl border flex items-start gap-2 ${estado.bgColor} ${estado.borderColor}`}>
        <IconoEstado className={`w-4 h-4 shrink-0 mt-0.5 ${estado.textColor}`} />
        <p className="text-[11px] font-sirac-sub leading-tight text-slate-700 dark:text-slate-300">
          {estado.mensaje}
        </p>
      </div>
    </div>
  );
}
