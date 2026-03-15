import { Router } from "express";
import * as ctrl from "./inventory.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router: Router = Router();

router.use(authMiddleware);

router.get("/stats", ctrl.getStats);
router.get("/low-stock", ctrl.getLowStock);
router.get("/movimientos/all", ctrl.getAllMovimientos);
router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findById);
router.get("/:id/movimientos", ctrl.getMovimientos);
router.get("/:id/historial-precios", ctrl.getHistorialPrecios); // Feature 2
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/stock", ctrl.adjustStock);
router.post("/:id/add-stock", ctrl.addStock); // Feature 2 & 3
router.delete("/:id", ctrl.remove);

export default router;
