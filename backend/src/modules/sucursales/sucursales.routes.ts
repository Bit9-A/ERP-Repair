import { Router } from "express";
import { authMiddleware, requireRole } from "../../core/middlewares/auth";
import * as ctrl from "./sucursales.controller";

export const sucursalesRouter = Router();

sucursalesRouter.use(authMiddleware);

// List all & create (ADMIN only for write)
sucursalesRouter.get("/", ctrl.getAll);
sucursalesRouter.post("/", requireRole("ADMIN"), ctrl.createOne);

// Total inventory across all branches (ADMIN)
sucursalesRouter.get(
  "/inventario/total",
  requireRole("ADMIN"),
  ctrl.getInventarioTotal,
);

// Per-branch inventory
sucursalesRouter.get("/:id/inventario", ctrl.getInventarioBySucursal);

// Individual CRUD
sucursalesRouter.get("/:id", ctrl.getOne);
sucursalesRouter.patch("/:id", requireRole("ADMIN"), ctrl.updateOne);
sucursalesRouter.delete("/:id", requireRole("ADMIN"), ctrl.deleteOne);
