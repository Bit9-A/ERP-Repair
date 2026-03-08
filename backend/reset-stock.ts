import "dotenv/config";
import prisma from "./src/config/prisma";

async function run() {
  console.log("Revisando inconsistencias de inventario...");
  const productos = await prisma.producto.findMany({
    include: { inventario_sucursales: true },
  });

  let fixed = 0;
  for (const p of productos) {
    const sum = p.inventario_sucursales.reduce(
      (acc, inv) => acc + inv.stock,
      0,
    );
    if (p.stock_actual !== sum) {
      console.log(`Corregido ${p.nombre}: ${p.stock_actual} -> ${sum}`);
      await prisma.producto.update({
        where: { id: p.id },
        data: { stock_actual: sum },
      });
      fixed++;
    }
  }

  console.log(`Listo. ${fixed} productos corregidos.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
