export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0";
  
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0";

  // Using en-US applies comma for thousand separator and dot for decimals
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
