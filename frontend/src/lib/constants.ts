// ============================================
// Application-wide constants
// ============================================

export const APP_NAME = "RepairShop ERP";
export const APP_SUBTITLE = "Sistema de Gestión para Tienda de Reparaciones";

// -- Ticket status labels & colors --
export const TICKET_STATUS = {
  RECIBIDO: { label: "Recibido", color: "gray" },
  EN_REVISION: { label: "En Revisión", color: "blue" },
  ESPERANDO_REPUESTO: { label: "Esperando Repuesto", color: "yellow" },
  REPARADO: { label: "Reparado", color: "brand" },
  ENTREGADO: { label: "Entregado", color: "violet" },
  ABANDONO: { label: "Abandono", color: "red" },
} as const;

// -- Kanban column order --
export const KANBAN_COLUMNS = [
  "RECIBIDO",
  "EN_REVISION",
  "ESPERANDO_REPUESTO",
  "REPARADO",
  "ENTREGADO",
  "ABANDONO",
] as const;

// -- Payment methods --
export const PAYMENT_METHODS = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  PUNTO_VENTA: "Punto de Venta",
  PAGO_MOVIL: "Pago Móvil",
} as const;

// -- Stock status thresholds --
export const STOCK_STATUS = {
  OK: { label: "OK", color: "brand" },
  BAJO: { label: "Bajo", color: "yellow" },
  AGOTADO: { label: "Agotado", color: "red" },
} as const;

export function getStockStatus(actual: number, minimo: number) {
  if (actual <= 0) return STOCK_STATUS.AGOTADO;
  if (actual <= minimo) return STOCK_STATUS.BAJO;
  return STOCK_STATUS.OK;
}
