import { Router } from "express";
import * as ctrl from "./repairs.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/kanban-counts", ctrl.getKanbanCounts);
router.get("/history", ctrl.getHistory);
router.get("/cliente/:clienteId", ctrl.findByClienteId);
router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.patch("/:id/estado", ctrl.updateEstado);
router.post("/:id/repuestos", ctrl.addRepuesto);
router.delete("/:id/repuestos/:repuestoId", ctrl.removeRepuesto);
router.post("/:id/servicios", ctrl.addServicio);
router.delete("/:id/servicios/:servicioId", ctrl.removeServicio);
router.post("/:id/entregar", ctrl.entregar);
router.delete("/:id", ctrl.remove);

export default router;
