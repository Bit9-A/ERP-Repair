import prisma from "../../config/prisma";

export async function findAll(search?: string) {
  return prisma.producto.findMany({
    where: search
      ? {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { nombre: "asc" },
  });
}

export async function findById(id: string) {
  const product = await prisma.producto.findUnique({ where: { id } });
  if (!product)
    throw Object.assign(new Error("Producto no encontrado"), {
      statusCode: 404,
    });
  return product;
}

export async function create(data: {
  sku: string;
  nombre: string;
  categoria: string;
  stock_actual?: number;
  stock_minimo?: number;
  costo_usd: number;
  precio_usd: number;
}) {
  return prisma.producto.create({ data });
}

export async function update(
  id: string,
  data: Partial<{
    sku: string;
    nombre: string;
    categoria: string;
    stock_actual: number;
    stock_minimo: number;
    costo_usd: number;
    precio_usd: number;
  }>,
) {
  return prisma.producto.update({ where: { id }, data });
}

export async function remove(id: string) {
  await prisma.producto.delete({ where: { id } });
  return { message: "Producto eliminado" };
}

export async function getLowStock() {
  return prisma.producto.findMany({
    where: {
      stock_actual: { lte: prisma.producto.fields.stock_minimo ? 0 : 0 },
    },
    orderBy: { stock_actual: "asc" },
  });
}

export async function getStats() {
  const [total, lowStock, valuation] = await Promise.all([
    prisma.producto.count(),
    prisma.producto.count({
      where: {
        stock_actual: { gt: 0 },
        // Prisma doesn't support field-to-field comparison directly,
        // so we use raw query for low stock or filter client-side
      },
    }),
    prisma.producto.aggregate({
      _sum: { precio_usd: true },
    }),
  ]);

  return {
    totalProducts: total,
    totalValue: valuation._sum.precio_usd || 0,
  };
}
