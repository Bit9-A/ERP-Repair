import { Router } from "express";
import * as ctrl from "./sales.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/stats", ctrl.getStats);
router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findById);
router.post("/", ctrl.create);
router.patch("/:id/pagar", ctrl.marcarPagada);
router.patch("/:id/anular", ctrl.anular);

export default router;
