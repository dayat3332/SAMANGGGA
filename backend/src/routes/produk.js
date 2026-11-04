import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { authenticate, optionalAuth, requireRole, requireVerified } from "../middleware/auth.js";

const router = Router();

const KATEGORI = ["Buah", "Olahan", "Bibit"];

const produkSchema = z.object({
  nama_produk: z.string().trim().min(3, "Nama produk minimal 3 karakter."),
  kategori: z.enum(KATEGORI),
  harga: z.coerce.number().min(0, "Harga tidak boleh negatif."),
  stok: z.coerce.number().int().min(0, "Stok tidak boleh negatif."),
  satuan: z.string().trim().min(1, "Satuan wajib diisi."),
  deskripsi: z.string().trim().default(""),
  gambar: z.string().trim().default(""),
});

const SELECT_PUBLIK = `
  SELECT p.*, u.nama_lengkap AS nama_penjual, u.alamat AS lokasi_penjual, u.peran AS peran_penjual
  FROM produk p JOIN pengguna u ON u.id_user = p.id_user`;

// GET /api/produk?kategori=&q=&halaman=&per_halaman=   (publik: hanya yang Terverifikasi)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parse(
      z.object({
        kategori: z.enum(KATEGORI).optional(),
        q: z.string().trim().optional(),
        halaman: z.coerce.number().int().min(1).default(1),
        per_halaman: z.coerce.number().int().min(1).max(100).default(20),
      }),
      req.query,
    );
    const where = [`p.status_verifikasi = 'Terverifikasi'`];
    const params = [];
    if (q.kategori) { params.push(q.kategori); where.push(`p.kategori = $${params.length}`); }
    if (q.q) { params.push(`%${q.q}%`); where.push(`(p.nama_produk ILIKE $${params.length} OR p.deskripsi ILIKE $${params.length})`); }
    const w = where.join(" AND ");
    const total = (await query(`SELECT count(*)::int AS n FROM produk p WHERE ${w}`, params)).rows[0].n;
    params.push(q.per_halaman, (q.halaman - 1) * q.per_halaman);
    const { rows } = await query(
      `${SELECT_PUBLIK} WHERE ${w} ORDER BY p.id_produk DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params,
    );
    res.json({ data: rows, total, halaman: q.halaman, per_halaman: q.per_halaman });
  }),
);

// GET /api/produk/saya
router.get(
  "/saya",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await query(`${SELECT_PUBLIK} WHERE p.id_user = $1 ORDER BY p.id_produk DESC`, [req.user.id_user]);
    res.json({ data: rows });
  }),
);

// GET /api/produk/:id
router.get(
  "/:id(\\d+)",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await query(`${SELECT_PUBLIK} WHERE p.id_produk = $1`, [req.params.id]);
    const p = rows[0];
    const boleh = p && (p.status_verifikasi === "Terverifikasi" || req.user?.id_user === p.id_user || req.user?.peran === "Admin");
    if (!boleh) throw new HttpError(404, "Produk tidak ditemukan.");
    res.json({ data: p });
  }),
);

// POST /api/produk  (Supplier: Buah/Bibit, UMKM: Olahan/Buah). Masuk antrean verifikasi admin.
router.post(
  "/",
  authenticate,
  requireVerified,
  requireRole("Supplier", "UMKM"),
  asyncHandler(async (req, res) => {
    const d = parse(produkSchema, req.body ?? {});
    if (req.user.peran === "Supplier" && d.kategori === "Olahan") {
      throw new HttpError(422, "Supplier hanya dapat menjual Buah atau Bibit.", { kategori: "Kategori tidak sesuai peran." });
    }
    const { rows } = await query(
      `INSERT INTO produk (id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.id_user, d.nama_produk, d.kategori, d.harga, d.stok, d.satuan, d.deskripsi, d.gambar],
    );
    res.status(201).json({ message: "Produk dikirim dan menunggu verifikasi admin.", data: rows[0] });
  }),
);

// PUT /api/produk/:id  (pemilik). Perubahan data produk mengembalikan status ke Menunggu.
router.put(
  "/:id(\\d+)",
  authenticate,
  asyncHandler(async (req, res) => {
    const d = parse(produkSchema.partial(), req.body ?? {});
    const cur = (await query(`SELECT * FROM produk WHERE id_produk = $1`, [req.params.id])).rows[0];
    if (!cur) throw new HttpError(404, "Produk tidak ditemukan.");
    if (cur.id_user !== req.user.id_user) throw new HttpError(403, "Bukan produk Anda.");
    const m = { ...cur, ...d };
    // Hanya perubahan stok/harga yang tidak perlu verifikasi ulang
    const perluVerifikasi = ["nama_produk", "kategori", "satuan", "deskripsi", "gambar"].some((k) => d[k] !== undefined && d[k] !== cur[k]);
    const { rows } = await query(
      `UPDATE produk SET nama_produk=$2, kategori=$3, harga=$4, stok=$5, satuan=$6, deskripsi=$7, gambar=$8,
         status_verifikasi = CASE WHEN $9 THEN 'Menunggu'::status_verifikasi ELSE status_verifikasi END
       WHERE id_produk = $1 RETURNING *`,
      [cur.id_produk, m.nama_produk, m.kategori, m.harga, m.stok, m.satuan, m.deskripsi, m.gambar, perluVerifikasi],
    );
    res.json({ data: rows[0] });
  }),
);

// DELETE /api/produk/:id  (pemilik atau admin)
router.delete(
  "/:id(\\d+)",
  authenticate,
  asyncHandler(async (req, res) => {
    const cur = (await query(`SELECT id_user FROM produk WHERE id_produk = $1`, [req.params.id])).rows[0];
    if (!cur) throw new HttpError(404, "Produk tidak ditemukan.");
    if (cur.id_user !== req.user.id_user && req.user.peran !== "Admin") throw new HttpError(403, "Bukan produk Anda.");
    try {
      await query(`DELETE FROM produk WHERE id_produk = $1`, [req.params.id]);
    } catch (e) {
      if (e.code === "23503") throw new HttpError(409, "Produk sudah dipakai di transaksi. Set stok ke 0 saja.");
      throw e;
    }
    res.status(204).end();
  }),
);

export default router;
