import { Request, Response, NextFunction } from "express";
import * as service from "./inventory.service";

export async function findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const search = req.query["search"] as string | undefined;
    const products = await service.findAll(search);
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
