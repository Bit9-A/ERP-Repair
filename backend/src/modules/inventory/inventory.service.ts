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
  sucursalId?: string; // Feature 3
}) {
  // Feature 3: If sucursalId, join to SucursalProducto
  if (filters?.sucursalId) {
    const spRows = await prisma.sucursalProducto.findMany({
      where: { sucursalId: filters.sucursalId, producto: { activo: true } },
      include: { producto: true },
    });
    let productos = spRows.map((sp) => ({
      ...sp.producto,
      stock_sucursal: sp.stock,
    }));

    if (filters.search) {
      const s = filters.search.toLowerCase();
      productos = productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s),
      );
    }
    if (filters.categoria) {
      productos = productos.filter((p) => p.categoria === filters.categoria);
    }
    return productos;
  }

  return prisma.producto.findMany({
    where: {
      activo: true,
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
      movimientos: {
        take: 30,
        orderBy: { createdAt: "desc" },
        include: { sucursal: { select: { id: true, nombre: true } } },
      },
      inventario_sucursales: {
        include: { sucursal: { select: { id: true, nombre: true } } },
      },
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
  sucursalId?: string; // Feature 3: asignar a sucursal inicial
  costo_unitario_usd?: number; // Feature 2: costo del proveedor
}) {
  const initialStock = data.stock_actual ?? 0;

  const product = await prisma.producto.create({
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
  });

  if (initialStock > 0) {
    // Feature 2: guardar costo del proveedor en el movimiento
    await prisma.movimientoStock.create({
      data: {
        productoId: product.id,
        tipo: "ENTRADA",
        cantidad: initialStock,
        nota: "Stock inicial al crear producto",
        costo_unitario_usd: data.costo_unitario_usd ?? data.costo_usd,
        actualizar_costo: false,
        sucursalId: data.sucursalId,
      },
    });

    // Feature 3: crear el stock en la sucursal
    if (data.sucursalId) {
      await prisma.sucursalProducto.create({
        data: {
          sucursalId: data.sucursalId,
          productoId: product.id,
          stock: initialStock,
        },
      });
    }

    const costoTotal = data.costo_usd * initialStock;
    await prisma.transaccionFinanciera.create({
      data: {
        tipo: "EGRESO",
        monto_usd: parseFloat(costoTotal.toFixed(2)),
        concepto: `Compra de inventario: ${data.nombre} (x${initialStock})`,
        categoria: "INVENTARIO",
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

// ── Add stock (Feature 2: precio proveedor) ──

export async function addStock(
  id: string,
  data: {
    cantidad: number;
    nota?: string;
    costo_unitario_usd?: number; // Feature 2: precio de esta entrada
    actualizar_costo?: boolean; // Feature 2: ¿actualizar el costo del producto?
    sucursalId?: string; // Feature 3: en qué sucursal entra el stock
  },
) {
  const product = await prisma.producto.findUnique({ where: { id } });
  if (!product)
    throw Object.assign(new Error("Producto no encontrado"), {
      statusCode: 404,
    });

  return prisma.$transaction(async (tx) => {
    // Feature 2: registrar el costo del proveedor en el movimiento
    await tx.movimientoStock.create({
      data: {
        productoId: id,
        tipo: "ENTRADA",
        cantidad: data.cantidad,
        nota: data.nota || "Entrada de inventario",
        costo_unitario_usd: data.costo_unitario_usd,
        actualizar_costo: data.actualizar_costo ?? false,
        sucursalId: data.sucursalId,
      },
    });

    // Feature 2: si se elige actualizar el costo base, actualizarlo
    const updateData: {
      stock_actual: { increment: number };
      costo_usd?: number;
    } = {
      stock_actual: { increment: data.cantidad },
    };
    if (data.actualizar_costo && data.costo_unitario_usd != null) {
      updateData.costo_usd = data.costo_unitario_usd;
    }

    const updated = await tx.producto.update({
      where: { id },
      data: updateData,
    });

    // Feature 3: incrementar stock en la sucursal
    if (data.sucursalId) {
      await tx.sucursalProducto.upsert({
        where: {
          sucursalId_productoId: {
            sucursalId: data.sucursalId,
            productoId: id,
          },
        },
        update: { stock: { increment: data.cantidad } },
        create: {
          sucursalId: data.sucursalId,
          productoId: id,
          stock: data.cantidad,
        },
      });
    }

    // Registrar gasto en finanzas
    const costoUnitario = data.costo_unitario_usd ?? product.costo_usd;
    const costoTotal = costoUnitario * data.cantidad;
    await tx.transaccionFinanciera.create({
      data: {
        tipo: "EGRESO",
        monto_usd: parseFloat(costoTotal.toFixed(2)),
        concepto: `Compra de inventario: ${product.nombre} (x${data.cantidad}) a $${costoUnitario}/u`,
        categoria: "INVENTARIO",
      },
    });

    return updated;
  });
}

// ── Stock adjustment (manual) ──

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

  return prisma.$transaction(async (tx) => {
    await tx.movimientoStock.create({
      data: {
        productoId: id,
        tipo: "AJUSTE",
        cantidad,
        nota: nota || "Ajuste manual",
      },
    });

    return tx.producto.update({
      where: { id },
      data: { stock_actual: { increment: cantidad } },
    });
  });
}

// ── Delete ──

export async function remove(id: string) {
  const product = await prisma.producto.findUnique({ where: { id } });
  if (!product) throw new Error("Producto no encontrado");
  if (product.stock_actual > 0) {
    throw Object.assign(
      new Error(
        "No se puede desactivar un producto con stock existente en el inventario.",
      ),
      { statusCode: 400 },
    );
  }

  await prisma.producto.update({
    where: { id },
    data: { activo: false },
  });
  return { message: "Producto desactivado correctamente" };
}

// ── Low stock alerts ──

export async function getLowStock() {
  const all = await prisma.producto.findMany({
    where: { stock_actual: { gt: 0 }, activo: true },
    orderBy: { stock_actual: "asc" },
  });
  return all.filter((p) => p.stock_actual <= p.stock_minimo);
}

// ── Stats ──

export async function getStats() {
  const [total, productos] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    prisma.producto.findMany({
      where: { activo: true },
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

// ── Movement history (Feature 2: include supplier price) ──

export async function getMovimientos(productoId: string) {
  return prisma.movimientoStock.findMany({
    where: { productoId },
    include: {
      sucursal: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ── Price history for a product (Feature 2) ──

export async function getHistorialPrecios(productoId: string) {
  return prisma.movimientoStock.findMany({
    where: {
      productoId,
      tipo: "ENTRADA",
      costo_unitario_usd: { not: null },
    },
    select: {
      id: true,
      createdAt: true,
      cantidad: true,
      costo_unitario_usd: true,
      actualizar_costo: true,
      nota: true,
      sucursal: { select: { id: true, nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
