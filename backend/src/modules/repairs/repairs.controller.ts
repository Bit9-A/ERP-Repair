import { Request, Response, NextFunction } from "express";
import * as service from "./repairs.service";

async function checkIfLocked(ticketId: string, user?: { rol: string }) {
  if (user?.rol === "ADMIN") return;
  const ticket = await service.findById(ticketId);
  if (ticket && ticket.estado === "ENTREGADO") {
    throw new Error("Ticket cerrado. Solo un administrador puede modificarlo.");
  }
}

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { estado, tecnicoId } = req.query as {
      estado?: string;
      tecnicoId?: string;
    };
    const tickets = await service.findAll({
      estado: estado as any,
      tecnicoId,
    });
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}

export async function findByClienteId(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const tickets = await service.findByClienteId(req.params["clienteId"] as string);
    res.json({ success: true, data: tickets });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = (req.query.search as string) || "";

    const result = await service.getHistory(page, limit, search);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function findById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ticket = await service.findById(req.params["id"] as string);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function getKanbanCounts(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const counts = await service.getKanbanCounts();
    res.json({ success: true, data: counts });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const ticket = await service.create(req.body);
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function updateEstado(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const ticket = await service.updateEstado(
      req.params["id"] as string,
      req.body.estado,
    );
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function addRepuesto(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const { productoId, cantidad } = req.body;
    const result = await service.addRepuesto(
      req.params["id"] as string,
      productoId,
      cantidad,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function addServicio(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const { servicioId, precioCobrado } = req.body;
    const result = await service.addServicio(
      req.params["id"] as string,
      servicioId,
      precioCobrado,
    );
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeRepuesto(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const result = await service.removeRepuesto(
      req.params["id"] as string,
      req.params["repuestoId"] as string,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function removeServicio(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const result = await service.removeServicio(
      req.params["id"] as string,
      req.params["servicioId"] as string,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function entregar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const { pagos } = req.body;
    const result = await service.entregar(req.params["id"] as string, pagos);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const ticket = await service.update(req.params["id"] as string, req.body);
    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await checkIfLocked(req.params["id"] as string, req.user);
    const result = await service.remove(req.params["id"] as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
