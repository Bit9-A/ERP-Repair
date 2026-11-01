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
    <div className="relative overflow-hidden rounded-2xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] transition-all">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1, radius: "lg" }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20">
            <Ticket className="w-4 h-4" />
          </div>
          <div>
            <Text size="sm" fw={700} className="font-heading text-slate-900 dark:text-white">
              Órdenes de Servicio Recientes
            </Text>
            <Text size="xs" className="text-slate-400 dark:text-slate-500">
              Últimos ingresos al taller de soporte
            </Text>
          </div>
        </div>

        <button
          onClick={() => navigate("/reparaciones")}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors group cursor-pointer"
        >
          <span>Ver todas</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {recentTickets.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <Text size="sm" fw={600} className="text-slate-700 dark:text-slate-300">
            No hay órdenes registradas
          </Text>
          <Text size="xs" className="text-slate-400 max-w-xs mt-1">
            Crea una nueva orden de servicio desde el botón superior o el panel de acciones rápidas.
          </Text>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
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
                className="group flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
              >
                {/* Left: Avatar + Client & Device */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold font-heading shrink-0 ring-1 ring-blue-500/20">
                    {initials || "CL"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Text
                        size="xs"
                        fw={700}
                        className="text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate"
                      >
                        {clienteNombre}
                      </Text>
                      <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        #{ticket.id.substring(0, 6)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {getDeviceIcon(ticket.tipo_equipo)}
                      <span className="font-medium text-slate-600 dark:text-slate-300 truncate">
                        {ticket.marca} {ticket.modelo}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">
                        {ticket.falla || "Revisión general"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Price + Status + Time */}
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <div className="text-right hidden sm:block">
                    <Text size="xs" fw={700} className="font-heading text-slate-900 dark:text-white">
                      ${Number(ticket.precio_total_usd || 0).toFixed(2)}
                    </Text>
                    <Text size="xs" className="text-[10px] text-slate-400 dark:text-slate-500">
                      {timeAgo}
                    </Text>
                  </div>

                  <TicketStatusBadge status={ticket.estado} />

                  <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
