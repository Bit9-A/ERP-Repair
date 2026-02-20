import { env } from "./config/env";
import app from "./app";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  RepairShop ERP — PRO MAX Backend   ║
  ║  Servidor corriendo en puerto ${PORT}  ║
  ║  Entorno: ${env.NODE_ENV.padEnd(24)}║
  ╚══════════════════════════════════════╝
  `);
});
