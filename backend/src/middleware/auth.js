import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { query } from "../db.js";
import { HttpError, asyncHandler } from "../utils.js";

export const signToken = (user) =>
  jwt.sign({ sub: user.id_user, peran: user.peran }, config.jwtSecret, { expiresIn: config.jwtExpires });

/** Wajib login. Data pengguna dimuat ulang dari DB agar status verifikasi selalu terbaru. */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Silakan masuk terlebih dahulu.");
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch {
    throw new HttpError(401, "Sesi tidak valid atau sudah berakhir.");
  }
  const { rows } = await query(
    `SELECT id_user, nama_lengkap, peran, email, status_verifikasi FROM pengguna WHERE id_user = $1`,
    [payload.sub],
  );
  if (!rows[0]) throw new HttpError(401, "Akun tidak ditemukan.");
  if (rows[0].status_verifikasi === "Ditolak") throw new HttpError(403, "Akun Anda ditolak oleh admin.");
  req.user = rows[0];
  next();
});

/** Login opsional: req.user terisi jika token valid, tidak error jika tanpa token. */
export const optionalAuth = (req, res, next) => {
  if (!req.headers.authorization) return next();
  return authenticate(req, res, next);
};

export const requireRole =
  (...peran) =>
  (req, _res, next) => {
    if (!req.user || !peran.includes(req.user.peran)) {
      return next(new HttpError(403, "Peran Anda tidak memiliki akses ke fitur ini."));
    }
    next();
  };

/** Aksi tulis (jual, setor, transaksi) hanya untuk akun yang sudah diverifikasi admin. */
export const requireVerified = (req, _res, next) => {
  if (req.user?.status_verifikasi !== "Terverifikasi") {
    return next(new HttpError(403, "Akun Anda masih menunggu verifikasi admin."));
  }
  next();
};

/** Admin dengan tingkat akses tertentu. Super Admin selalu lolos. */
export const requireAccess =
  (...tingkat) =>
  asyncHandler(async (req, _res, next) => {
    if (req.user?.peran !== "Admin") throw new HttpError(403, "Khusus admin.");
    const { rows } = await query(`SELECT tingkat_akses FROM admin WHERE id_user = $1`, [req.user.id_user]);
    const level = rows[0]?.tingkat_akses;
    if (!level || (level !== "Super Admin" && !tingkat.includes(level))) {
      throw new HttpError(403, "Tingkat akses admin Anda tidak mencukupi.");
    }
    req.adminLevel = level;
    next();
  });
