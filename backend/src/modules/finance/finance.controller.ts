import { Request, Response, NextFunction } from "express";
import * as service from "./finance.service";
import * as recurringService from "./recurringFinance.service";

// Monedas
export async function findAllMonedas(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.findAllMonedas();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createMoneda(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.createMoneda(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateTasa(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.updateTasa(
      req.params["id"] as string,
      req.body.tasa_cambio,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Pagos
export async function registrarPago(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.registrarPago(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function findPagos(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const periodo = req.query["periodo"] as
      | "dia"
      | "semana"
      | "mes"
      | undefined;
    const data = await service.findPagosByDate(periodo);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Cierre de caja
export async function cierreDeCaja(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const fecha = req.query["fecha"] as string | undefined;
    const data = await service.cierreDeCaja(fecha);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Stats
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const periodo = req.query["periodo"] as
      | "dia"
      | "semana"
      | "mes"
      | undefined;
    const data = await service.getStats(periodo);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Egresos (Gastos)
export async function createEgreso(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.createEgreso(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getEgresos(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const periodo = req.query["periodo"] as
      | "dia"
      | "semana"
      | "mes"
      | undefined;
    const data = await service.getEgresos(periodo);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteEgreso(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.deleteEgreso(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// ── Egresos Recurrentes ──

export async function getRecurrentes(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await recurringService.getRecurringTemplates();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createRecurring(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await recurringService.createRecurringTemplate(req.body);
    res.json({
      success: true,
      data,
      message: "Gasto recurrente programado correctamente",
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRecurrente(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    await recurringService.deleteRecurringTemplate(id as string);
    res.json({ success: true, message: "Programación eliminada" });
  } catch (err) {
    next(err);
  }
}

export async function updateRecurring(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const data = await recurringService.updateRecurringTemplate(
      id as string,
      req.body,
    );
    res.json({
      success: true,
      data,
      message: "Programación actualizada correctamente",
    });
  } catch (err) {
    next(err);
  }
}
