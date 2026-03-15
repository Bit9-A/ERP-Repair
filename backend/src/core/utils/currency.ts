/**
 * Formatea un monto en pesos colombianos.
 */
export function formatCOP(amount: number): string {
  return `$ ${Math.round(amount).toLocaleString("es-CO")}`;
}

/**
 * Convierte un monto de una moneda a COP usando la tasa de cambio.
 * @param montoLocal — Monto en moneda alterna (USD, VES)
 * @param tasaCambio — Cuántas unidades de moneda local equivalen a 1 COP
 */
export function convertToCOP(montoLocal: number, tasaCambio: number): number {
  if (tasaCambio <= 0) throw new Error("Tasa de cambio debe ser mayor a 0");
  return parseFloat((montoLocal / tasaCambio).toFixed(2));
}

// Alias for backward compatibility with existing callers
export const convertToUSD = convertToCOP;
export const formatUSD = formatCOP;

/**
 * Calcula la comisión de un técnico sobre un servicio.
 * @param precioServicio — Precio cobrado del servicio en USD
 * @param porcentajeComision — Porcentaje como decimal (Ej: 0.40 = 40%)
 */
export function calcularComision(
  precioServicio: number,
  porcentajeComision: number,
): number {
  return parseFloat((precioServicio * porcentajeComision).toFixed(2));
}
