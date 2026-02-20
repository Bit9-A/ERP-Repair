import { Request, Response, NextFunction } from "express";
import * as usersService from "./users.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await usersService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.me(req.user!.userId);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function findAll(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await usersService.findAll();
    res.json({ success: true, data: users });
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
    const user = await usersService.findById(req.params["id"] as string);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.update(
      req.params["id"] as string,
      req.body,
    );
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await usersService.remove(req.params["id"] as string);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}
