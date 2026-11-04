import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { authenticate, requireAccess, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(authenticate, requireRole("Admin"));

// GET /api/admin/ringkasan
router.get(
  "/ringkasan",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
      SELECT
        (SELECT count(*)::int FROM pengguna) AS total_pengguna,
        (SELECT count(*)::int FROM pengguna WHERE status_verifikasi='Menunggu') AS pengguna_menunggu,
        (SELECT count(*)::int FROM produk WHERE status_verifikasi='Menunggu') AS produk_menunggu,
        (SELECT count(*)::int FROM limbah WHERE status_verifikasi='Menunggu') AS limbah_menunggu,
        (SELECT count(*)::int FROM transaksi) AS total_transaksi,
        (SELECT COALESCE(sum(total_harga),0) FROM transaksi WHERE status IN ('Diproses','Selesai')) AS nilai_transaksi,
        (SELECT COALESCE(sum(berat_kg),0) FROM limbah WHERE status_jemput='Selesai') AS limbah_terserap_kg`);
    res.json({ data: rows[0] });
  }),
);

// GET /api/admin/pengguna?status=Menunggu&peran=UMKM  (Super Admin)
router.get(
  "/pengguna",
  requireAccess(),
  asyncHandler(async (req, res) => {
    const q = parse(
      z.object({
        status: z.enum(["Menunggu", "Terverifikasi", "Ditolak"]).optional(),
        peran: z.enum(["Supplier", "UMKM", "Mitra", "Konsumen", "Admin"]).optional(),
      }),
      req.query,
    );
    const params = [];
    const w = ["TRUE"];
    if (q.status) { params.push(q.status); w.push(`status_verifikasi = $${params.length}`); }
    if (q.peran) { params.push(q.peran); w.push(`peran = $${params.length}`); }
    const { rows } = await query(
      `SELECT id_user, nama_lengkap, peran, no_telp, alamat, email, status_verifikasi, tgl_daftar
       FROM pengguna WHERE ${w.join(" AND ")} ORDER BY id_user DESC LIMIT 500`, params);
    res.json({ data: rows });
  }),
);

// PATCH /api/admin/pengguna/:id/verifikasi  (Super Admin)
router.patch(
  "/pengguna/:id(\\d+)/verifikasi",
  requireAccess(),
  asyncHandler(async (req, res) => {
    const { status_verifikasi } = parse(z.object({ status_verifikasi: z.enum(["Menunggu", "Terverifikasi", "Ditolak"]) }), req.body ?? {});
    if (Number(req.params.id) === req.user.id_user) throw new HttpError(422, "Tidak dapat mengubah status akun sendiri.");
    const { rows } = await query(
      `UPDATE pengguna SET status_verifikasi = $2 WHERE id_user = $1
       RETURNING id_user, nama_lengkap, peran, email, status_verifikasi`, [req.params.id, status_verifikasi]);
    if (!rows[0]) throw new HttpError(404, "Pengguna tidak ditemukan.");
    res.json({ data: rows[0] });
  }),
);

// GET /api/admin/produk/menunggu  (Admin Transaksi)
router.get(
  "/produk/menunggu",
  requireAccess("Admin Transaksi"),
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT p.*, u.nama_lengkap AS nama_penjual FROM produk p JOIN pengguna u ON u.id_user = p.id_user
       WHERE p.status_verifikasi = 'Menunggu' ORDER BY p.id_produk`);
    res.json({ data: rows });
  }),
);

// PATCH /api/admin/produk/:id/verifikasi  (Admin Transaksi)
router.patch(
  "/produk/:id(\\d+)/verifikasi",
  requireAccess("Admin Transaksi"),
  asyncHandler(async (req, res) => {
    const { status_verifikasi } = parse(z.object({ status_verifikasi: z.enum(["Terverifikasi", "Ditolak"]) }), req.body ?? {});
    const { rows } = await query(`UPDATE produk SET status_verifikasi = $2 WHERE id_produk = $1 RETURNING *`, [req.params.id, status_verifikasi]);
    if (!rows[0]) throw new HttpError(404, "Produk tidak ditemukan.");
    res.json({ data: rows[0] });
  }),
);

// GET /api/admin/log?level=Error&halaman=1  (Super Admin)
router.get(
  "/log",
  requireAccess(),
  asyncHandler(async (req, res) => {
    const q = parse(
      z.object({
        level: z.enum(["Info", "Warning", "Error"]).optional(),
        halaman: z.coerce.number().int().min(1).default(1),
        per_halaman: z.coerce.number().int().min(1).max(200).default(50),
      }),
      req.query,
    );
    const params = [];
    let w = "TRUE";
    if (q.level) { params.push(q.level); w = `level = $1`; }
    params.push(q.per_halaman, (q.halaman - 1) * q.per_halaman);
    const { rows } = await query(
      `SELECT * FROM log_sistem WHERE ${w} ORDER BY id_log DESC LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ data: rows, halaman: q.halaman, per_halaman: q.per_halaman });
  }),
);

export default router;
