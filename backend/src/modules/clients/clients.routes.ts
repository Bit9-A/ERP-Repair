import { Router } from "express";
import * as ctrl from "./clients.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", ctrl.findAll);
router.get("/cedula/:cedula", ctrl.findByCedula);
router.get("/:id", ctrl.findById);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);

export default router;
