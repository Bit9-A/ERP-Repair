import { Router } from "express";
import * as ctrl from "./users.controller";
import { authMiddleware, requireRole } from "../../core/middlewares/auth";

const router: Router = Router();

// Auth (public)
router.post("/login", ctrl.login);

// Protected
router.get("/me", authMiddleware, ctrl.me);
router.get("/", authMiddleware, ctrl.findAll);
router.get("/:id", authMiddleware, ctrl.findById);
router.post("/", authMiddleware, requireRole("ADMIN"), ctrl.create);
router.put("/:id", authMiddleware, requireRole("ADMIN"), ctrl.update);
router.put("/:id/reset-password", authMiddleware, requireRole("ADMIN"), ctrl.resetPassword);
router.delete("/:id", authMiddleware, requireRole("ADMIN"), ctrl.remove);

export default router;
