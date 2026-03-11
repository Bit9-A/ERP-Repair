import { env } from "./config/env";
import app from "./app";
import { startSyncWorker } from "./workers/sync";
import { startFinanceCronWorker } from "./workers/financeCron";

const PORT = env.PORT;

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "repairshop-erp-backend",
    version: "1.0.0",
  });
});

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  RepairShop ERP — PRO MAX Backend   ║
  ║  Servidor corriendo en puerto http://localhost:${PORT}  ║
  ║  Entorno: ${env.NODE_ENV.padEnd(24)}║
  ╚══════════════════════════════════════╝
  `);

  // Iniciar la sincronización secundaria a la Nube (Neon DB)
  startSyncWorker();

  // Iniciar el procesador de gastos recurrentes
  startFinanceCronWorker();
});

// Force restart 2026-03-10

