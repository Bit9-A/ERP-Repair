import prisma from "../../config/prisma";

// ── CRUD ──

export async function findAll() {
  return prisma.cliente.findMany({
    orderBy: { nombre: "asc" },
    include: {
      _count: { select: { tickets: true, ventas: true } },
    },
  });
}

export async function findById(id: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      tickets: { take: 10, orderBy: { fecha_ingreso: "desc" } },
      ventas: { take: 10, orderBy: { createdAt: "desc" } },
    },
  });
  if (!cliente)
    throw Object.assign(new Error("Cliente no encontrado"), {
      statusCode: 404,
    });
  return cliente;
}

export async function findByCedula(cedula: string) {
  return prisma.cliente.findUnique({
    where: { cedula },
    include: {
      _count: { select: { tickets: true, ventas: true } },
    },
  });
}

interface CreateClienteDTO {
  nombre: string;
  cedula: string;
  telefono: string;
  correo?: string;
}

export async function create(data: CreateClienteDTO) {
  return prisma.cliente.create({ data });
}

export async function update(
  id: string,
  data: Partial<Omit<CreateClienteDTO, "cedula">>,
) {
  return prisma.cliente.update({ where: { id }, data });
}

export async function remove(id: string) {
  await prisma.cliente.delete({ where: { id } });
  return { message: "Cliente eliminado" };
}
