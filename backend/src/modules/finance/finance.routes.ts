import { Router } from "express";
import * as ctrl from "./finance.controller";
import { authMiddleware, requireRole } from "../../core/middlewares/auth";

const router: Router = Router();

router.use(authMiddleware);

// Monedas
router.get("/monedas", ctrl.findAllMonedas);
router.post("/monedas", requireRole("ADMIN"), ctrl.createMoneda);
router.patch("/monedas/:id", requireRole("ADMIN"), ctrl.updateTasa);

// Pagos
router.get("/pagos", ctrl.findPagos);
router.post("/pagos", ctrl.registrarPago);

// Cierre de caja
router.get("/cierre", requireRole("ADMIN", "TECNICO"), ctrl.cierreDeCaja);

// Stats
router.get("/stats", requireRole("ADMIN", "TECNICO"), ctrl.getStats);

// Egresos (Gastos)
router.post("/egresos", requireRole("ADMIN"), ctrl.createEgreso);
router.get("/egresos", requireRole("ADMIN"), ctrl.getEgresos);
router.delete("/egresos/:id", requireRole("ADMIN"), ctrl.deleteEgreso);

// Egresos Recurrentes
router.get("/egresos/recurrentes", requireRole("ADMIN"), ctrl.getRecurrentes);
router.post("/egresos/recurrentes", requireRole("ADMIN"), ctrl.createRecurring);
router.delete(
  "/egresos/recurrentes/:id",
  requireRole("ADMIN"),
  ctrl.deleteRecurrente,
);
router.patch(
  "/egresos/recurrentes/:id",
  requireRole("ADMIN"),
  ctrl.updateRecurring,
);

export default router;
