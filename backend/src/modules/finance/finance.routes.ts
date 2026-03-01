import { Router } from "express";
import * as ctrl from "./finance.controller";
import { authMiddleware, requireRole } from "../../core/middlewares/auth";

const router = Router();

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

export default router;
