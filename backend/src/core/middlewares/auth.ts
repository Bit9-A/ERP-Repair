import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";

export interface AuthPayload {
  userId: string;
  rol: string;
  sucursalId?: string; // Feature 4: branch the user belongs to
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Token no proporcionado" });
    return;
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, error: "Token inválido o expirado" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.rol)) {
      res
        .status(403)
        .json({ success: false, error: "No tienes permisos para esta acción" });
      return;
    }
    next();
  };
}
