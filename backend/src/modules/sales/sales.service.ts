import prisma from "../../config/prisma";
import type { EstadoVenta } from "../../generated/prisma/client";

// ── Queries ──

export async function findAll(filters?: {
  estado?: EstadoVenta;
  clienteId?: string;
  sucursalId?: string; // Feature 3
}) {
  return prisma.venta.findMany({
    where: {
      ...(filters?.estado && { estado: filters.estado }),
      ...(filters?.clienteId && { clienteId: filters.clienteId }),
      ...(filters?.sucursalId && { sucursalId: filters.sucursalId }),
    },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      vendedor: { select: { id: true, nombre: true } },
      sucursal: { select: { id: true, nombre: true } },
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
      sucursal: { select: { id: true, nombre: true } },
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
  sucursalId?: string; // Feature 3
  descuento_usd?: number;
  items: Array<{
    productoId: string;
    cantidad: number;
  }>;
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
        include: { inventario_sucursales: true },
      });
      if (!producto)
        throw Object.assign(
          new Error(`Producto ${item.productoId} no encontrado`),
          { statusCode: 404 },
        );

      let localStock = producto.stock_actual;
      if (data.sucursalId) {
        const branchStock = producto.inventario_sucursales.find(
          (inv) => inv.sucursalId === data.sucursalId,
        );
        localStock = branchStock?.stock || 0;
      }

      if (localStock < item.cantidad)
        throw Object.assign(
          new Error(
            `Stock insuficiente para ${producto.nombre}: ${localStock} disponibles en esta sucursal`,
          ),
          { statusCode: 400 },
        );
      return { ...item, producto };
    }),
  );

  // 2. Feature 1: Snapshot de tasas de cambio actuales
  const monedas = await prisma.moneda.findMany({
    where: { codigo: { not: "USD" } },
  });
  const tasas_cambio_snapshot: Record<string, number> = {};
  for (const m of monedas) {
    tasas_cambio_snapshot[m.codigo] = m.tasa_cambio;
  }

  // 3. Calculate totals
  const subtotal = productos.reduce(
    (sum, i) => sum + i.producto.precio_usd * i.cantidad,
    0,
  );
  const descuento = data.descuento_usd ?? 0;
  const total = Math.max(0, subtotal - descuento);

  // 4. Transaction
  const venta = await prisma.$transaction(async (tx) => {
    // Determine exchange rate for the payment currency (Feature 1)
    let tasaCambio: number | undefined;
    if (data.pago) {
      const moneda = await tx.moneda.findUnique({
        where: { id: data.pago.monedaId },
      });
      tasaCambio = moneda?.tasa_cambio;
    }

    const newVenta = await tx.venta.create({
      data: {
        clienteId: data.clienteId,
        vendedorId: data.vendedorId,
        sucursalId: data.sucursalId, // Feature 3
        subtotal_usd: parseFloat(subtotal.toFixed(2)),
        descuento_usd: parseFloat(descuento.toFixed(2)),
        total_usd: parseFloat(total.toFixed(2)),
        estado: "PAGADA",
        tasas_cambio_snapshot, // Feature 1
      },
    });

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
          sucursalId: data.sucursalId, // Feature 3
        },
      });

      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock_actual: { decrement: item.cantidad } },
      });

      // Feature 3: descontar stock de la sucursal
      if (data.sucursalId) {
        await tx.sucursalProducto.upsert({
          where: {
            sucursalId_productoId: {
              sucursalId: data.sucursalId,
              productoId: item.productoId,
            },
          },
          update: { stock: { decrement: item.cantidad } },
          create: {
            sucursalId: data.sucursalId,
            productoId: item.productoId,
            stock: 0,
          },
        });
      }
    }

    if (data.pago) {
      await tx.pago.create({
        data: {
          ventaId: newVenta.id,
          monedaId: data.pago.monedaId,
          monto_moneda_local: data.pago.monto_moneda_local,
          equivalente_usd: data.pago.equivalente_usd,
          metodo: data.pago.metodo,
          referencia: data.pago.referencia,
          tasa_cambio_usada: tasaCambio, // Feature 1
        },
      });

      await tx.transaccionFinanciera.create({
        data: {
          tipo: "INGRESO",
          monto_usd: parseFloat(data.pago.equivalente_usd.toFixed(2)),
          concepto: `Venta Comercial #${newVenta.numero || newVenta.id.slice(0, 8)}`,
          categoria: "VENTA",
          ventaId: newVenta.id,
        },
      });
    }

    return newVenta;
  });

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

  await prisma.$transaction(async (tx) => {
    for (const item of venta.items) {
      await tx.movimientoStock.create({
        data: {
          productoId: item.productoId,
          tipo: "DEVOLUCION",
          cantidad: item.cantidad,
          referencia: `Anulación Venta ${venta.id}`,
          sucursalId: venta.sucursalId,
        },
      });

      await tx.producto.update({
        where: { id: item.productoId },
        data: { stock_actual: { increment: item.cantidad } },
      });

      // Feature 3: devolver stock a la sucursal
      if (venta.sucursalId) {
        await tx.sucursalProducto.upsert({
          where: {
            sucursalId_productoId: {
              sucursalId: venta.sucursalId,
              productoId: item.productoId,
            },
          },
          update: { stock: { increment: item.cantidad } },
          create: {
            sucursalId: venta.sucursalId,
            productoId: item.productoId,
            stock: item.cantidad,
          },
        });
      }
    }

    await tx.venta.update({
      where: { id },
      data: { estado: "ANULADA" },
    });
  });

  return { message: "Venta anulada y stock devuelto" };
}

// ── Stats ──

export async function getStats(sucursalId?: string) {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const sucursalFilter = sucursalId ? { sucursalId } : {};

  const [ventasHoy, totalVentas, ingresosHoy] = await Promise.all([
    prisma.venta.count({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        estado: { not: "ANULADA" },
        ...sucursalFilter,
      },
    }),
    prisma.venta.count({
      where: { estado: { not: "ANULADA" }, ...sucursalFilter },
    }),
    prisma.venta.aggregate({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        estado: { not: "ANULADA" },
        ...sucursalFilter,
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
