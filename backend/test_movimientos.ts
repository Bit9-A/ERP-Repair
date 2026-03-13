import "dotenv/config";
import prisma from "./src/config/prisma";
import { transferirStock } from "./src/modules/sucursales/sucursales.service";
import { addStock } from "./src/modules/inventory/inventory.service";

async function main() {
  console.log("Setting up test data...");

  // 1. Get an active user (ADMIN)
  const user = await prisma.usuario.findFirst({ where: { rol: "ADMIN" } });
  if (!user) {
    console.log("No ADMIN user found.");
    return;
  }
  console.log("Using user:", user.nombre, user.id);

  // 2. Get two active branches
  const sucursales = await prisma.sucursal.findMany({ where: { activa: true }, take: 2 });
  if (sucursales.length < 2) {
    console.log("Need at least 2 active branches.");
    return;
  }
  const branch1 = sucursales[0];
  const branch2 = sucursales[1];
  console.log("Using branches:", branch1.nombre, "->", branch2.nombre);

  // 3. Get a product
  const producto = await prisma.producto.findFirst();
  if (!producto) {
    console.log("No product found.");
    return;
  }
  console.log("Using product:", producto.nombre, producto.id);

  // 4. Test Add Stock
  console.log("\n--- Testing Add Stock ---");
  await addStock(producto.id, {
    cantidad: 10,
    sucursalId: branch1.id,
    nota: "Test Add Stock",
    usuarioId: user.id
  });
  // Let me check my previous edit. Yes I did!

  const testAddMovs = await prisma.movimientoStock.findMany({
    where: { productoId: producto.id, tipo: "ENTRADA", nota: "Test Add Stock" },
    orderBy: { createdAt: "desc" },
    take: 1,
    include: { usuario: true }
  });
  console.log("Add Stock Movement created:", !!testAddMovs.length);
  if (testAddMovs[0]) {
    console.log("Usuario in Movement:", testAddMovs[0].usuario?.nombre);
  }

  // 5. Test Transfer
  console.log("\n--- Testing Transfer ---");
  await transferirStock({
    productoId: producto.id,
    cantidad: 2,
    origenId: branch1.id,
    destinoId: branch2.id,
    usuarioId: user.id
  });

  const testTransMovs = await prisma.movimientoStock.findMany({
    where: { productoId: producto.id, tipo: "TRASLADO" as any },
    orderBy: { createdAt: "desc" },
    take: 2,
    include: { usuario: true }
  });
  console.log("Transfer Movements created:", testTransMovs.length);
  testTransMovs.forEach((m: any) => {
    console.log(`Movement (Sucursal ${m.sucursalId}):`, m.cantidad, "User:", m.usuario?.nombre);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
