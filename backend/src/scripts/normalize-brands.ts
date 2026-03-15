import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
} as any);

async function main() {
  console.log("--- Iniciando normalización de Marcas y Modelos ---");

  // 1. Normalizar Marcas
  const marcas = await prisma.marca.findMany();
  console.log(`Encontradas ${marcas.length} marcas.`);

  for (const marca of marcas) {
    const nombreNormalizado = marca.nombre.trim().toUpperCase();
    if (marca.nombre !== nombreNormalizado) {
      await prisma.marca.update({
        where: { id: marca.id },
        data: { nombre: nombreNormalizado },
      });
      console.log(
        `Marca actualizada: "${marca.nombre}" -> "${nombreNormalizado}"`,
      );
    }
  }

  // 2. Normalizar Modelos
  const modelos = await prisma.modelo.findMany();
  console.log(`Encontrados ${modelos.length} modelos.`);

  for (const modelo of modelos) {
    const nombreNormalizado = modelo.nombre.trim().toUpperCase();
    if (modelo.nombre !== nombreNormalizado) {
      await prisma.modelo.update({
        where: { id: modelo.id },
        data: { nombre: nombreNormalizado },
      });
      console.log(
        `Modelo actualizado: "${modelo.nombre}" -> "${nombreNormalizado}"`,
      );
    }
  }

  console.log("--- Normalización completada con éxito ---");
}

main()
  .catch((e) => {
    console.error("Error durante la normalización:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
