import { env } from "./config/env";
import app from "./app";
import { startSyncWorker } from "./workers/sync";
import { startFinanceCronWorker } from "./workers/financeCron";

const PORT = env.PORT;

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
