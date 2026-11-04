import { Router } from "express";
import { z } from "zod";
import { query } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/keuangan?dari=YYYY-MM-DD&sampai=YYYY-MM-DD  -> riwayat + ringkasan milik sendiri
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const q = parse(z.object({ dari: z.coerce.date().optional(), sampai: z.coerce.date().optional() }), req.query);
    const params = [req.user.id_user];
    let w = "id_user = $1";
    if (q.dari) { params.push(q.dari); w += ` AND tgl_pencatatan >= $${params.length}`; }
    if (q.sampai) { params.push(q.sampai); w += ` AND tgl_pencatatan < ($${params.length}::date + 1)`; }
    const [riwayat, ringkas] = await Promise.all([
      query(`SELECT * FROM pencatatan_keuangan WHERE ${w} ORDER BY tgl_pencatatan DESC, id_keuangan DESC LIMIT 500`, params),
      query(
        `SELECT COALESCE(SUM(jumlah_uang) FILTER (WHERE jenis_transaksi='Pemasukan'),0) AS total_pemasukan,
                COALESCE(SUM(jumlah_uang) FILTER (WHERE jenis_transaksi='Pengeluaran'),0) AS total_pengeluaran
         FROM pencatatan_keuangan WHERE ${w}`, params),
    ]);
    const r = ringkas.rows[0];
    res.json({ ringkasan: { ...r, saldo: r.total_pemasukan - r.total_pengeluaran }, data: riwayat.rows });
  }),
);

const manualSchema = z
  .object({
    id_transaksi: z.coerce.number().int().positive().optional(),
    id_limbah: z.coerce.number().int().positive().optional(),
    jenis_transaksi: z.enum(["Pemasukan", "Pengeluaran"]),
    jumlah_uang: z.coerce.number().positive("Jumlah harus lebih dari 0."),
    keterangan: z.string().trim().min(3, "Keterangan minimal 3 karakter."),
  })
  .refine((v) => v.id_transaksi || v.id_limbah, { message: "Salah satu dari id_transaksi atau id_limbah wajib diisi.", path: ["id_transaksi"] });

// POST /api/keuangan  -> catatan manual, harus terkait transaksi/limbah milik sendiri (aturan ERD)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const d = parse(manualSchema, req.body ?? {});
    if (d.id_transaksi) {
      const t = (await query(`SELECT 1 FROM transaksi WHERE id_transaksi=$1 AND (id_pembeli=$2 OR id_penjual=$2)`, [d.id_transaksi, req.user.id_user])).rows[0];
      if (!t) throw new HttpError(403, "Transaksi bukan milik Anda.");
    }
    if (d.id_limbah) {
      const l = (
        await query(
          `SELECT 1 FROM limbah l JOIN umkm u ON u.id_umkm = l.id_umkm LEFT JOIN mitra m ON m.id_mitra = l.id_mitra
           WHERE l.id_limbah=$1 AND (u.id_user=$2 OR m.id_user=$2)`, [d.id_limbah, req.user.id_user])
      ).rows[0];
      if (!l) throw new HttpError(403, "Limbah bukan milik Anda.");
    }
    const { rows } = await query(
      `INSERT INTO pencatatan_keuangan (id_user, id_transaksi, id_limbah, jenis_transaksi, jumlah_uang, keterangan)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id_user, d.id_transaksi ?? null, d.id_limbah ?? null, d.jenis_transaksi, d.jumlah_uang, d.keterangan],
    );
    res.status(201).json({ data: rows[0] });
  }),
);

export default router;
