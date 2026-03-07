import prisma from "../../config/prisma";
import type { EstadoTicket } from "../../generated/prisma/client";
import { calcularComision } from "../../core/utils/currency";

// ── Queries ──

export async function findAll(filters?: {
  estado?: EstadoTicket;
  tecnicoId?: string;
}) {
  return prisma.ticketReparacion.findMany({
    where: {
      ...(filters?.estado
        ? { estado: filters.estado }
        : { estado: { not: "ENTREGADO" } }),
      ...(filters?.tecnicoId && { tecnicoId: filters.tecnicoId }),
    },
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          telefono: true,
          cedula: true,
          correo: true,
        },
      },
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

// ── Paged History ──

export async function getHistory(page: number, limit: number, search: string) {
  const skip = (page - 1) * limit;
  const where = {
    estado: "ENTREGADO" as EstadoTicket,
    ...(search && {
      OR: [
        { id: { contains: search, mode: "insensitive" } },
        { equipo: { contains: search, mode: "insensitive" } },
        { marca: { contains: search, mode: "insensitive" } },
        { modelo: { contains: search, mode: "insensitive" } },
        { cliente: { nombre: { contains: search, mode: "insensitive" } } },
      ],
    }),
  } as any;

  const [data, total] = await Promise.all([
    prisma.ticketReparacion.findMany({
      where,
      skip,
      take: limit,
      include: {
        cliente: {
          select: { nombre: true, telefono: true, cedula: true, correo: true },
        },
        tecnico: { select: { nombre: true, rol: true } },
      },
      orderBy: { fecha_ingreso: "desc" },
    }),
    prisma.ticketReparacion.count({ where }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
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
  tecnicoId?: string;
  equipo?: string;
  tipo_equipo?: string;
  marca: string;
  modelo: string;
  imei?: string;
  clave?: string;
  patron_visual?: string;
  checklist?: Record<string, boolean>;
  falla: string;
  falla_reportada?: string;
  observaciones?: string;
  costo_repuestos_usd?: number;
  precio_total_usd?: number;
  porcentaje_tecnico?: number;
}

export async function create(data: CreateTicketDTO) {
  return prisma.ticketReparacion.create({
    data: {
      clienteId: data.clienteId,
      tecnicoId: data.tecnicoId,
      equipo: data.equipo,
      tipo_equipo: data.tipo_equipo || "Smartphone",
      marca: data.marca,
      modelo: data.modelo,
      imei: data.imei,
      clave: data.clave,
      patron_visual: data.patron_visual,
      checklist: data.checklist,
      falla: data.falla,
      falla_reportada: data.falla_reportada,
      observaciones: data.observaciones,
      costo_repuestos_usd: data.costo_repuestos_usd,
      precio_total_usd: data.precio_total_usd,
      porcentaje_tecnico: data.porcentaje_tecnico,
    },
    include: {
      cliente: {
        select: { nombre: true, telefono: true, cedula: true, correo: true },
      },
      tecnico: { select: { nombre: true, rol: true } },
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

// ── Assign parts (with stock movement) ──

export async function addRepuesto(
  ticketId: string,
  productoId: string,
  cantidad: number,
) {
  const ticket = await prisma.ticketReparacion.findUnique({
    where: { id: ticketId },
  });
  if (!ticket)
    throw Object.assign(new Error("Ticket no encontrado"), { statusCode: 404 });
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

  // Update ticket totals using raw query or two steps since we need to sum
  const newCostoRepuestos =
    ticket.costo_repuestos_usd + producto.costo_usd * cantidad;
  const newPrecioTotal =
    ticket.precio_total_usd + producto.precio_usd * cantidad;

  // Transaction: create Ticket_Producto + MovimientoStock + update stock + update ticket totals
  return prisma.$transaction([
    prisma.ticket_Producto.create({
      data: {
        ticketId,
        productoId,
        cantidad,
        precio_congelado_usd: producto.precio_usd,
        costo_congelado_usd: producto.costo_usd,
      },
    }),
    prisma.movimientoStock.create({
      data: {
        productoId,
        tipo: "SALIDA_REPARACION",
        cantidad: -cantidad,
        referencia: `Ticket ${ticketId}`,
        sucursalId: ticket.sucursalId,
      },
    }),
    // Update global stock
    prisma.producto.update({
      where: { id: productoId },
      data: { stock_actual: { decrement: cantidad } },
    }),
    ...(ticket.sucursalId
      ? [
          // Update branch stock
          prisma.sucursalProducto.update({
            where: {
              sucursalId_productoId: {
                sucursalId: ticket.sucursalId,
                productoId,
              },
            },
            data: { stock: { decrement: cantidad } },
          }),
        ]
      : []),
    prisma.ticketReparacion.update({
      where: { id: ticketId },
      data: {
        costo_repuestos_usd: newCostoRepuestos,
        precio_total_usd: newPrecioTotal,
      },
    }),
  ]);
}

export async function removeRepuesto(ticketId: string, repuestoId: string) {
  const ticketRepuesto = await prisma.ticket_Producto.findUnique({
    where: { id: repuestoId },
    include: { ticket: true },
  });

  if (!ticketRepuesto || ticketRepuesto.ticketId !== ticketId) {
    throw Object.assign(new Error("Repuesto no encontrado en el ticket"), {
      statusCode: 404,
    });
  }

  const {
    ticket,
    productoId,
    cantidad,
    precio_congelado_usd,
    costo_congelado_usd,
  } = ticketRepuesto;

  const newCostoRepuestos = Math.max(
    0,
    ticket.costo_repuestos_usd - costo_congelado_usd * cantidad,
  );
  const newPrecioTotal = Math.max(
    0,
    ticket.precio_total_usd - precio_congelado_usd * cantidad,
  );

  return prisma.$transaction([
    prisma.ticket_Producto.delete({ where: { id: repuestoId } }),
    prisma.movimientoStock.create({
      data: {
        productoId,
        tipo: "DEVOLUCION",
        cantidad: cantidad,
        referencia: `Devolución Ticket ${ticketId}`,
        sucursalId: ticket.sucursalId,
      },
    }),
    prisma.producto.update({
      where: { id: productoId },
      data: { stock_actual: { increment: cantidad } },
    }),
    ...(ticket.sucursalId
      ? [
          prisma.sucursalProducto.update({
            where: {
              sucursalId_productoId: {
                sucursalId: ticket.sucursalId,
                productoId,
              },
            },
            data: { stock: { increment: cantidad } },
          }),
        ]
      : []),
    prisma.ticketReparacion.update({
      where: { id: ticketId },
      data: {
        costo_repuestos_usd: newCostoRepuestos,
        precio_total_usd: newPrecioTotal,
      },
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

  const porcentaje = ticket.tecnico?.porcentaje_comision_base ?? 0.4;
  const comision = calcularComision(precioCobrado, porcentaje);

  const newPrecioTotal = ticket.precio_total_usd + precioCobrado;

  return prisma.$transaction([
    prisma.ticket_Servicio.create({
      data: {
        ticketId,
        servicioId,
        precio_cobrado_usd: precioCobrado,
        comision_tecnico_usd: comision,
      },
    }),
    prisma.ticketReparacion.update({
      where: { id: ticketId },
      data: { precio_total_usd: newPrecioTotal },
    }),
  ]);
}

export async function removeServicio(
  ticketId: string,
  ticketServicioId: string,
) {
  const ts = await prisma.ticket_Servicio.findUnique({
    where: { id: ticketServicioId },
    include: { ticket: true },
  });

  if (!ts || ts.ticketId !== ticketId) {
    throw Object.assign(new Error("Servicio no encontrado en el ticket"), {
      statusCode: 404,
    });
  }

  const newPrecioTotal = Math.max(
    0,
    ts.ticket.precio_total_usd - ts.precio_cobrado_usd,
  );

  return prisma.$transaction([
    prisma.ticket_Servicio.delete({ where: { id: ticketServicioId } }),
    prisma.ticketReparacion.update({
      where: { id: ticketId },
      data: { precio_total_usd: newPrecioTotal },
    }),
  ]);
}

export async function entregar(
  ticketId: string,
  pagos: Array<{
    monedaId: string;
    monto_moneda_local: number;
    metodo: string;
    referencia?: string;
  }>,
) {
  const ticket = await prisma.ticketReparacion.findUnique({
    where: { id: ticketId },
  });
  if (!ticket)
    throw Object.assign(new Error("Ticket no encontrado"), { statusCode: 404 });
  if (ticket.estado === "ENTREGADO")
    throw Object.assign(new Error("El ticket ya fue entregado"), {
      statusCode: 400,
    });

  return prisma.$transaction(async (tx) => {
    // 1. Update ticket status
    const updatedTicket = await tx.ticketReparacion.update({
      where: { id: ticketId },
      data: { estado: "ENTREGADO", fecha_entrega: new Date() },
    });

    // 2. Process payments (this logic is essentially the same as finance.service, but we do it here inside the transaction to avoid circular dependencies)
    let totalUsdPaid = 0;

    // We get currencies to compute the USD equivalent immediately
    const monedas = await tx.moneda.findMany();
    const monedaMap = new Map(monedas.map((m) => [m.id, m]));

    for (const pagoInput of pagos) {
      const moneda = monedaMap.get(pagoInput.monedaId);
      if (!moneda)
        throw new Error(`Moneda no encontrada: ${pagoInput.monedaId}`);

      const equivalente_usd = parseFloat(
        (pagoInput.monto_moneda_local / moneda.tasa_cambio).toFixed(2),
      );
      totalUsdPaid += equivalente_usd;

      await tx.pago.create({
        data: {
          ticketId,
          monedaId: pagoInput.monedaId,
          monto_moneda_local: pagoInput.monto_moneda_local,
          equivalente_usd,
          metodo:
            pagoInput.metodo as import("../../generated/prisma/client").$Enums.MetodoPago,
          referencia: pagoInput.referencia,
          tasa_cambio_usada: moneda.tasa_cambio,
        },
      });
    }

    // 3. Create TransaccionFinanciera (INGRESO)
    await tx.transaccionFinanciera.create({
      data: {
        tipo: "INGRESO",
        monto_usd: parseFloat(totalUsdPaid.toFixed(2)),
        concepto: `Cobro Ticket #${ticketId.slice(0, 8)}`,
        categoria: "REPARACION",
        ticketId,
      },
    });

    // 4. (Optional) Create EGRESO for the tech commission if applicable.
    // In many real implementations it is left pending or paid out manually, we'll keep it simple for now without automatic commission EGRESO.

    return updatedTicket;
  });
}

export async function update(id: string, data: Partial<CreateTicketDTO>) {
  const { clienteId, tecnicoId, ...rest } = data;
  const updateData: any = { ...rest };

  if (clienteId) {
    updateData.cliente = { connect: { id: clienteId } };
  }
  if (tecnicoId) {
    updateData.tecnico = { connect: { id: tecnicoId } };
  } else if (tecnicoId === null) {
    // Allows unassigning a technician
    updateData.tecnico = { disconnect: true };
  }

  return prisma.ticketReparacion.update({
    where: { id },
    data: updateData,
    include: {
      cliente: {
        select: {
          id: true,
          nombre: true,
          telefono: true,
          cedula: true,
          correo: true,
        },
      },
      tecnico: { select: { id: true, nombre: true, rol: true } },
    },
  });
}

export async function remove(id: string) {
  await prisma.ticketReparacion.delete({ where: { id } });
  return { message: "Ticket eliminado" };
}
