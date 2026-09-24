import { Router } from "express";
import {
  getRatesSummary,
  getRawRates,
  getBcvRate,
  getParaleloRate,
  syncBcvToDb,
  getDbCurrencies,
} from "./currency.controller";

const router: Router = Router();

// ── Rutas de DolarAPI y Divisas ──
router.get("/rates", getRatesSummary);          // Resumen consolidado: BCV, Paralelo, Euro
router.get("/raw", getRawRates);               // Listado en bruto de DolarAPI
router.get("/bcv", getBcvRate);                // Solo tasa oficial BCV
router.get("/paralelo", getParaleloRate);      // Solo tasa paralelo
router.get("/db", getDbCurrencies);            // Monedas registradas en PostgreSQL
router.post("/sync-bcv", syncBcvToDb);         // Sincroniza tasa BCV a la DB (VES)

export default router;
