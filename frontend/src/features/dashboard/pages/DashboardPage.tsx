import {
  SimpleGrid,
  Stack,
  LoadingOverlay,
  Button,
} from "@mantine/core";
import {
  Wrench,
  Clock,
  DollarSign,
  AlertTriangle,
  Plus,
  ShoppingCart,
  Calendar,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard";
import { KanbanPreview } from "../components/KanbanPreview";
import { RecentTickets } from "../components/RecentTickets";
import { QuickActions } from "../components/QuickActions";
import { DashboardCharts } from "../components/DashboardCharts";
import { useAuthStore } from "../../auth/store/auth.store";
import { useDashboardData, useFinanceStats } from "../../../services";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: dashboardData, isLoading, refetch, isRefetching } = useDashboardData();
  const { data: financeStats } = useFinanceStats();

  const { kanbanCounts, metrics } = dashboardData || {
    kanbanCounts: {
      RECIBIDO: 0,
      EN_REVISION: 0,
      ESPERANDO_REPUESTO: 0,
      REPARADO: 0,
      ENTREGADO: 0,
      ABANDONO: 0,
    },
    metrics: {
      activeTickets: 0,
      waitingParts: 0,
      lowStockCount: 0,
      todayRevenue: 0,
    },
  };

  const { activeTickets, waitingParts, lowStockCount } = metrics;
  const todayRevenue = financeStats?.ingresosHoy ?? metrics.todayRevenue ?? 0;
  const counts: Record<string, number> = kanbanCounts as unknown as Record<
    string,
    number
  >;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const currentDateFormatted = dayjs().format("dddd, D [de] MMMM [de] YYYY");

  return (
    <Stack gap="xl" pos="relative" className="pb-10 font-sans">
      <LoadingOverlay visible={isLoading} overlayProps={{ blur: 1 }} />

      {/* ── Executive Hero Header (70% Sirac + 30% Sigepat) ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[24px] p-6 lg:p-8 bg-gradient-to-r from-[#0b1320] via-[#131f33] to-[#18263d] text-white shadow-xl border border-[#1e324f]"
      >
        {/* SIGEPAT watermark decorative icon */}
        <Wrench className="absolute -right-6 -bottom-6 w-56 h-56 text-blue-400/[0.03] dark:text-blue-400/[0.04] pointer-events-none rotate-12" />

        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            {/* Top Badge line */}
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 uppercase tracking-widest font-sirac-title">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                SISTEMA EN LÍNEA • SIRAC ENGINE
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-full capitalize font-sirac-sub border border-white/5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {currentDateFormatted}
              </span>
            </div>

            {/* Title / Greeting */}
            <h1 className="text-2xl lg:text-3xl font-bold font-sirac-title text-white tracking-wide flex items-center gap-2.5">
              <span>{getGreeting()}, {user?.nombre || "Administrador"}</span>
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 hidden sm:inline-block" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1 max-w-xl font-sirac-sub font-normal">
              Panel centralizado de control operativo, rendimiento técnico de laboratorio e inventario institucional.
            </p>
          </div>

          {/* Quick Primary CTA Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin text-blue-400" : ""}`} />
            </button>

            <Button
              variant="default"
              leftSection={<ShoppingCart className="w-4 h-4 text-amber-400" />}
              onClick={() => navigate("/ventas")}
              className="bg-[#18263d]/80 hover:bg-[#18263d] text-white border-[#294163] rounded-xl text-xs font-semibold h-10 px-4 transition-all font-sirac-title tracking-wide"
            >
              Punto de Venta
            </Button>

            <Button
              variant="filled"
              leftSection={<Plus className="w-4 h-4 text-white" />}
              onClick={() => navigate("/reparaciones")}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-600/30 text-xs font-bold h-10 px-5 transition-all font-sirac-title tracking-wider uppercase"
            >
              Nueva Orden
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── KPI Row (4 Key Metrics) ── */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <StatCard
          title="Órdenes Activas"
          value={activeTickets}
          icon={<Wrench className="w-5 h-5" />}
          accentColor="#22C55E"
          subtitle="En proceso de laboratorio"
          trend={{ value: `${activeTickets} en cola`, isPositive: true, label: "taller" }}
          onClick={() => navigate("/reparaciones")}
        />
        <StatCard
          title="En Espera Repuesto"
          value={String(waitingParts).padStart(2, "0")}
          icon={<Clock className="w-5 h-5" />}
          accentColor="#F59E0B"
          subtitle="Piezas por recibir"
          trend={{ value: "Demora", isPositive: false, label: "atención" }}
          onClick={() => navigate("/reparaciones")}
        />
        <StatCard
          title="Ingresos Hoy"
          value={`$${todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="#3B82F6"
          subtitle="Caja diaria en USD"
          trend={{ value: "+100%", isPositive: true, label: "facturado" }}
          onClick={() => navigate("/finanzas")}
        />
        <StatCard
          title="Alertas de Stock"
          value={String(lowStockCount).padStart(2, "0")}
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor="#EF4444"
          subtitle={lowStockCount > 0 ? "Reponer artículos críticos" : "Niveles de stock correctos"}
          trend={{ value: `${lowStockCount} ítems`, isPositive: lowStockCount === 0, label: "mínimo" }}
          onClick={() => navigate("/inventario")}
        />
      </SimpleGrid>

      {/* ── Visual Analytics: Technical Capacity & Financials ── */}
      <DashboardCharts
        kanbanCounts={counts}
        metrics={metrics}
        financeStats={financeStats}
      />

      {/* ── Bottom Section: Work Orders + Kanban + Quick Actions ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders (7 cols) */}
        <div className="xl:col-span-7">
          <RecentTickets />
        </div>

        {/* Right Column: Workflow Preview + Fast Actions (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          <KanbanPreview counts={counts} />
          <QuickActions />
        </div>
      </div>
    </Stack>
  );
}
