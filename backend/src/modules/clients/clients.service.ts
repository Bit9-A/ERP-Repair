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
  const clean = cedula.trim();
  const digits = clean.replace(/\D/g, "");

  // 1. Try exact match first
  let cliente = await prisma.cliente.findUnique({
    where: { cedula: clean },
    include: {
      _count: { select: { tickets: true, ventas: true } },
    },
  });

  // 2. If not found, search with or without prefix variations
  if (!cliente && digits.length >= 3) {
    cliente = await prisma.cliente.findFirst({
      where: {
        OR: [
          { cedula: digits },
          { cedula: `V-${digits}` },
          { cedula: `E-${digits}` },
          { cedula: `J-${digits}` },
          { cedula: `G-${digits}` },
          { cedula: `O-${digits}` },
          { cedula: { contains: digits } },
        ],
      },
      include: {
        _count: { select: { tickets: true, ventas: true } },
      },
    });
  }

  return cliente;
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
