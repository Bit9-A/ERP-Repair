import { Request, Response } from "express";
import * as service from "./sucursales.service";

export async function getAll(_req: Request, res: Response) {
  const data = await service.findAll();
  res.json({ success: true, data });
}

export async function getOne(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const data = await service.findById(id);
  res.json({ success: true, data });
}

export async function getInventarioBySucursal(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const data = await service.getInventario(id);
  res.json({ success: true, data });
}

export async function getInventarioTotal(_req: Request, res: Response) {
  const data = await service.getInventarioTotal();
  res.json({ success: true, data });
}

export async function createOne(req: Request, res: Response) {
  const data = await service.create(req.body);
  res.status(201).json({ success: true, data });
}

export async function updateOne(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const data = await service.update(id, req.body);
  res.json({ success: true, data });
}

export async function deleteOne(req: Request, res: Response) {
  const id = req.params["id"] as string;
  const data = await service.remove(id);
  res.json({ success: true, data });
}
