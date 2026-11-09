import type { Request, Response } from "express";
import { sendError } from "./httpError.tsx";

export type Result = {
  data?: unknown;
  message?: string;
  status?: number;
  extra?: Record<string, unknown>;
};

export function handle(fn: (req: Request, res: Response) => Promise<Result>) {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const r = await fn(req, res);
      const body: Record<string, unknown> = { success: true };
      if (r.message) body.message = r.message;
      if (r.extra) Object.assign(body, r.extra);
      if (r.data !== undefined) body.data = r.data;
      res.status(r.status ?? 200).json(body);
    } catch (err) {
      sendError(res, err);
    }
  };
}

export function param(req: Request, name: string): string {
  return String(req.params[name]);
}
