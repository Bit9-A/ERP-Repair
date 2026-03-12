import prisma from "../../config/prisma";
import { convertToUSD } from "../../core/utils/currency";

// ── Monedas ──

export async function findAllMonedas() {
  return prisma.moneda.findMany({ orderBy: { codigo: "asc" } });
}

export async function updateTasa(id: string, tasa_cambio: number) {
  return prisma.moneda.update({ where: { id }, data: { tasa_cambio } });
}

export async function createMoneda(data: {
  codigo: string;
  nombre?: string;
  tasa_cambio: number;
}) {
  return prisma.moneda.create({ data });
}

// ── Pagos ──

export async function registrarPago(data: {
  ticketId?: string;
  ventaId?: string;
  monedaId: string;
  monto_moneda_local: number;
  metodo: string;
  referencia?: string;
}) {
  // Get currency rate to calculate USD equivalent
  const moneda = await prisma.moneda.findUnique({
    where: { id: data.monedaId },
  });
  if (!moneda)
    throw Object.assign(new Error("Moneda no encontrada"), { statusCode: 404 });

  const equivalente_usd = convertToUSD(
    data.monto_moneda_local,
    moneda.tasa_cambio,
  );

  return prisma.$transaction(async (tx) => {
    const pago = await tx.pago.create({
      data: {
        ticketId: data.ticketId,
        ventaId: data.ventaId,
        monedaId: data.monedaId,
        monto_moneda_local: data.monto_moneda_local,
        equivalente_usd,
        metodo:
          data.metodo as import("../../generated/prisma/client").$Enums.MetodoPago,
        referencia: data.referencia,
      },
      include: { moneda: true },
    });

    // Determine category and concept
    let categoria = "OPERATIVO";
    let concepto = `Pago recibido - ${data.metodo}`;

    if (data.ticketId) {
      categoria = "REPARACION";
      concepto = `Cobro Ticket #${data.ticketId.slice(0, 8)}`;
    } else if (data.ventaId) {
      categoria = "VENTA";
      concepto = `Cobro Venta #${data.ventaId.slice(0, 8)}`;
    }

    await tx.transaccionFinanciera.create({
      data: {
        tipo: "INGRESO",
        monto_usd: parseFloat(equivalente_usd.toFixed(2)),
        concepto,
        categoria,
        ticket: data.ticketId ? { connect: { id: data.ticketId } } : undefined,
        venta: data.ventaId ? { connect: { id: data.ventaId } } : undefined,
      },
    });

    return pago;
  });
}

type Periodo = "dia" | "semana" | "mes" | string;

function getDateRange(periodo: Periodo = "dia"): { start: Date; end: Date } {
  if (typeof periodo === "string" && /^\d{4}-\d{2}$/.test(periodo)) {
    const [year, month] = periodo.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return { start, end };
  }

  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (periodo === "dia") {
    start.setHours(0, 0, 0, 0);
  } else if (periodo === "semana") {
    // Monday of current week
    const day = start.getDay(); // 0=Sun, 1=Mon ...
    const diff = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diff);
    start.setHours(0, 0, 0, 0);
  } else if (periodo === "mes") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end };
}

export async function findPagosByDate(periodo?: Periodo) {
  const { start: startOfDay, end: endOfDay } = getDateRange(periodo);

  return prisma.pago.findMany({
    where: {
      fecha_pago: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      moneda: true,
      ticket: {
        select: {
          id: true,
          equipo: true,
          marca: true,
          modelo: true,
          cliente: { select: { nombre: true } },
        },
      },
      venta: {
        select: {
          id: true,
          numero: true,
          total_usd: true,
          items: {
            include: {
              producto: {
                select: {
                  nombre: true,
                  marca_comp: true,
                  modelo_comp: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { fecha_pago: "desc" },
  });
}

// ── Cierre de Caja ──

export async function cierreDeCaja(fecha?: string) {
  const today = fecha ? new Date(fecha) : new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const pagos = await prisma.pago.findMany({
    where: { fecha_pago: { gte: startOfDay, lte: endOfDay } },
    include: { moneda: true },
  });

  // Group by method
  const porMetodo: Record<string, number> = {};
  let totalUSD = 0;

  for (const pago of pagos) {
    const metodo = pago.metodo;
    porMetodo[metodo] = (porMetodo[metodo] || 0) + pago.equivalente_usd;
    totalUSD += pago.equivalente_usd;
  }

  // Group by currency
  const porMoneda: Record<string, number> = {};
  for (const pago of pagos) {
    const code = pago.moneda.codigo;
    porMoneda[code] = (porMoneda[code] || 0) + pago.monto_moneda_local;
  }

  return {
    fecha: today.toISOString().split("T")[0],
    totalPagos: pagos.length,
    totalUSD: parseFloat(totalUSD.toFixed(2)),
    porMetodo,
    porMoneda,
  };
}

import { processRecurringExpenses } from "./recurringFinance.service";

// ── Stats ──

export async function getStats(periodo?: Periodo) {
  // Always trigger recurring expense processing when stats are requested
  await processRecurringExpenses();

  const { start: startOfDay, end: endOfDay } = getDateRange(periodo);

  const [ingresosHoy, egresosHoy, totalPagos] = await Promise.all([
    prisma.transaccionFinanciera.aggregate({
      where: {
        tipo: "INGRESO",
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { monto_usd: true },
      _count: true,
    }),
    prisma.transaccionFinanciera.aggregate({
      where: {
        tipo: "EGRESO",
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      _sum: { monto_usd: true },
      _count: true,
    }),
    prisma.pago.count(),
  ]);

  const ingresos = ingresosHoy._sum.monto_usd || 0;
  const egresos = egresosHoy._sum.monto_usd || 0;

  return {
    ingresosHoy: parseFloat(ingresos.toFixed(2)),
    egresosHoy: parseFloat(egresos.toFixed(2)),
    balanceHoy: parseFloat((ingresos - egresos).toFixed(2)),
    ticketsCobradosHoy: ingresosHoy._count,
    cantidadEgresosHoy: egresosHoy._count,
    totalPagosHistorico: totalPagos,
  };
}

// ── Egresos (Gastos) ──

export async function createEgreso(data: {
  monto_usd: number;
  concepto: string;
  categoria?: string;
  esFijo?: boolean;
}) {
  return prisma.transaccionFinanciera.create({
    data: {
      tipo: "EGRESO",
      monto_usd: data.monto_usd,
      concepto: data.concepto,
      categoria: data.categoria || "OTROS",
      esFijo: data.esFijo || false,
    },
  });
}

export async function getEgresos(periodo?: Periodo) {
  await processRecurringExpenses();
  const { start: startOfDay, end: endOfDay } = getDateRange(periodo);

  return prisma.transaccionFinanciera.findMany({
    where: {
      tipo: "EGRESO",
      createdAt: { gte: startOfDay, lte: endOfDay },
    },
    include: {
      ticket: {
        select: {
          id: true,
          marca: true,
          modelo: true,
        },
      },
      producto: {
        select: {
          id: true,
          marca_comp: true,
          modelo_comp: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteEgreso(id: string) {
  return prisma.transaccionFinanciera.delete({
    where: { id },
  });
}
