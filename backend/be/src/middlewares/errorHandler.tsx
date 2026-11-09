import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error("❌ Terjadi Kesalahan Server:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Terjadi kesalahan internal pada server SAMANGGA.",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}
