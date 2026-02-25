import { Request, Response, NextFunction } from "express";
import * as service from "./sales.service";

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      estado: req.query["estado"] as any,
      clienteId: req.query["clienteId"] as string | undefined,
    };
    const data = await service.findAll(filters);
    res.json({ success: true, data });
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
    const data = await service.findById(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function marcarPagada(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.marcarPagada(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function anular(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.anular(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

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
