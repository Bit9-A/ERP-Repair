import prisma from "../../config/prisma";

// ── Marcas ──

export async function findAllMarcas() {
  return prisma.marca.findMany({
    include: { modelos: { orderBy: { nombre: "asc" } } },
    orderBy: { nombre: "asc" },
  });
}

export async function createMarca(nombre: string) {
  return prisma.marca.create({
    data: { nombre: nombre.trim() },
    include: { modelos: true },
  });
}

export async function deleteMarca(id: string) {
  await prisma.marca.delete({ where: { id } });
  return { message: "Marca eliminada" };
}

// ── Modelos ──

export async function findModelosByMarca(marcaId: string) {
  return prisma.modelo.findMany({
    where: { marcaId },
    orderBy: { nombre: "asc" },
  });
}

export async function createModelo(marcaId: string, nombre: string) {
  return prisma.modelo.create({
    data: { marcaId, nombre: nombre.trim() },
  });
}

export async function deleteModelo(id: string) {
  await prisma.modelo.delete({ where: { id } });
  return { message: "Modelo eliminado" };
}
