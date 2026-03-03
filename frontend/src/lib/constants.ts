// ============================================
// Application-wide constants
// ============================================

export const APP_NAME = "TecnoPro Cell";
export const APP_SUBTITLE = "Sistema de Gestión";

// -- Ticket status labels & colors --
export const TICKET_STATUS = {
  RECIBIDO: { label: "Recibido", color: "gray" },
  EN_REVISION: { label: "Revisión", color: "blue" },
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
export const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "PAGO_MOVIL", label: "Pago Móvil" },
  { value: "ZELLE", label: "Zelle" },
  { value: "BINANCE", label: "Binance" },
] as const;

// -- Product categories --
export const PRODUCT_CATEGORIES = {
  EQUIPO: { label: "Equipo", color: "blue" },
  ACCESORIO: { label: "Accesorio", color: "violet" },
  REPUESTO: { label: "Repuesto", color: "orange" },
} as const;

// -- Product ownership --
export const PRODUCT_OWNERSHIP = {
  PROPIA: { label: "Propia", color: "brand" },
  PRESTADA: { label: "Prestada", color: "yellow" },
} as const;

// -- Sale status --
export const SALE_STATUS = {
  PENDIENTE: { label: "Pendiente", color: "yellow" },
  PAGADA: { label: "Pagada", color: "brand" },
  ANULADA: { label: "Anulada", color: "red" },
} as const;

// -- Transaction types --
export const TRANSACTION_TYPES = {
  INGRESO: { label: "Ingreso", color: "green" },
  EGRESO: { label: "Egreso", color: "red" },
} as const;

// -- Stock movement types --
export const MOVEMENT_TYPES = {
  ENTRADA: { label: "Entrada", color: "green" },
  SALIDA_REPARACION: { label: "Salida (Reparación)", color: "blue" },
  SALIDA_VENTA: { label: "Salida (Venta)", color: "violet" },
  AJUSTE: { label: "Ajuste", color: "yellow" },
  DEVOLUCION: { label: "Devolución", color: "orange" },
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
