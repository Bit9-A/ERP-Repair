import { Request, Response, NextFunction } from "express";
import * as service from "./clients.service";

export async function findAll(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const clients = await service.findAll();
    res.json({ success: true, data: clients });
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
    const client = await service.findById(req.params["id"] as string);
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function findByCedula(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const client = await service.findByCedula(req.params["cedula"] as string);
    // Return null if not found (not an error — the frontend checks this)
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await service.create(req.body);
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await service.update(req.params["id"] as string, req.body);
    res.json({ success: true, data: client });
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
