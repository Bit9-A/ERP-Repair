import cron from "node-cron";
import { processRecurringExpenses } from "../modules/finance/recurringFinance.service";

/**
 * Worker para automatizar la generación de egresos recurrentes.
 * Se ejecuta cada 30 minutos por defecto.
 */
export function startFinanceCronWorker() {
  console.log(
    "[WORKER] ⏲️ Motor de Finanzas (Gastos Recurrentes) Inicializado.",
  );

  // Ejecutar cada 30 minutos
  // Escoger un intervalo razonable para no saturar pero asegurar que se procesen
  cron.schedule("*/30 * * * *", async () => {
    console.log(
      `[CRON] 📜 Procesando gastos recurrentes... (${new Date().toLocaleString()})`,
    );
    try {
      await processRecurringExpenses();
    } catch (error) {
      console.error("[CRON] ❌ Error al procesar gastos recurrentes:", error);
    }
  });

  // Ejecución inicial después de 1 minuto para procesar pendientes al arrancar el servidor
  setTimeout(async () => {
    console.log("[CRON] ⚡ Ejecución inicial de gastos recurrentes...");
    try {
      await processRecurringExpenses();
    } catch (error) {
      console.error("[CRON] ❌ Error en ejecución inicial de cron:", error);
    }
  }, 60000);
}
