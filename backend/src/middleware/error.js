import { HttpError, isZod, zodToHttp } from "../utils.js";

export function notFound(_req, _res, next) {
  next(new HttpError(404, "Endpoint tidak ditemukan."));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (isZod(err)) err = zodToHttp(err);

  // Kode error Postgres
  if (err.code === "23505") err = new HttpError(409, "Data sudah ada (duplikat).");
  else if (err.code === "23503") err = new HttpError(409, "Data terkait tidak ditemukan atau masih dipakai.");
  else if (err.code === "23514") err = new HttpError(422, "Data melanggar aturan database.");
  else if (err.code === "22P02") err = new HttpError(400, "Format data tidak valid.");
  else if (err.type === "entity.too.large") err = new HttpError(413, "Ukuran file terlalu besar.");
  else if (err.type === "entity.parse.failed") err = new HttpError(400, "Body JSON tidak valid.");

  if (err instanceof HttpError) {
    res.locals.logMessage = err.message;
    return res.status(err.status).json({ message: err.message, ...(err.errors ? { errors: err.errors } : {}) });
  }

  console.error(err);
  res.locals.logMessage = "Kesalahan server";
  res.locals.errorDetail = String(err.stack || err.message).slice(0, 4000);
  res.status(500).json({ message: "Terjadi kesalahan pada server." });
}
