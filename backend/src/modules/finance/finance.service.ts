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
        metodo: data.metodo,
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
        ticketId: data.ticketId,
        ventaId: data.ventaId,
      },
    });

    return pago;
  });
}

export async function findPagosByDate(fecha?: string) {
  const today = fecha ? new Date(fecha) : new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

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

// ── Stats ──

export async function getStats() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

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
