import { Request, Response, NextFunction } from "express";
import * as service from "./transactions.service";

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      tipo: req.query["tipo"] as any,
      categoria: req.query["categoria"] as string | undefined,
      desde: req.query["desde"] as string | undefined,
      hasta: req.query["hasta"] as string | undefined,
    };
    const data = await service.findAll(filters);
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

export async function getBalance(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getBalance(
      req.query["desde"] as string | undefined,
      req.query["hasta"] as string | undefined,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getStatsHoy(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getStatsHoy();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getByCategoria(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getByCategoria(
      req.query["desde"] as string | undefined,
      req.query["hasta"] as string | undefined,
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
