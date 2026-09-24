import path from "path";
import express, { Express } from "express";
import cors from "cors";
import prisma from "./config/prisma";

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
import currencyRoutes from "./modules/currency/currency.routes";

const app: Express = express();

// ── Global Middleware ──
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
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

app.get("/api/health", async (_req, res) => {
  let dbStatus = "connected";
  let dbResponseTime = 0;
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbResponseTime = Date.now() - start;
  } catch (err: any) {
    dbStatus = "error";
    dbResponseTime = -1;
  }

  const mem = process.memoryUsage();
  res.json({
    status: dbStatus === "connected" ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    service: "repairshop-erp-backend",
    uptime: `${Math.floor(process.uptime())}s`,
    memory: {
      heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
      rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
    },
    database: {
      status: dbStatus,
      responseTime: dbResponseTime > 0 ? `${dbResponseTime}ms` : "N/A",
    },
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
app.use("/api/currency", currencyRoutes);

// ── Frontend Estático (en producción Docker) ──
const frontendDist = path.join(__dirname, "../public");
app.use(
  express.static(frontendDist, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith("index.html")) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if (filePath.includes("/assets/") && /\.[a-f0-9]{8,}\.(js|css)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (/\.(png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
      if (filePath.endsWith(".css")) {
        res.setHeader("Content-Type", "text/css");
      } else if (filePath.endsWith(".js") || filePath.endsWith(".mjs")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// SPA fallback: cualquier ruta que no sea /api/* devuelve index.html
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next();
  });
});

// ── Error Handling ──
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
