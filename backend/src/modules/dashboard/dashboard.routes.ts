import { Router } from "express";
import * as ctrl from "./dashboard.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router: Router = Router();

router.use(authMiddleware);

// GET /api/dashboard
router.get("/", ctrl.getDashboardData);

export default router;
