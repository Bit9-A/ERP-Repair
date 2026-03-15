import { Router } from "express";
import { SearchController } from "./search.controller";
import { authMiddleware } from "../../core/middlewares/auth";

const router: Router = Router();
const searchController = new SearchController();

// All search operations require authentication
router.use(authMiddleware);

router.get("/", searchController.globalSearch.bind(searchController));

export default router;
