import { Request, Response, NextFunction } from "express";
import * as service from "./brands.service";

export async function findAllMarcas(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const marcas = await service.findAllMarcas();
    res.json({ success: true, data: marcas });
  } catch (err) {
    next(err);
  }
}

export async function createMarca(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const marca = await service.createMarca(req.body.nombre);
    res.status(201).json({ success: true, data: marca });
  } catch (err) {
    next(err);
  }
}

export async function deleteMarca(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.deleteMarca(req.params["id"] as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function findModelosByMarca(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const modelos = await service.findModelosByMarca(
      req.params["marcaId"] as string,
    );
    res.json({ success: true, data: modelos });
  } catch (err) {
    next(err);
  }
}

export async function createModelo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const modelo = await service.createModelo(
      req.params["marcaId"] as string,
      req.body.nombre,
    );
    res.status(201).json({ success: true, data: modelo });
  } catch (err) {
    next(err);
  }
}

export async function deleteModelo(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.deleteModelo(req.params["id"] as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
