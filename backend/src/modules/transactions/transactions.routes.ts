import { Router } from "express";
import * as ctrl from "./transactions.controller";
import { authMiddleware, requireRole } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/stats", ctrl.getStatsHoy);
router.get("/balance", ctrl.getBalance);
router.get("/categorias", ctrl.getByCategoria);
router.get("/", ctrl.findAll);
router.post("/", requireRole("ADMIN"), ctrl.create);

export default router;
