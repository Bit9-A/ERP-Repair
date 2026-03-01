import { Router } from "express";
import * as ctrl from "./repairs.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/kanban-counts", ctrl.getKanbanCounts);
router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/estado", ctrl.updateEstado);
router.post("/:id/repuestos", ctrl.addRepuesto);
router.post("/:id/servicios", ctrl.addServicio);
router.delete("/:id", ctrl.remove);

export default router;
