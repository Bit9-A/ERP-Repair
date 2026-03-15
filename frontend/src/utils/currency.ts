export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0";
  
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";

  // Using es-CO applies dot for thousand separator and comma for decimals if needed
  return num.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0, // En COP generalmente no se usan los centavos
  });
}
