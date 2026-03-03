import { Request, Response, NextFunction } from "express";
import * as service from "./inventory.service";

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = {
      search: req.query["search"] as string | undefined,
      categoria: req.query["categoria"] as any,
      propiedad: req.query["propiedad"] as any,
      sucursalId: req.query["sucursalId"] as string | undefined, // Feature 3
    };
    const products = await service.findAll(filters);
    res.json({ success: true, data: products });
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
    const product = await service.findById(req.params["id"] as string);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await service.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const product = await service.update(req.params["id"] as string, req.body);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}

// Feature 2 & 3: Add stock with supplier price + branch tracking
export async function addStock(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.addStock(req.params["id"] as string, req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function adjustStock(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.adjustStock(
      req.params["id"] as string,
      req.body.cantidad,
      req.body.nota,
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.remove(req.params["id"] as string);
    res.json({ success: true, data: result });
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
    const stats = await service.getStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
}

export async function getLowStock(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getLowStock();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getMovimientos(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getMovimientos(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

// Feature 2: historial de precios de proveedor
export async function getHistorialPrecios(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.getHistorialPrecios(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
