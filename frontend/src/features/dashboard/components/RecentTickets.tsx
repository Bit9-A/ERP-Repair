import {
  Text,
  LoadingOverlay,
} from "@mantine/core";
import { Ticket, ArrowRight, Laptop, Smartphone, ShieldCheck, ChevronRight } from "lucide-react";
import { TicketStatusBadge } from "../../../components/ui/StatusBadge";
import { useRepairs } from "../../../services";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/es";

dayjs.extend(relativeTime);
dayjs.locale("es");

function getDeviceIcon(tipo?: string) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("laptop") || t.includes("computadora") || t.includes("pc")) {
    return <Laptop className="w-3.5 h-3.5 text-blue-500" />;
  }
  return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
}

export function RecentTickets() {
  const navigate = useNavigate();
  const { data: repairs = [], isLoading } = useRepairs();

  // Show the 6 most recent tickets
  const recentTickets = [...repairs]
    .sort(
      (a, b) =>
        new Date(b.fecha_ingreso).getTime() -
        new Date(a.fecha_ingreso).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-[#131f33] border border-slate-200/90 dark:border-[#1e324f] shadow-xs dark:shadow-md dark:shadow-[#070d18]/40 transition-all">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1, radius: "lg" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <Text size="sm" fw={700} className="font-sirac-title text-slate-900 dark:text-white tracking-wide">
              Órdenes de Servicio Recientes
            </Text>
            <Text size="xs" className="text-slate-400 dark:text-slate-400 font-sirac-sub">
              Últimos ingresos al taller de soporte
            </Text>
          </div>
        </div>

        <button
          onClick={() => navigate("/reparaciones")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors group cursor-pointer font-sirac-title tracking-wider uppercase text-[11px]"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {recentTickets.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#18263d] flex items-center justify-center text-slate-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <Text size="sm" fw={600} className="text-slate-700 dark:text-slate-300 font-sirac-title">
            No hay órdenes registradas
          </Text>
          <Text size="xs" className="text-slate-400 max-w-xs mt-1 font-sirac-sub">
            Crea una nueva orden de servicio desde el botón superior o el panel de acciones rápidas.
          </Text>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-[#1e324f]/60">
          {recentTickets.map((ticket, index) => {
            const timeAgo = dayjs(ticket.fecha_ingreso).fromNow();
            const clienteNombre = ticket.cliente?.nombre || "Cliente Particular";
            const initials = clienteNombre
              .split(" ")
              .slice(0, 2)
              .map((n: string) => n[0])
              .join("")
              .toUpperCase();

            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                onClick={() => navigate("/reparaciones")}
                className="group flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-[#18263d]/50 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#18263d] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-[#294163] flex items-center justify-center text-xs font-bold font-sirac-title shrink-0">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        #{ticket.id.substring(0, 6)}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate font-sirac-title">
                        {clienteNombre}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-400 dark:text-slate-400 font-sirac-sub">
                      {getDeviceIcon(ticket.tipo_equipo)}
                      <span className="truncate">
                        {ticket.marca} {ticket.modelo}
                      </span>
                      <span>•</span>
                      <span className="capitalize">{timeAgo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-3">
                  <TicketStatusBadge status={ticket.estado} />
                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
