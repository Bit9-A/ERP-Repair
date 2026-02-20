import { Router } from "express";
import * as ctrl from "./inventory.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/stats", ctrl.getStats);
router.get("/", ctrl.findAll);
router.get("/:id", ctrl.findById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
