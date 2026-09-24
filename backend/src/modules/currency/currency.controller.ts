import { Request, Response } from "express";
import * as dolarApiService from "./dolarApi.service";
import prisma from "../../config/prisma";

export async function getRatesSummary(req: Request, res: Response) {
  try {
    const forceRefresh = req.query.refresh === "true";
    const data = await dolarApiService.getRatesSummary(forceRefresh);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al consultar las tasas en DolarAPI",
      error: error.message,
    });
  }
}

export async function getRawRates(req: Request, res: Response) {
  try {
    const forceRefresh = req.query.refresh === "true";
    const data = await dolarApiService.getDolarRates(forceRefresh);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al obtener tasas en bruto de DolarAPI",
      error: error.message,
    });
  }
}

export async function getBcvRate(req: Request, res: Response) {
  try {
    const summary = await dolarApiService.getRatesSummary();
    res.json({
      success: true,
      data: {
        tasa: summary.usd.oficial,
        fuente: "BCV (Oficial)",
        fechaActualizacion: summary.usd.fechaActualizacion,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la tasa oficial BCV",
      error: error.message,
    });
  }
}

export async function getParaleloRate(req: Request, res: Response) {
  try {
    const summary = await dolarApiService.getRatesSummary();
    res.json({
      success: true,
      data: {
        tasa: summary.usd.paralelo,
        fuente: "Paralelo",
        diferenciaPct: summary.usd.diferenciaPct,
        fechaActualizacion: summary.usd.fechaActualizacion,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al obtener la tasa del dólar paralelo",
      error: error.message,
    });
  }
}

export async function syncBcvToDb(_req: Request, res: Response) {
  try {
    const result = await dolarApiService.syncBcvRateToDatabase();
    res.json({
      success: true,
      message: `Tasa oficial del BCV sincronizada en la base de datos (${result.tasaNueva} Bs/USD)`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al sincronizar la tasa BCV en la base de datos",
      error: error.message,
    });
  }
}

export async function getDbCurrencies(_req: Request, res: Response) {
  try {
    const monedas = await prisma.moneda.findMany({
      orderBy: { codigo: "asc" },
    });
    res.json({ success: true, data: monedas });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error al consultar las monedas en base de datos",
      error: error.message,
    });
  }
}
