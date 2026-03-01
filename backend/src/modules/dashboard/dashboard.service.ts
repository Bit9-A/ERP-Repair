import prisma from "../../config/prisma";
import { getStats as getFinanceStats } from "../finance/finance.service";

export async function getDashboardData() {
  // 1. Kanban counts — parallel count per estado to avoid Prisma groupBy enum issues
  const [
    recibido,
    enRevision,
    esperandoRepuesto,
    reparado,
    entregado,
    abandono,
    activeTickets,
    financeStats,
    products,
  ] = await Promise.all([
    prisma.ticketReparacion.count({ where: { estado: "RECIBIDO" } }),
    prisma.ticketReparacion.count({ where: { estado: "EN_REVISION" } }),
    prisma.ticketReparacion.count({ where: { estado: "ESPERANDO_REPUESTO" } }),
    prisma.ticketReparacion.count({ where: { estado: "REPARADO" } }),
    prisma.ticketReparacion.count({ where: { estado: "ENTREGADO" } }),
    prisma.ticketReparacion.count({ where: { estado: "ABANDONO" } }),
    prisma.ticketReparacion.count({ where: { estado: { not: "ENTREGADO" } } }),
    getFinanceStats(),
    prisma.producto.findMany({
      select: { stock_actual: true, stock_minimo: true },
    }),
  ]);

  const kanbanCounts = {
    RECIBIDO: recibido,
    EN_REVISION: enRevision,
    ESPERANDO_REPUESTO: esperandoRepuesto,
    REPARADO: reparado,
    ENTREGADO: entregado,
    ABANDONO: abandono,
  };

  const lowStockCount = products.filter(
    (p) => p.stock_actual > 0 && p.stock_actual <= p.stock_minimo,
  ).length;

  return {
    kanbanCounts,
    metrics: {
      activeTickets,
      waitingParts: esperandoRepuesto,
      lowStockCount,
      todayRevenue: financeStats.ingresosHoy,
    },
  };
}
