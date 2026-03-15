/**
 * Formatea un monto en dólares.
 */
export function formatUSD(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/**
 * Convierte un monto de una moneda a USD usando la tasa de cambio.
 * @param montoLocal — Monto en moneda local
 * @param tasaCambio — Cuántas unidades de moneda local equivalen a 1 USD
 */
export function convertToUSD(montoLocal: number, tasaCambio: number): number {
  if (tasaCambio <= 0) throw new Error("Tasa de cambio debe ser mayor a 0");
  return parseFloat((montoLocal / tasaCambio).toFixed(2));
}

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
