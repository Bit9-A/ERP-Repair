import prisma from "../../config/prisma";

export async function findAll() {
  return prisma.servicioCatalog.findMany({ orderBy: { nombre: "asc" } });
}

export async function findById(id: string) {
  const service = await prisma.servicioCatalog.findUnique({ where: { id } });
  if (!service)
    throw Object.assign(new Error("Servicio no encontrado"), {
      statusCode: 404,
    });
  return service;
}

export async function create(data: {
  nombre: string;
  precio_base_usd: number;
}) {
  return prisma.servicioCatalog.create({ data });
}

export async function update(
  id: string,
  data: Partial<{ nombre: string; precio_base_usd: number }>,
) {
  return prisma.servicioCatalog.update({ where: { id }, data });
}

export async function remove(id: string) {
  await prisma.servicioCatalog.delete({ where: { id } });
  return { message: "Servicio eliminado" };
}
