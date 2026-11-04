import { query } from "../db.js";

/** Catat setiap request API ke tabel log_sistem (tanpa body, agar password tidak tersimpan). */
export function requestLogger(req, res, next) {
  res.on("finish", () => {
    const path = req.originalUrl.split("?")[0];
    if (path === "/health") return;
    const code = res.statusCode;
    const level = code >= 500 ? "Error" : code >= 400 ? "Warning" : "Info";
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : path;
    query(
      `INSERT INTO log_sistem (id_user, level, aksi, endpoint_api, kode_status, pesan, detail_error)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        req.user?.id_user ?? null,
        level,
        `${req.method} ${route}`.slice(0, 150),
        path.slice(0, 255),
        code,
        res.locals.logMessage || res.statusMessage || "",
        res.locals.errorDetail || null,
      ],
    ).catch((e) => console.error("Gagal menulis log_sistem:", e.message));
  });
  next();
}
