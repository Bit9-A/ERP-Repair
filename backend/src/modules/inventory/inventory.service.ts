import prisma from "../../config/prisma";
import type {
  CategoriaProducto,
  TipoPropiedad,
} from "../../generated/prisma/client";

// ── Queries ──

export async function findAll(filters?: {
  search?: string;
  categoria?: CategoriaProducto;
  propiedad?: TipoPropiedad;
}) {
  return prisma.producto.findMany({
    where: {
      ...(filters?.search && {
        OR: [
          {
            nombre: { contains: filters.search, mode: "insensitive" as const },
          },
          { sku: { contains: filters.search, mode: "insensitive" as const } },
        ],
      }),
      ...(filters?.categoria && { categoria: filters.categoria }),
      ...(filters?.propiedad && { propiedad: filters.propiedad }),
    },
    orderBy: { nombre: "asc" },
  });
}

export async function findById(id: string) {
  const product = await prisma.producto.findUnique({
    where: { id },
    include: {
      movimientos: { take: 20, orderBy: { createdAt: "desc" } },
    },
  });
  if (!product)
    throw Object.assign(new Error("Producto no encontrado"), {
      statusCode: 404,
    });
  return product;
}

// ── Create (with initial stock movement) ──

export async function create(data: {
  sku: string;
  nombre: string;
  marca_comp?: string;
  modelo_comp?: string;
  categoria?: CategoriaProducto;
  propiedad?: TipoPropiedad;
  propietario?: string;
  stock_actual?: number;
  stock_minimo?: number;
  costo_usd: number;
  precio_usd: number;
}) {
  const initialStock = data.stock_actual ?? 0;

  // Transaction: create product + initial stock movement
  const [product] = await prisma.$transaction([
    prisma.producto.create({
      data: {
        sku: data.sku,
        nombre: data.nombre,
        marca_comp: data.marca_comp,
        modelo_comp: data.modelo_comp,
        categoria: data.categoria || "REPUESTO",
        propiedad: data.propiedad || "PROPIA",
        propietario: data.propietario,
        stock_actual: initialStock,
        stock_minimo: data.stock_minimo ?? 2,
        costo_usd: data.costo_usd,
        precio_usd: data.precio_usd,
      },
    }),
    // We'll create the movement after we have the product id
    // So we do it in a sequential way below
  ]);

  // Register initial stock entry if stock > 0
  if (initialStock > 0) {
    await prisma.movimientoStock.create({
      data: {
        productoId: product.id,
        tipo: "ENTRADA",
        cantidad: initialStock,
        nota: "Stock inicial al crear producto",
      },
    });
  }

  return product;
}

// ── Update ──

export async function update(
  id: string,
  data: Partial<{
    sku: string;
    nombre: string;
    marca_comp: string;
    modelo_comp: string;
    categoria: CategoriaProducto;
    propiedad: TipoPropiedad;
    propietario: string;
    stock_minimo: number;
    costo_usd: number;
    precio_usd: number;
  }>,
) {
  return prisma.producto.update({ where: { id }, data });
}

// ── Stock adjustment (with movement tracking) ──

export async function adjustStock(id: string, cantidad: number, nota?: string) {
  const product = await prisma.producto.findUnique({ where: { id } });
  if (!product)
    throw Object.assign(new Error("Producto no encontrado"), {
      statusCode: 404,
    });

  const newStock = product.stock_actual + cantidad;
  if (newStock < 0) {
    throw Object.assign(
      new Error(`Stock insuficiente: ${product.stock_actual} disponibles`),
      { statusCode: 400 },
    );
  }

  return prisma.$transaction([
    prisma.movimientoStock.create({
      data: {
        productoId: id,
        tipo: cantidad > 0 ? "ENTRADA" : "AJUSTE",
        cantidad,
        nota:
          nota || (cantidad > 0 ? "Entrada de inventario" : "Ajuste manual"),
      },
    }),
    prisma.producto.update({
      where: { id },
      data: { stock_actual: { increment: cantidad } },
    }),
  ]);
}

// ── Delete ──

export async function remove(id: string) {
  await prisma.producto.delete({ where: { id } });
  return { message: "Producto eliminado" };
}

// ── Low stock alerts ──

export async function getLowStock() {
  const all = await prisma.producto.findMany({
    where: { stock_actual: { gt: 0 } },
    orderBy: { stock_actual: "asc" },
  });
  return all.filter((p) => p.stock_actual <= p.stock_minimo);
}

// ── Stats ──

export async function getStats() {
  const [total, productos] = await Promise.all([
    prisma.producto.count(),
    prisma.producto.findMany({
      select: {
        stock_actual: true,
        costo_usd: true,
        precio_usd: true,
        stock_minimo: true,
      },
    }),
  ]);

  const totalValue = productos.reduce(
    (sum, p) => sum + p.precio_usd * p.stock_actual,
    0,
  );
  const totalCost = productos.reduce(
    (sum, p) => sum + p.costo_usd * p.stock_actual,
    0,
  );
  const lowStockCount = productos.filter(
    (p) => p.stock_actual <= p.stock_minimo && p.stock_actual > 0,
  ).length;

  return {
    totalProducts: total,
    totalValue: parseFloat(totalValue.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2)),
    lowStockCount,
  };
}

// ── Movement history ──

export async function getMovimientos(productoId: string) {
  return prisma.movimientoStock.findMany({
    where: { productoId },
    orderBy: { createdAt: "desc" },
  });
}
