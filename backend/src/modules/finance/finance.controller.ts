import { Request, Response, NextFunction } from "express";
import * as service from "./finance.service";

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
    const fecha = req.query["fecha"] as string | undefined;
    const data = await service.findPagosByDate(fecha);
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
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
