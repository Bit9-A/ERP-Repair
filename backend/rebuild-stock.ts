import "dotenv/config";
import prisma from "./src/config/prisma";
import fs from "fs";

async function rebuildStock() {
  console.log("Recalculando stock desde Movimientos históricos...");

  let sucursalPrincipal = await prisma.sucursal.findFirst({
    where: { principal: true },
  });
  if (!sucursalPrincipal) {
    sucursalPrincipal = await prisma.sucursal.findFirst({
      where: { activa: true },
    });
  }
  if (!sucursalPrincipal)
    throw new Error("No hay sucursales activas en el sistema.");

  console.log(
    `Sucursal destinataria del stock huérfano: ${sucursalPrincipal.nombre}`,
  );

  const productos = await prisma.producto.findMany();

  for (const producto of productos) {
    const movimientos = await prisma.movimientoStock.findMany({
      where: { productoId: producto.id },
    });

    let stockGlobal = 0;
    const stockPorSucursal: Record<string, number> = {};
    let stockHuerfano = 0;

    for (const mov of movimientos) {
      stockGlobal += mov.cantidad;
      if (mov.sucursalId) {
        stockPorSucursal[mov.sucursalId] =
          (stockPorSucursal[mov.sucursalId] || 0) + mov.cantidad;
      } else {
        stockHuerfano += mov.cantidad;
      }
    }

    if (stockHuerfano !== 0) {
      stockPorSucursal[sucursalPrincipal.id] =
        (stockPorSucursal[sucursalPrincipal.id] || 0) + stockHuerfano;
    }

    /* Omit update global for a test to see what fails */
    for (const [sucursalId, cantidad] of Object.entries(stockPorSucursal)) {
      await prisma.sucursalProducto.upsert({
        where: {
          sucursalId_productoId: { sucursalId, productoId: producto.id },
        },
        update: { stock: Math.max(0, cantidad) },
        create: {
          sucursalId,
          productoId: producto.id,
          stock: Math.max(0, cantidad),
        },
      });
    }

    await prisma.producto.update({
      where: { id: producto.id },
      data: { stock_actual: Math.max(0, stockGlobal) },
    });
  }

  console.log("Inventario sincronizado exitosamente.");
}

rebuildStock()
  .catch((e) => fs.writeFileSync("error.txt", e.message))
  .finally(() => prisma.$disconnect());
