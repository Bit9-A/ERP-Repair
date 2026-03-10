import prisma from "../../config/prisma";
import { FrecuenciaGasto } from "../../generated/prisma/enums";

export interface CreateRecurringPayload {
  concepto: string;
  monto_usd: number;
  frecuencia: "DIARIO" | "SEMANAL" | "MENSUAL";
  categoria?: string;
  proximaFecha?: string | Date;
}

/**
 * Creates a new recurring expense template.
 */
export async function createRecurringTemplate(payload: CreateRecurringPayload) {
  const proxima = payload.proximaFecha
    ? new Date(payload.proximaFecha)
    : new Date();

  return prisma.gastoRecurrente.create({
    data: {
      concepto: payload.concepto,
      monto_usd: payload.monto_usd,
      frecuencia: payload.frecuencia as FrecuenciaGasto,
      categoria: payload.categoria || "OTROS",
      proximaFecha: proxima,
    },
  });
}

/**
 * Lists all recurring expense templates.
 */
export async function getRecurringTemplates() {
  return prisma.gastoRecurrente.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Deletes a recurring template.
 */
export async function deleteRecurringTemplate(id: string) {
  return prisma.gastoRecurrente.delete({
    where: { id },
  });
}

/**
 * Updates an existing recurring template.
 */
export async function updateRecurringTemplate(
  id: string,
  payload: Partial<CreateRecurringPayload>,
) {
  const updateData: any = { ...payload };

  if (payload.proximaFecha) {
    updateData.proximaFecha = new Date(payload.proximaFecha);
  }

  if (payload.frecuencia) {
    updateData.frecuencia = payload.frecuencia as FrecuenciaGasto;
  }

  return prisma.gastoRecurrente.update({
    where: { id },
    data: updateData,
  });
}

/**
 * This is the CORE logic for automation.
 * It checks which templates are due and creates TransaccionFinanciera records.
 * It should be called on every dashboard visit (or similar frequency).
 */
export async function processRecurringExpenses() {
  const now = new Date();

  // 1. Get all active templates where proximaFecha <= now
  const dueTemplates = await prisma.gastoRecurrente.findMany({
    where: {
      activo: true,
      proximaFecha: { lte: now },
    },
  });

  if (dueTemplates.length === 0) return 0;

  let createdCount = 0;

  for (const template of dueTemplates) {
    // Generate the expense transaction
    await prisma.transaccionFinanciera.create({
      data: {
        tipo: "EGRESO",
        monto_usd: template.monto_usd,
        concepto: `[RECURRENTE] ${template.concepto}`,
        categoria: template.categoria,
        esFijo: true,
        createdAt: template.proximaFecha, // Use the scheduled date for accuracy
      },
    });

    // Calculate next date based on frequency
    const nextDate = new Date(template.proximaFecha);
    if (template.frecuencia === "DIARIO") {
      nextDate.setDate(nextDate.getDate() + 1);
    } else if (template.frecuencia === "SEMANAL") {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (template.frecuencia === "MENSUAL") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    // Update the template
    await prisma.gastoRecurrente.update({
      where: { id: template.id },
      data: { proximaFecha: nextDate },
    });

    createdCount++;
  }

  return createdCount;
}
