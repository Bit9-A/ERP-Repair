import { Request, Response, NextFunction } from "express";
import * as service from "./dashboard.service";

export async function getDashboardData(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("[Dashboard] getDashboardData called");
    const data = await service.getDashboardData();
    console.log("[Dashboard] data:", JSON.stringify(data));
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Dashboard] ERROR:", err);
    next(err);
  }
}
