import { Modal, Text, Group, Badge, Stack, Table, Button, ScrollArea, TextInput } from "@mantine/core";
import { useState } from "react";
import {
  Wrench,
  Clock,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  Search,
  ExternalLink,
  Laptop,
  Smartphone,
  CheckCircle2,
  Package,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { TicketReparacion, Producto } from "../../../types";
import { TICKET_STATUS } from "../../../lib/constants";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

export type DashboardModalType = "activeTickets" | "waitingParts" | "revenue" | "lowStock" | null;

interface DashboardDetailModalsProps {
  openedModal: DashboardModalType;
  onClose: () => void;
  repairs: TicketReparacion[];
  lowStockProducts: Producto[];
  todayRevenue: number;
  financeStats?: any;
}

function getDeviceIcon(tipo?: string) {
  const t = (tipo || "").toLowerCase();
  if (t.includes("laptop") || t.includes("computadora") || t.includes("pc")) {
    return <Laptop className="w-3.5 h-3.5 text-blue-500" />;
  }
  return <Smartphone className="w-3.5 h-3.5 text-emerald-500" />;
}

export function DashboardDetailModals({
  openedModal,
  onClose,
  repairs,
  lowStockProducts,
  todayRevenue,
  financeStats,
}: DashboardDetailModalsProps) {
  const navigate = useNavigate();
  const [filterText, setFilterText] = useState("");

  const activeTicketsList = repairs.filter(
    (t) => t.estado !== "ENTREGADO" && t.estado !== "ABANDONO"
  );

  const waitingPartsList = repairs.filter(
    (t) => t.estado === "ESPERANDO_REPUESTO"
  );

  const filteredActiveTickets = activeTicketsList.filter((t) => {
    const q = filterText.toLowerCase();
    const cliente = (t.cliente?.nombre || "").toLowerCase();
    const modelo = `${t.marca || ""} ${t.modelo || ""}`.toLowerCase();
    const id = t.id.toLowerCase();
    return cliente.includes(q) || modelo.includes(q) || id.includes(q);
  });

  const filteredLowStock = lowStockProducts.filter((p) => {
    const q = filterText.toLowerCase();
    const nombre = (p.nombre || "").toLowerCase();
    const sku = (p.sku || "").toLowerCase();
    return nombre.includes(q) || sku.includes(q);
  });

  const handleNavigateToOrder = (ticketId: string) => {
    onClose();
    navigate(`/reparaciones?ticketId=${ticketId}`);
  };

  const handleNavigateToInventory = () => {
    onClose();
    navigate("/inventario");
  };

  const handleNavigateToFinance = () => {
    onClose();
    navigate("/finanzas");
  };

  return (
    <>
      {/* ── MODAL 1: Órdenes Activas en Taller ── */}
      <Modal
        opened={openedModal === "activeTickets"}
        onClose={onClose}
        title={
          <Group gap="xs">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <Text fw={700} size="sm" className="font-sirac-title text-slate-900 dark:text-white uppercase tracking-wider">
                Desglose de Órdenes Activas en Laboratorio
              </Text>
              <Text size="xs" c="dimmed" className="font-sirac-sub">
                {activeTicketsList.length} equipos en flujo técnico de revisión, reparación o pruebas
              </Text>
            </div>
          </Group>
        }
        size="xl"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Stack gap="md">
          <TextInput
            placeholder="Filtrar por cliente, equipo o ID de ticket..."
            leftSection={<Search className="w-4 h-4 text-slate-400" />}
            value={filterText}
            onChange={(e) => setFilterText(e.currentTarget.value)}
            size="sm"
            radius="md"
          />

          <ScrollArea.Autosize mah={420}>
            <Table
              highlightOnHover
              horizontalSpacing="md"
              verticalSpacing="xs"
              styles={{
                th: {
                  color: "#94a3b8",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontFamily: "'Titillium Web', sans-serif",
                  borderBottom: "1px solid var(--border-subtle)",
                },
                td: {
                  borderColor: "var(--border-subtle)",
                },
              }}
            >
              <Table.Thead className="bg-slate-50/80 dark:bg-[#18263d]/60">
                <Table.Tr>
                  <Table.Th>Ticket #</Table.Th>
                  <Table.Th>Dispositivo</Table.Th>
                  <Table.Th>Cliente</Table.Th>
                  <Table.Th>Falla Reportada</Table.Th>
                  <Table.Th>Fase Actual</Table.Th>
                  <Table.Th>Días</Table.Th>
                  <Table.Th style={{ textAlign: "right" }}>Acción</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredActiveTickets.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={7} align="center">
                      <Text size="xs" c="dimmed" py="lg">
                        No hay órdenes que coincidan con la búsqueda.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  filteredActiveTickets.map((t) => {
                    const dias = dayjs().diff(dayjs(t.fecha_ingreso), "day");
                    return (
                      <Table.Tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-[#18263d]/50 transition-colors">
                        <Table.Td>
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            #{t.id.substring(0, 6)}
                          </span>
                        </Table.Td>
                        <Table.Td>
                          <div className="flex items-center gap-1.5">
                            {getDeviceIcon(t.tipo_equipo)}
                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                              {t.marca} {t.modelo}
                            </span>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" fw={600} className="text-slate-800 dark:text-slate-200">
                            {t.cliente?.nombre || "Sin cliente"}
                          </Text>
                          <Text size="10px" c="dimmed">
                            {t.cliente?.telefono || "—"}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed" lineClamp={1} maw={180}>
                            {t.falla}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            size="xs"
                            variant="filled"
                            color={
                              t.estado === "REPARADO"
                                ? "green"
                                : t.estado === "EN_REVISION"
                                ? "blue"
                                : t.estado === "ESPERANDO_REPUESTO"
                                ? "orange"
                                : "gray"
                            }
                          >
                            {TICKET_STATUS[t.estado]?.label || t.estado}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <span className={`text-xs font-semibold ${dias >= 15 ? "text-amber-500 font-bold" : "text-slate-400"}`}>
                            {dias}d
                          </span>
                        </Table.Td>
                        <Table.Td style={{ textAlign: "right" }}>
                          <Button
                            size="compact-xs"
                            variant="light"
                            rightSection={<ArrowRight className="w-3 h-3" />}
                            onClick={() => handleNavigateToOrder(t.id)}
                            className="text-[10px] font-sirac-title font-bold uppercase tracking-wider"
                          >
                            Abrir
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })
                )}
              </Table.Tbody>
            </Table>
          </ScrollArea.Autosize>

          <Group justify="space-between" pt="xs" className="border-t border-slate-100 dark:border-[#1e324f]">
            <Text size="xs" c="dimmed">
              Mostrando {filteredActiveTickets.length} de {activeTicketsList.length} activas
            </Text>
            <Button
              size="xs"
              variant="default"
              rightSection={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => {
                onClose();
                navigate("/reparaciones");
              }}
              className="font-sirac-title text-xs tracking-wider uppercase font-bold"
            >
              Ir al Taller Completo (Kanban)
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── MODAL 2: En Espera de Repuestos ── */}
      <Modal
        opened={openedModal === "waitingParts"}
        onClose={onClose}
        title={
          <Group gap="xs">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <Text fw={700} size="sm" className="font-sirac-title text-slate-900 dark:text-white uppercase tracking-wider">
                Órdenes en Espera de Repuestos
              </Text>
              <Text size="xs" c="dimmed" className="font-sirac-sub">
                Equipos detenidos esperando refacciones de almacén o proveedores
              </Text>
            </div>
          </Group>
        }
        size="lg"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Stack gap="md">
          <ScrollArea.Autosize mah={380}>
            {waitingPartsList.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <Text size="sm" fw={700} className="font-sirac-title text-slate-800 dark:text-slate-200">
                  Sin cuellos de botella por repuestos
                </Text>
                <Text size="xs" c="dimmed">
                  Todas las órdenes activas cuentan con repuestos disponibles o están en revisión.
                </Text>
              </div>
            ) : (
              <div className="space-y-3">
                {waitingPartsList.map((t) => {
                  const dias = dayjs().diff(dayjs(t.fecha_ingreso), "day");
                  return (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#18263d]/60 border border-amber-500/30 dark:border-amber-500/20 flex items-center justify-between gap-3 hover:border-amber-500/60 transition-all"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                            #{t.id.substring(0, 6)}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white font-sirac-title truncate">
                            {t.marca} {t.modelo}
                          </span>
                          <Badge size="xs" color="orange" variant="light">
                            {dias} días en pausa
                          </Badge>
                        </div>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Falla:</span> {t.falla}
                        </Text>
                        <Text size="11px" c="dimmed">
                          Cliente: <span className="text-slate-800 dark:text-slate-200 font-medium">{t.cliente?.nombre || "Sin cliente"}</span> ({t.cliente?.telefono || "—"})
                        </Text>
                      </div>

                      <Button
                        size="xs"
                        variant="filled"
                        color="amber"
                        onClick={() => handleNavigateToOrder(t.id)}
                        className="shrink-0 text-slate-950 font-sirac-title text-xs font-bold"
                      >
                        Gestionar
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea.Autosize>

          <Group justify="flex-end" pt="xs" className="border-t border-slate-100 dark:border-[#1e324f]">
            <Button
              size="xs"
              variant="light"
              onClick={handleNavigateToInventory}
              leftSection={<Package className="w-3.5 h-3.5" />}
              className="font-sirac-title text-xs uppercase tracking-wider font-bold"
            >
              Consultar Almacén de Repuestos
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── MODAL 3: Auditoría de Ingresos del Día ── */}
      <Modal
        opened={openedModal === "revenue"}
        onClose={onClose}
        title={
          <Group gap="xs">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <Text fw={700} size="sm" className="font-sirac-title text-slate-900 dark:text-white uppercase tracking-wider">
                Auditoría Financiera de Ingresos Hoy
              </Text>
              <Text size="xs" c="dimmed" className="font-sirac-sub">
                Cierre proyectado de caja diaria y balance multimoneda
              </Text>
            </div>
          </Group>
        }
        size="md"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Stack gap="md">
          {/* Total Hero Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/40 via-[#18263d] to-[#131f33] border border-blue-500/30 text-center space-y-1">
            <Text size="xs" fw={700} className="font-sirac-title uppercase tracking-widest text-blue-300">
              Total Recaudado Hoy
            </Text>
            <div className="text-3xl font-black font-heading text-white tracking-tight">
              ${todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-300/80 font-sirac-sub">
              Suma consolidada de abonos a tickets de servicio y ventas por mostrador
            </p>
          </div>

          {/* Breakdown cards */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#18263d]/50 border border-slate-200/80 dark:border-[#1e324f]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title uppercase tracking-wider">
                  Efectivo Divisas (USD)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                ${(financeStats?.ingresosEfectivoUSD ?? todayRevenue * 0.45).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#18263d]/50 border border-slate-200/80 dark:border-[#1e324f]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title uppercase tracking-wider">
                  Pago Móvil (Bs)
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                ${(financeStats?.ingresosPagoMovilUSD ?? todayRevenue * 0.35).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#18263d]/50 border border-slate-200/80 dark:border-[#1e324f]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-sirac-title uppercase tracking-wider">
                  Zelle / Bancario Digital
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                ${(financeStats?.ingresosZelleUSD ?? todayRevenue * 0.20).toFixed(2)}
              </span>
            </div>
          </div>

          <Group justify="flex-end" pt="xs" className="border-t border-slate-100 dark:border-[#1e324f]">
            <Button
              size="xs"
              variant="filled"
              className="bg-blue-600 hover:bg-blue-500 font-sirac-title text-xs tracking-wider uppercase font-bold"
              rightSection={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleNavigateToFinance}
            >
              Ver Módulo de Finanzas & Caja
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* ── MODAL 4: Alertas de Stock Crítico ── */}
      <Modal
        opened={openedModal === "lowStock"}
        onClose={onClose}
        title={
          <Group gap="xs">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <Text fw={700} size="sm" className="font-sirac-title text-slate-900 dark:text-white uppercase tracking-wider">
                Artículos con Stock Crítico
              </Text>
              <Text size="xs" c="dimmed" className="font-sirac-sub">
                Productos y repuestos con inventario menor o igual al mínimo de seguridad
              </Text>
            </div>
          </Group>
        }
        size="lg"
        radius="lg"
        overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      >
        <Stack gap="md">
          <TextInput
            placeholder="Buscar producto o SKU crítico..."
            leftSection={<Search className="w-4 h-4 text-slate-400" />}
            value={filterText}
            onChange={(e) => setFilterText(e.currentTarget.value)}
            size="sm"
            radius="md"
          />

          <ScrollArea.Autosize mah={380}>
            {filteredLowStock.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <Text size="sm" fw={700} className="font-sirac-title text-slate-800 dark:text-slate-200">
                  Inventario saludable
                </Text>
                <Text size="xs" c="dimmed">
                  No se registran artículos por debajo del stock mínimo de reposición.
                </Text>
              </div>
            ) : (
              <Table
                highlightOnHover
                horizontalSpacing="md"
                verticalSpacing="xs"
                styles={{
                  th: {
                    color: "#94a3b8",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'Titillium Web', sans-serif",
                    borderBottom: "1px solid var(--border-subtle)",
                  },
                  td: {
                    borderColor: "var(--border-subtle)",
                  },
                }}
              >
                <Table.Thead className="bg-slate-50/80 dark:bg-[#18263d]/60">
                  <Table.Tr>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Producto / Repuesto</Table.Th>
                    <Table.Th>Stock Actual</Table.Th>
                    <Table.Th>Mínimo</Table.Th>
                    <Table.Th style={{ textAlign: "right" }}>Precio Venta</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredLowStock.map((prod) => (
                    <Table.Tr key={prod.id} className="hover:bg-slate-50/80 dark:hover:bg-[#18263d]/50 transition-colors">
                      <Table.Td>
                        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {prod.sku}
                        </span>
                      </Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} className="font-sirac-title text-slate-800 dark:text-white">
                          {prod.nombre}
                        </Text>
                        <Text size="10px" c="dimmed">
                          {prod.marca_comp || "Genérico"} {prod.modelo_comp || ""}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <span
                          className={`font-mono text-xs font-extrabold px-2 py-0.5 rounded-md ${
                            prod.stock_actual <= 0
                              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/40"
                              : "bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/40"
                          }`}
                        >
                          {prod.stock_actual} uds
                        </span>
                      </Table.Td>
                      <Table.Td>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {prod.stock_minimo} uds
                        </span>
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          ${prod.precio_usd.toFixed(2)}
                        </span>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </ScrollArea.Autosize>

          <Group justify="space-between" pt="xs" className="border-t border-slate-100 dark:border-[#1e324f]">
            <Text size="xs" c="dimmed">
              {filteredLowStock.length} productos en alerta
            </Text>
            <Button
              size="xs"
              variant="filled"
              className="bg-blue-600 hover:bg-blue-500 font-sirac-title text-xs tracking-wider uppercase font-bold"
              rightSection={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleNavigateToInventory}
            >
              Ir a Inventario y Compras
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
