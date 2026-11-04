import { Router } from "express";
import { z } from "zod";
import { query, tx } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { authenticate, requireAccess, requireRole, requireVerified } from "../middleware/auth.js";
import { catatKeuangan } from "../services/ledger.js";

const router = Router();
const JENIS = ["Kulit", "Biji", "Buah Afkir", "Daun"];

// Estimasi harga per kg (sama dengan halaman Setor Limbah di FE bila perlu disesuaikan)
const TARIF_PER_KG = { Kulit: 1000, Biji: 1500, "Buah Afkir": 2500, Daun: 500 };

const SELECT_LISTING = `
  SELECT l.*, u.nama_usaha AS pemilik, u.id_user AS id_user_umkm, m.nama_mitra_instansi AS nama_mitra
  FROM limbah l JOIN umkm u ON u.id_umkm = l.id_umkm LEFT JOIN mitra m ON m.id_mitra = l.id_mitra`;

// GET /api/limbah?jenis=  (publik: hanya Terverifikasi)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parse(z.object({ jenis: z.enum(JENIS).optional() }), req.query);
    const params = [];
    let w = `l.status_verifikasi = 'Terverifikasi'`;
    if (q.jenis) { params.push(q.jenis); w += ` AND l.jenis_limbah = $1`; }
    const { rows } = await query(`${SELECT_LISTING} WHERE ${w} ORDER BY l.id_limbah DESC`, params);
    res.json({ data: rows });
  }),
);

// GET /api/limbah/saya  (UMKM: limbah miliknya, Mitra: limbah yang dijemputnya)
router.get(
  "/saya",
  authenticate,
  requireRole("UMKM", "Mitra"),
  asyncHandler(async (req, res) => {
    const kolom = req.user.peran === "UMKM" ? "u.id_user" : "m.id_user";
    const { rows } = await query(`${SELECT_LISTING} WHERE ${kolom} = $1 ORDER BY l.id_limbah DESC`, [req.user.id_user]);
    res.json({ data: rows });
  }),
);

// GET /api/limbah/menunggu-verifikasi  (admin)
router.get(
  "/menunggu-verifikasi",
  authenticate,
  requireAccess("Admin Limbah"),
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`${SELECT_LISTING} WHERE l.status_verifikasi = 'Menunggu' ORDER BY l.id_limbah`);
    res.json({ data: rows });
  }),
);

const setorSchema = z.object({
  jenis_limbah: z.enum(JENIS),
  berat_kg: z.coerce.number().positive("Berat harus lebih dari 0."),
  lokasi_penjemputan: z.string().trim().min(5, "Lokasi penjemputan minimal 5 karakter."),
  titik_koordinat: z.string().trim().optional(),
  foto_limbah: z.string().trim().default(""),
  kondisi: z.string().trim().max(200).default(""),
  estimasi_harga: z.coerce.number().min(0).optional(),
});

// POST /api/limbah  -> setor limbah (UMKM). Menunggu verifikasi Admin Limbah.
router.post(
  "/",
  authenticate,
  requireVerified,
  requireRole("UMKM"),
  asyncHandler(async (req, res) => {
    const d = parse(setorSchema, req.body ?? {});
    const umkm = (await query(`SELECT id_umkm FROM umkm WHERE id_user = $1`, [req.user.id_user])).rows[0];
    if (!umkm) throw new HttpError(409, "Profil UMKM belum lengkap.");
    const estimasi = d.estimasi_harga ?? Math.round(d.berat_kg * TARIF_PER_KG[d.jenis_limbah]);
    const { rows } = await query(
      `INSERT INTO limbah (id_umkm, jenis_limbah, berat_kg, estimasi_harga, lokasi_penjemputan, titik_koordinat, foto_limbah, kondisi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [umkm.id_umkm, d.jenis_limbah, d.berat_kg, estimasi, d.lokasi_penjemputan, d.titik_koordinat ?? null, d.foto_limbah, d.kondisi],
    );
    res.status(201).json({ message: "Limbah dicatat dan menunggu verifikasi admin.", data: rows[0] });
  }),
);

// PATCH /api/limbah/:id/verifikasi  { status_verifikasi }  (Admin Limbah)
router.patch(
  "/:id(\\d+)/verifikasi",
  authenticate,
  requireAccess("Admin Limbah"),
  asyncHandler(async (req, res) => {
    const { status_verifikasi } = parse(z.object({ status_verifikasi: z.enum(["Terverifikasi", "Ditolak"]) }), req.body ?? {});
    const { rows } = await query(`UPDATE limbah SET status_verifikasi = $2 WHERE id_limbah = $1 RETURNING *`, [req.params.id, status_verifikasi]);
    if (!rows[0]) throw new HttpError(404, "Limbah tidak ditemukan.");
    res.json({ data: rows[0] });
  }),
);

const jemputSchema = z.object({
  jenis_kompensasi: z.enum(["Jual Beli", "Jasa Berbayar", "Gratis"]),
  harga_kesepakatan: z.coerce.number().min(0).optional(),
  tgl_jemput: z.coerce.date().optional(),
});

// POST /api/limbah/:id/jemput  -> Mitra mengajukan penjemputan
router.post(
  "/:id(\\d+)/jemput",
  authenticate,
  requireVerified,
  requireRole("Mitra"),
  asyncHandler(async (req, res) => {
    const d = parse(jemputSchema, req.body ?? {});
    if (d.jenis_kompensasi !== "Gratis" && !(d.harga_kesepakatan > 0)) {
      throw new HttpError(422, "Harga kesepakatan wajib diisi.", { harga_kesepakatan: "Isi harga untuk Jual Beli / Jasa Berbayar." });
    }
    const hasil = await tx(async (c) => {
      const mitra = (await c.query(`SELECT id_mitra FROM mitra WHERE id_user = $1`, [req.user.id_user])).rows[0];
      if (!mitra) throw new HttpError(409, "Profil Mitra belum lengkap.");
      const l = (await c.query(`SELECT * FROM limbah WHERE id_limbah = $1 FOR UPDATE`, [req.params.id])).rows[0];
      if (!l) throw new HttpError(404, "Limbah tidak ditemukan.");
      if (l.status_verifikasi !== "Terverifikasi") throw new HttpError(409, "Limbah belum terverifikasi.");
      if (l.status_jemput !== "Tersedia" || l.id_mitra) throw new HttpError(409, "Limbah sudah dipesan mitra lain.");
      return (
        await c.query(
          `UPDATE limbah SET id_mitra=$2, status_jemput='Diajukan', jenis_kompensasi=$3, harga_kesepakatan=$4, tgl_jemput=$5
           WHERE id_limbah=$1 RETURNING *`,
          [l.id_limbah, mitra.id_mitra, d.jenis_kompensasi, d.jenis_kompensasi === "Gratis" ? 0 : d.harga_kesepakatan, d.tgl_jemput ?? null],
        )
      ).rows[0];
    });
    res.status(201).json({ message: "Penjemputan diajukan.", data: hasil });
  }),
);

const URUTAN = { Tersedia: 0, Diajukan: 1, Proses: 2, Selesai: 3 };

// PATCH /api/limbah/:id/status  { status_jemput: "Proses" | "Selesai" }  (Mitra tertaut / admin)
router.patch(
  "/:id(\\d+)/status",
  authenticate,
  asyncHandler(async (req, res) => {
    const { status_jemput } = parse(z.object({ status_jemput: z.enum(["Proses", "Selesai"]) }), req.body ?? {});
    const hasil = await tx(async (c) => {
      const l = (
        await c.query(
          `SELECT l.*, u.id_user AS user_umkm, m.id_user AS user_mitra FROM limbah l
           JOIN umkm u ON u.id_umkm = l.id_umkm LEFT JOIN mitra m ON m.id_mitra = l.id_mitra
           WHERE l.id_limbah = $1 FOR UPDATE OF l`, [req.params.id])
      ).rows[0];
      if (!l) throw new HttpError(404, "Limbah tidak ditemukan.");
      if (req.user.peran !== "Admin" && l.user_mitra !== req.user.id_user) throw new HttpError(403, "Anda bukan mitra penjemput limbah ini.");
      if (URUTAN[status_jemput] !== URUTAN[l.status_jemput] + 1) {
        throw new HttpError(409, `Status tidak dapat berubah dari ${l.status_jemput} ke ${status_jemput}.`);
      }
      const upd = (
        await c.query(
          `UPDATE limbah SET status_jemput = $2::status_jemput,
             tgl_jemput = CASE WHEN $2::status_jemput = 'Selesai' THEN now() ELSE tgl_jemput END
           WHERE id_limbah = $1 RETURNING *`, [l.id_limbah, status_jemput])
      ).rows[0];

      if (status_jemput === "Selesai" && upd.harga_kesepakatan > 0) {
        const ket = `Limbah ${upd.jenis_limbah} #${upd.id_limbah} (${upd.jenis_kompensasi})`;
        const umkmMenerima = upd.jenis_kompensasi === "Jual Beli"; // Jual Beli: Mitra bayar UMKM. Jasa Berbayar: UMKM bayar Mitra.
        await catatKeuangan(c, { id_user: l.user_umkm, id_limbah: upd.id_limbah, jenis: umkmMenerima ? "Pemasukan" : "Pengeluaran", jumlah: upd.harga_kesepakatan, keterangan: ket });
        await catatKeuangan(c, { id_user: l.user_mitra, id_limbah: upd.id_limbah, jenis: umkmMenerima ? "Pengeluaran" : "Pemasukan", jumlah: upd.harga_kesepakatan, keterangan: ket });
      }
      return upd;
    });
    res.json({ data: hasil });
  }),
);

export default router;
