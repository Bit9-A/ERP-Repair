/**
 * Tipos para DolarAPI (Venezuela) y gestión de monedas
 */

export interface DolarApiRate {
  moneda: "USD" | "EUR" | string;
  fuente: "oficial" | "paralelo" | string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

export interface CurrencyRatesSummary {
  usd: {
    oficial: number;     // Tasa oficial Banco Central de Venezuela (BCV)
    paralelo: number;    // Tasa mercado paralelo / EnParaleloVzla
    diferenciaPct: number; // Porcentaje de brecha cambiaria
    fechaActualizacion: string;
  };
  eur?: {
    oficial: number;
    paralelo: number;
    fechaActualizacion: string;
  };
  cached: boolean;
  timestamp: string;
}
