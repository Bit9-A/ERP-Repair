/**
 * Lógica Profesional: 
 * El técnico solo gana sobre el trabajo realizado, no sobre el costo del repuesto.
 */
export const calcularTotales = (precioTotal: number, costoRepuesto: number, porcTecnico: number = 0.40) => {
  // 1. Recuperas lo que invertiste en la pieza
  const manoDeObraNeta = Math.max(0, precioTotal - costoRepuesto);
  
  // 2. Calculas el pago del técnico (40%)
  const pagoTecnico = manoDeObraNeta * porcTecnico;
  
  // 3. Lo que le queda al local (60% de mano de obra + costo de pieza)
  const gananciaLocal = (manoDeObraNeta * (1 - porcTecnico)) + costoRepuesto;

  return {
    manoDeObraNeta,
    pagoTecnico,
    gananciaLocal
  };
};