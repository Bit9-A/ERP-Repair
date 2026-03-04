import prisma from "../../config/prisma";

// ── Queries ──

export async function findAll() {
  return prisma.sucursal.findMany({
    include: {
      _count: {
        select: { usuarios: true, ventas: true, tickets: true },
      },
    },
    orderBy: { nombre: "asc" },
  });
}

export async function findById(id: string) {
  const sucursal = await prisma.sucursal.findUnique({
    where: { id },
    include: {
      usuarios: { select: { id: true, nombre: true, rol: true, email: true } },
      _count: { select: { inventario: true, ventas: true, tickets: true } },
    },
  });
  if (!sucursal)
    throw Object.assign(new Error("Sucursal no encontrada"), {
      statusCode: 404,
    });
  return sucursal;
}

// Inventario de una sucursal
export async function getInventario(sucursalId: string) {
  return prisma.sucursalProducto.findMany({
    where: { sucursalId },
    include: {
      producto: {
        select: {
          id: true,
          sku: true,
          nombre: true,
          categoria: true,
          precio_usd: true,
          costo_usd: true,
          stock_minimo: true,
        },
      },
    },
    orderBy: { producto: { nombre: "asc" } },
  });
}

// ── Create ──

export async function create(data: { nombre: string; direccion?: string }) {
  return prisma.sucursal.create({ data });
}

// ── Update ──

export async function update(
  id: string,
  data: Partial<{ nombre: string; direccion: string; activa: boolean }>,
) {
  return prisma.sucursal.update({ where: { id }, data });
}

// ── Delete ──

export async function remove(id: string) {
  await prisma.sucursal.delete({ where: { id } });
  return { message: "Sucursal eliminada" };
}

// ── Inventario total (admin) ──

export async function getInventarioTotal() {
  const productos = await prisma.producto.findMany({
    include: {
      inventario_sucursales: {
        include: { sucursal: { select: { id: true, nombre: true } } },
      },
    },
    orderBy: { nombre: "asc" },
  });
  return productos;
}

// ── Traslado de mercancía entre sucursales ──

export async function transferirStock(data: {
  origenId: string;
  destinoId: string;
  productoId: string;
  cantidad: number;
}) {
  if (data.origenId === data.destinoId) {
    throw Object.assign(
      new Error("Origen y destino no pueden ser la misma sucursal"),
      { statusCode: 400 },
    );
  }
  if (data.cantidad <= 0) {
    throw Object.assign(new Error("La cantidad debe ser mayor a 0"), {
      statusCode: 400,
    });
  }

  // Verify origin has enough stock
  const spOrigen = await prisma.sucursalProducto.findUnique({
    where: {
      sucursalId_productoId: {
        sucursalId: data.origenId,
        productoId: data.productoId,
      },
    },
  });
  if (!spOrigen || spOrigen.stock < data.cantidad) {
    throw Object.assign(
      new Error(
        `Stock insuficiente en sucursal origen (disponible: ${spOrigen?.stock ?? 0})`,
      ),
      { statusCode: 400 },
    );
  }

  return prisma.$transaction(async (tx) => {
    // 1. Decrement origin branch
    await tx.sucursalProducto.update({
      where: {
        sucursalId_productoId: {
          sucursalId: data.origenId,
          productoId: data.productoId,
        },
      },
      data: { stock: { decrement: data.cantidad } },
    });

    // 2. Increment (or create) destination branch entry
    await tx.sucursalProducto.upsert({
      where: {
        sucursalId_productoId: {
          sucursalId: data.destinoId,
          productoId: data.productoId,
        },
      },
      update: { stock: { increment: data.cantidad } },
      create: {
        sucursalId: data.destinoId,
        productoId: data.productoId,
        stock: data.cantidad,
      },
    });

    // 3. Movement log — origin (negative adjustment)
    await tx.movimientoStock.create({
      data: {
        productoId: data.productoId,
        tipo: "AJUSTE",
        cantidad: -data.cantidad,
        nota: `Traslado saliente hacia sucursal destino`,
        sucursalId: data.origenId,
      },
    });

    // 4. Movement log — destination (entry)
    await tx.movimientoStock.create({
      data: {
        productoId: data.productoId,
        tipo: "ENTRADA",
        cantidad: data.cantidad,
        nota: `Traslado entrante desde sucursal origen`,
        sucursalId: data.destinoId,
      },
    });

    return { success: true, cantidad: data.cantidad };
  });
}
