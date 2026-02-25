import express from "express";
import cors from "cors";

import { errorHandler, notFoundHandler } from "./core/middlewares/errorHandler";

// Module routes
import usersRoutes from "./modules/users/users.routes";
import inventoryRoutes from "./modules/inventory/inventory.routes";
import servicesRoutes from "./modules/services/services.routes";
import repairsRoutes from "./modules/repairs/repairs.routes";
import financeRoutes from "./modules/finance/finance.routes";
import salesRoutes from "./modules/sales/sales.routes";
import transactionsRoutes from "./modules/transactions/transactions.routes";

const app = express();

// ── Global Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "RepairShop ERP API v1.0 — PRO MAX",
    timestamp: new Date().toISOString(),
  });
});

// ── Module Routes ──
app.use("/api/users", usersRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/repairs", repairsRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/transactions", transactionsRoutes);

// ── Error Handling ──
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
