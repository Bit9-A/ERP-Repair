import { Router } from "express";
import * as ctrl from "./brands.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router = Router();

router.use(authMiddleware);

// Marcas
router.get("/", ctrl.findAllMarcas);
router.post("/", ctrl.createMarca);
router.delete("/:id", ctrl.deleteMarca);

// Modelos (nested under marca)
router.get("/:marcaId/modelos", ctrl.findModelosByMarca);
router.post("/:marcaId/modelos", ctrl.createModelo);
router.delete("/modelos/:id", ctrl.deleteModelo);

export default router;
