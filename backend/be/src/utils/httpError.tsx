export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function toHttpError(err: any): HttpError {
  if (err instanceof HttpError) return err;
  if (err?.code === "23505") return new HttpError(409, "Data sudah ada dan tidak boleh duplikat.");
  if (err?.code === "23503") return new HttpError(409, "Data masih terhubung dengan transaksi lain dan tidak dapat diubah atau dihapus.");
  if (err?.code === "23514" || err?.code === "22P02" || err?.code === "22003" || err?.code === "22007")
    return new HttpError(400, "Data yang dikirim tidak sesuai format atau nilai yang diizinkan.");
  return new HttpError(500, err?.message || "Terjadi kesalahan pada server SAMANGGA.");
}

export function sendError(res: any, err: any): void {
  const e = toHttpError(err);
  if (e.status === 500) console.error(err);
  res.status(e.status).json({ success: false, message: e.message });
}
