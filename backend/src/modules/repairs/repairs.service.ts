import prisma from "../../config/prisma";
import type { EstadoTicket } from "@prisma/client";
import { calcularComision } from "../../core/utils/currency";

// ── Queries ──

export async function findAll(filters?: {
  estado?: EstadoTicket;
  tecnicoId?: string;
}) {
  return prisma.ticketReparacion.findMany({
    where: {
      ...(filters?.estado && { estado: filters.estado }),
      ...(filters?.tecnicoId && { tecnicoId: filters.tecnicoId }),
    },
    include: {
      cliente: { select: { id: true, nombre: true, telefono: true } },
      tecnico: { select: { id: true, nombre: true, rol: true } },
      repuestos: {
        include: { producto: { select: { nombre: true, sku: true } } },
      },
      servicios: { include: { servicio: { select: { nombre: true } } } },
      pagos: true,
    },
    orderBy: { fecha_ingreso: "desc" },
  });
}

export async function findById(id: string) {
  const ticket = await prisma.ticketReparacion.findUnique({
    where: { id },
    include: {
      cliente: true,
      tecnico: {
        select: {
          id: true,
          nombre: true,
          rol: true,
          porcentaje_comision_base: true,
        },
      },
      repuestos: { include: { producto: true } },
      servicios: { include: { servicio: true } },
      pagos: { include: { moneda: true } },
    },
  });
  if (!ticket)
    throw Object.assign(new Error("Ticket no encontrado"), { statusCode: 404 });
  return ticket;
}

// ── Kanban stats ──

export async function getKanbanCounts() {
  const counts = await prisma.ticketReparacion.groupBy({
    by: ["estado"],
    _count: { id: true },
  });

  const result: Record<string, number> = {};
  for (const item of counts) {
    result[item.estado] = item._count.id;
  }
  return result;
}

// ── Create ticket ──

interface CreateTicketDTO {
  clienteId: string;
  tecnicoId: string;
  equipo: string;
  imei_serial?: string;
  falla_reportada: string;
  observaciones?: string;
}

export async function create(data: CreateTicketDTO) {
  return prisma.ticketReparacion.create({
    data,
    include: {
      cliente: { select: { nombre: true } },
      tecnico: { select: { nombre: true } },
    },
  });
}

// ── Update status (Kanban drag) ──

export async function updateEstado(id: string, estado: EstadoTicket) {
  const updateData: Record<string, unknown> = { estado };

  // Auto-set delivery date when delivered
  if (estado === "ENTREGADO") {
    updateData["fecha_entrega"] = new Date();
  }

  return prisma.ticketReparacion.update({
    where: { id },
    data: updateData,
    include: {
      cliente: { select: { nombre: true } },
      tecnico: { select: { nombre: true } },
    },
  });
}

// ── Assign parts ──

export async function addRepuesto(
  ticketId: string,
  productoId: string,
  cantidad: number,
) {
  // Get product price and validate stock
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
  });
  if (!producto)
    throw Object.assign(new Error("Producto no encontrado"), {
      statusCode: 404,
    });
  if (producto.stock_actual < cantidad) {
    throw Object.assign(
      new Error(`Stock insuficiente: ${producto.stock_actual} disponibles`),
      { statusCode: 400 },
    );
  }

  // Transaction: create junction + decrement stock
  return prisma.$transaction([
    prisma.ticket_Producto.create({
      data: {
        ticketId,
        productoId,
        cantidad,
        precio_congelado_usd: producto.precio_usd,
      },
    }),
    prisma.producto.update({
      where: { id: productoId },
      data: { stock_actual: { decrement: cantidad } },
    }),
  ]);
}

// ── Assign services ──

export async function addServicio(
  ticketId: string,
  servicioId: string,
  precioCobrado: number,
) {
  const ticket = await prisma.ticketReparacion.findUnique({
    where: { id: ticketId },
    include: { tecnico: { select: { porcentaje_comision_base: true } } },
  });
  if (!ticket)
    throw Object.assign(new Error("Ticket no encontrado"), { statusCode: 404 });

  const comision = calcularComision(
    precioCobrado,
    ticket.tecnico.porcentaje_comision_base,
  );

  return prisma.ticket_Servicio.create({
    data: {
      ticketId,
      servicioId,
      precio_cobrado_usd: precioCobrado,
      comision_tecnico_usd: comision,
    },
  });
}

export async function update(
  id: string,
  data: Partial<CreateTicketDTO & { observaciones: string }>,
) {
  return prisma.ticketReparacion.update({ where: { id }, data });
}

export async function remove(id: string) {
  await prisma.ticketReparacion.delete({ where: { id } });
  return { message: "Ticket eliminado" };
}
