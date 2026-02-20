import prisma from "../../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import type { RolUsuario, TipoContrato } from "@prisma/client";

// ── Auth ──

export async function login(email: string, password: string) {
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user)
    throw Object.assign(new Error("Credenciales inválidas"), {
      statusCode: 401,
    });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid)
    throw Object.assign(new Error("Credenciales inválidas"), {
      statusCode: 401,
    });

  const token = jwt.sign({ userId: user.id, rol: user.rol }, env.JWT_SECRET, {
    expiresIn: "8h",
  });

  const { password_hash: _, ...userSafe } = user;
  return { token, user: userSafe };
}

export async function me(userId: string) {
  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user)
    throw Object.assign(new Error("Usuario no encontrado"), {
      statusCode: 404,
    });

  const { password_hash: _, ...userSafe } = user;
  return userSafe;
}

// ── CRUD ──

export async function findAll() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      rol: true,
      email: true,
      tipo_contrato: true,
      salario_base_usd: true,
      porcentaje_comision_base: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string) {
  const user = await prisma.usuario.findUnique({
    where: { id },
    include: {
      tickets_reparados: { take: 10, orderBy: { fecha_ingreso: "desc" } },
    },
  });
  if (!user)
    throw Object.assign(new Error("Usuario no encontrado"), {
      statusCode: 404,
    });

  const { password_hash: _, ...userSafe } = user;
  return userSafe;
}

interface CreateUserDTO {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  tipo_contrato?: TipoContrato;
  salario_base_usd?: number;
  porcentaje_comision_base?: number;
}

export async function create(data: CreateUserDTO) {
  const hash = await bcrypt.hash(data.password, 10);
  const user = await prisma.usuario.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      password_hash: hash,
      rol: data.rol,
      tipo_contrato: data.tipo_contrato,
      salario_base_usd: data.salario_base_usd,
      porcentaje_comision_base: data.porcentaje_comision_base,
    },
  });

  const { password_hash: _, ...userSafe } = user;
  return userSafe;
}

export async function update(
  id: string,
  data: Partial<Omit<CreateUserDTO, "password">> & { password?: string },
) {
  const updateData: Record<string, unknown> = { ...data };
  if (data.password) {
    updateData["password_hash"] = await bcrypt.hash(data.password, 10);
    delete updateData["password"];
  }

  const user = await prisma.usuario.update({ where: { id }, data: updateData });
  const { password_hash: _, ...userSafe } = user;
  return userSafe;
}

export async function remove(id: string) {
  await prisma.usuario.delete({ where: { id } });
  return { message: "Usuario eliminado" };
}
