import { Request, Response, NextFunction } from "express";
import * as service from "./services.service";

export async function findAll(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await service.findAll();
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

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.update(req.params["id"] as string, req.body);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await service.remove(req.params["id"] as string);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
