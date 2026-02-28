import prisma from "../../config/prisma";
import type { EstadoVenta } from "../../generated/prisma/client";

// ── Queries ──

export async function findAll(filters?: {
  estado?: EstadoVenta;
  clienteId?: string;
}) {
  return prisma.venta.findMany({
    where: {
      ...(filters?.estado && { estado: filters.estado }),
      ...(filters?.clienteId && { clienteId: filters.clienteId }),
    },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      vendedor: { select: { id: true, nombre: true } },
      items: {
        include: {
          producto: { select: { nombre: true, sku: true, categoria: true } },
        },
      },
      pagos: { include: { moneda: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string) {
  const venta = await prisma.venta.findUnique({
    where: { id },
    include: {
      cliente: true,
      vendedor: { select: { id: true, nombre: true } },
      items: { include: { producto: true } },
      pagos: { include: { moneda: true } },
    },
  });
  if (!venta)
    throw Object.assign(new Error("Venta no encontrada"), { statusCode: 404 });
  return venta;
}

// ── Create sale ──

interface CreateVentaDTO {
  clienteId?: string;
  vendedorId?: string;
  descuento_usd?: number;
  items: Array<{
    productoId: string;
    cantidad: number;
  }>;
  // Opcional: registrar el pago de una vez
  pago?: {
    monedaId: string;
    monto_moneda_local: number;
    equivalente_usd: number;
    metodo: "EFECTIVO" | "PAGO_MOVIL" | "ZELLE" | "TRANSFERENCIA" | "BINANCE";
    referencia?: string;
  };
}

export async function create(data: CreateVentaDTO) {
  // 1. Validate stock for all items
  const productos = await Promise.all(
    data.items.map(async (item) => {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId },
      });
      if (!producto)
        throw Object.assign(
          new Error(`Producto ${item.productoId} no encontrado`),
          { statusCode: 404 },
        );
      if (producto.stock_actual < item.cantidad)
        throw Object.assign(
          new Error(
            `Stock insuficiente para ${producto.nombre}: ${producto.stock_actual} disponibles`,
          ),
          { statusCode: 400 },
        );
      return { ...item, producto };
    }),
  );

  // 2. Calculate totals
  const subtotal = productos.reduce(
    (sum, i) => sum + i.producto.precio_usd * i.cantidad,
    0,
  );
  const descuento = data.descuento_usd ?? 0;
  const total = Math.max(0, subtotal - descuento);

  // 3. Transaction: create venta + items + stock movements + update stock
  const venta = await prisma.$transaction(async (tx) => {
    // Create the sale
    const newVenta = await tx.venta.create({
      data: {
        clienteId: data.clienteId,
        vendedorId: data.vendedorId,
        subtotal_usd: parseFloat(subtotal.toFixed(2)),
        descuento_usd: parseFloat(descuento.toFixed(2)),
        total_usd: parseFloat(total.toFixed(2)),
        estado: "PAGADA",
      },
    });

    // Create sale items + stock movements + update stock
    for (const item of productos) {
      await tx.venta_Producto.create({
        data: {
          ventaId: newVenta.id,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precio_congelado_usd: item.producto.precio_usd,
          costo_congelado_usd: item.producto.costo_usd,
        },
      });

      await tx.movimientoStock.create({
        data: {
          productoId: item.productoId,
          tipo: "SALIDA_VENTA",
          cantidad: -item.cantidad,
          referencia: `Venta ${newVenta.id}`,
        },
      });

      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock_actual: { decrement: item.cantidad } },
      });
    }

    // Register payment if provided
    if (data.pago) {
      await tx.pago.create({
        data: {
          ventaId: newVenta.id,
          monedaId: data.pago.monedaId,
          monto_moneda_local: data.pago.monto_moneda_local,
          equivalente_usd: data.pago.equivalente_usd,
          metodo: data.pago.metodo,
          referencia: data.pago.referencia,
        },
      });
    }

    return newVenta;
  });

  // Return with full relations
  return findById(venta.id);
}

// ── Mark as paid ──

export async function marcarPagada(id: string) {
  return prisma.venta.update({
    where: { id },
    data: { estado: "PAGADA" },
  });
}

// ── Cancel sale (return stock) ──

export async function anular(id: string) {
  const venta = await prisma.venta.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!venta)
    throw Object.assign(new Error("Venta no encontrada"), { statusCode: 404 });
  if (venta.estado === "ANULADA")
    throw Object.assign(new Error("Venta ya está anulada"), {
      statusCode: 400,
    });

  // Transaction: return stock + create movements + update status
  await prisma.$transaction(async (tx) => {
    for (const item of venta.items) {
      await tx.movimientoStock.create({
        data: {
          productoId: item.productoId,
          tipo: "DEVOLUCION",
          cantidad: item.cantidad,
          referencia: `Anulación Venta ${venta.id}`,
        },
      });

      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock_actual: { increment: item.cantidad } },
      });
    }

    await tx.venta.update({
      where: { id },
      data: { estado: "ANULADA" },
    });
  });

  return { message: "Venta anulada y stock devuelto" };
}

// ── Stats ──

export async function getStats() {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [ventasHoy, totalVentas, ingresosHoy] = await Promise.all([
    prisma.venta.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        estado: { not: "ANULADA" },
      },
    }),
    prisma.venta.count({ where: { estado: { not: "ANULADA" } } }),
    prisma.venta.aggregate({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        estado: { not: "ANULADA" },
      },
      _sum: { total_usd: true },
    }),
  ]);

  return {
    ventasHoy,
    totalVentas,
    ingresosHoyUSD: ingresosHoy._sum.total_usd || 0,
  };
}
