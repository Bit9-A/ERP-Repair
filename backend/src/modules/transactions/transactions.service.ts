import prisma from "../../config/prisma";
import type { TipoTransaccion } from "../../generated/prisma/client";

// ── Queries ──

export async function findAll(filters?: {
  tipo?: TipoTransaccion;
  categoria?: string;
  desde?: string;
  hasta?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.tipo) where["tipo"] = filters.tipo;
  if (filters?.categoria) where["categoria"] = filters.categoria;

  if (filters?.desde || filters?.hasta) {
    const fechaFilter: Record<string, Date> = {};
    if (filters?.desde) fechaFilter["gte"] = new Date(filters.desde);
    if (filters?.hasta) {
      const hasta = new Date(filters.hasta);
      hasta.setHours(23, 59, 59, 999);
      fechaFilter["lte"] = hasta;
    }
    where["createdAt"] = fechaFilter;
  }

  return prisma.transaccionFinanciera.findMany({
    where,
    include: {
      ticket: { select: { id: true, equipo: true, marca: true, modelo: true } },
      venta: { select: { id: true, numero: true, total_usd: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Create transaction ──

interface CreateTransaccionDTO {
  tipo: TipoTransaccion;
  monto_usd: number;
  concepto: string;
  categoria?: string;
  ticketId?: string;
  ventaId?: string;
}

export async function create(data: CreateTransaccionDTO) {
  return prisma.transaccionFinanciera.create({
    data: {
      tipo: data.tipo,
      monto_usd: data.monto_usd,
      concepto: data.concepto,
      categoria: data.categoria,
      ticket: data.ticketId ? { connect: { id: data.ticketId } } : undefined,
      venta: data.ventaId ? { connect: { id: data.ventaId } } : undefined,
    },
  });
}

// ── Balance por rango de fechas ──

export async function getBalance(desde?: string, hasta?: string) {
  const where: Record<string, unknown> = {};

  if (desde || hasta) {
    const fechaFilter: Record<string, Date> = {};
    if (desde) fechaFilter["gte"] = new Date(desde);
    if (hasta) {
      const h = new Date(hasta);
      h.setHours(23, 59, 59, 999);
      fechaFilter["lte"] = h;
    }
    where["createdAt"] = fechaFilter;
  }

  const [ingresos, egresos] = await Promise.all([
    prisma.transaccionFinanciera.aggregate({
      where: { ...where, tipo: "INGRESO" },
      _sum: { monto_usd: true },
      _count: true,
    }),
    prisma.transaccionFinanciera.aggregate({
      where: { ...where, tipo: "EGRESO" },
      _sum: { monto_usd: true },
      _count: true,
    }),
  ]);

  const totalIngresos = ingresos._sum.monto_usd || 0;
  const totalEgresos = egresos._sum.monto_usd || 0;

  return {
    totalIngresos: parseFloat(totalIngresos.toFixed(2)),
    totalEgresos: parseFloat(totalEgresos.toFixed(2)),
    balanceNeto: parseFloat((totalIngresos - totalEgresos).toFixed(2)),
    cantidadIngresos: ingresos._count,
    cantidadEgresos: egresos._count,
  };
}

// ── Stats del día ──

export async function getStatsHoy() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  return getBalance(startOfDay.toISOString(), endOfDay.toISOString());
}

// ── Por categoría ──

export async function getByCategoria(desde?: string, hasta?: string) {
  const where: Record<string, unknown> = {};

  if (desde || hasta) {
    const fechaFilter: Record<string, Date> = {};
    if (desde) fechaFilter["gte"] = new Date(desde);
    if (hasta) {
      const h = new Date(hasta);
      h.setHours(23, 59, 59, 999);
      fechaFilter["lte"] = h;
    }
    where["createdAt"] = fechaFilter;
  }

  const transacciones = await prisma.transaccionFinanciera.findMany({
    where,
    select: { tipo: true, monto_usd: true, categoria: true },
  });

  const porCategoria: Record<string, { ingresos: number; egresos: number }> =
    {};

  for (const t of transacciones) {
    const cat = t.categoria || "SIN_CATEGORIA";
    if (!porCategoria[cat]) porCategoria[cat] = { ingresos: 0, egresos: 0 };
    if (t.tipo === "INGRESO") {
      porCategoria[cat]!.ingresos += t.monto_usd;
    } else {
      porCategoria[cat]!.egresos += t.monto_usd;
    }
  }

  return porCategoria;
}
