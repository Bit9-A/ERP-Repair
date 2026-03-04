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
import brandsRoutes from "./modules/brands/brands.routes";
import clientsRoutes from "./modules/clients/clients.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import searchRoutes from "./modules/search/search.routes";
import { sucursalesRouter } from "./modules/sucursales/sucursales.routes";

const app = express();

// ── Global Middleware ──
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
  express.json(),
  express.urlencoded({ extended: true }),
);

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
app.use("/api/brands", brandsRoutes);
app.use("/api/clients", clientsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sucursales", sucursalesRouter);
app.use("/api/search", searchRoutes);

// ── Error Handling ──
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
