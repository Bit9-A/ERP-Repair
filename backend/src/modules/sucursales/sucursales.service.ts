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
