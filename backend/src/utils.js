import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Parse body/query dengan zod; error dipetakan ke { field: pesan } seperti format FE. */
export function parse(schema, data) {
  const r = schema.safeParse(data);
  if (r.success) return r.data;
  throw zodToHttp(r.error);
}

export function zodToHttp(err) {
  const errors = {};
  for (const i of err.issues) {
    const key = i.path.join(".") || "_";
    if (!errors[key]) errors[key] = i.message;
  }
  return new HttpError(422, "Data belum lengkap atau tidak valid.", errors);
}

export const isZod = (e) => e instanceof ZodError;
