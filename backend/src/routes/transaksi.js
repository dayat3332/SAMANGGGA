import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { query, tx } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { authenticate, requireRole, requireVerified } from "../middleware/auth.js";
import { batalkanTransaksi, tandaiLunas } from "../services/trx.js";

const router = Router();
router.use(authenticate);

const buatSchema = z.object({
  metode_pembayaran: z.enum(["Transfer Manual", "Virtual Account", "QRIS"]),
  items: z
    .array(z.object({ id_produk: z.coerce.number().int().positive(), jumlah_produk: z.coerce.number().int().positive() }))
    .min(1, "Keranjang kosong."),
});

const digits = (n) => Array.from({ length: n }, () => crypto.randomInt(10)).join("");

// POST /api/transaksi  -> checkout (satu penjual per transaksi)
router.post(
  "/",
  requireVerified,
  requireRole("Supplier", "UMKM", "Mitra", "Konsumen"),
  asyncHandler(async (req, res) => {
    const d = parse(buatSchema, req.body ?? {});
    // Gabungkan item duplikat
    const jumlah = new Map();
    for (const it of d.items) jumlah.set(it.id_produk, (jumlah.get(it.id_produk) || 0) + it.jumlah_produk);
    const ids = [...jumlah.keys()];

    const hasil = await tx(async (c) => {
      const { rows: produk } = await c.query(
        `SELECT * FROM produk WHERE id_produk = ANY($1::int[]) ORDER BY id_produk FOR UPDATE`,
        [ids],
      );
      if (produk.length !== ids.length) throw new HttpError(404, "Ada produk yang tidak ditemukan.");
      const penjual = new Set(produk.map((p) => p.id_user));
      if (penjual.size > 1) throw new HttpError(422, "Satu transaksi hanya boleh berisi produk dari satu penjual.");
      const id_penjual = produk[0].id_user;
      if (id_penjual === req.user.id_user) throw new HttpError(422, "Tidak dapat membeli produk sendiri.");

      let total = 0;
      for (const p of produk) {
        const qty = jumlah.get(p.id_produk);
        if (p.status_verifikasi !== "Terverifikasi") throw new HttpError(422, `Produk "${p.nama_produk}" belum tersedia.`);
        if (p.stok < qty) throw new HttpError(409, `Stok "${p.nama_produk}" tidak cukup (tersisa ${p.stok}).`);
        total += p.harga * qty;
      }

      const t = (
        await c.query(
          `INSERT INTO transaksi (id_pembeli, id_penjual, total_harga) VALUES ($1,$2,$3) RETURNING *`,
          [req.user.id_user, id_penjual, total],
        )
      ).rows[0];

      for (const p of produk) {
        const qty = jumlah.get(p.id_produk);
        await c.query(
          `INSERT INTO detail_transaksi (id_transaksi, id_produk, jumlah_produk, harga_satuan, subtotal_harga)
           VALUES ($1,$2,$3,$4,$5)`,
          [t.id_transaksi, p.id_produk, qty, p.harga, p.harga * qty],
        );
        await c.query(`UPDATE produk SET stok = stok - $2 WHERE id_produk = $1`, [p.id_produk, qty]);
      }

      // Virtual Account / QRIS: kode & referensi diberikan payment gateway (di sini dibuat placeholder)
      const gateway = d.metode_pembayaran !== "Transfer Manual";
      const kode = gateway ? (d.metode_pembayaran === "QRIS" ? `QRIS-${digits(12)}` : `8808${digits(12)}`) : null;
      const ref = gateway ? `GW-${crypto.randomUUID()}` : null;
      const bayar = (
        await c.query(
          `INSERT INTO pembayaran (id_transaksi, metode_pembayaran, jumlah_bayar, id_referensi_gateway, kode_pembayaran, batas_waktu_bayar)
           VALUES ($1,$2,$3,$4,$5, now() + interval '24 hours') RETURNING *`,
          [t.id_transaksi, d.metode_pembayaran, total, ref, kode],
        )
      ).rows[0];
      return { transaksi: t, pembayaran: bayar };
    });
    res.status(201).json({ message: "Pesanan dibuat. Silakan lakukan pembayaran.", ...hasil });
  }),
);

// GET /api/transaksi?peran=pembeli|penjual
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const peran = req.query.peran;
    const admin = req.user.peran === "Admin";
    const kondisi = admin
      ? "TRUE"
      : peran === "pembeli" ? "t.id_pembeli = $1"
      : peran === "penjual" ? "t.id_penjual = $1"
      : "(t.id_pembeli = $1 OR t.id_penjual = $1)";
    const { rows } = await query(
      `SELECT t.*, pb.nama_lengkap AS nama_pembeli, pj.nama_lengkap AS nama_penjual,
              pm.metode_pembayaran, pm.status_pembayaran
       FROM transaksi t
       JOIN pengguna pb ON pb.id_user = t.id_pembeli
       JOIN pengguna pj ON pj.id_user = t.id_penjual
       LEFT JOIN pembayaran pm ON pm.id_transaksi = t.id_transaksi
       WHERE ${kondisi} ORDER BY t.id_transaksi DESC LIMIT 200`,
      admin ? [] : [req.user.id_user],
    );
    res.json({ data: rows });
  }),
);

async function ambilTransaksi(id, user) {
  const t = (await query(`SELECT * FROM transaksi WHERE id_transaksi = $1`, [id])).rows[0];
  if (!t) throw new HttpError(404, "Transaksi tidak ditemukan.");
  if (user.peran !== "Admin" && t.id_pembeli !== user.id_user && t.id_penjual !== user.id_user) {
    throw new HttpError(403, "Bukan transaksi Anda.");
  }
  return t;
}

// GET /api/transaksi/:id  -> detail lengkap
router.get(
  "/:id(\\d+)",
  asyncHandler(async (req, res) => {
    const t = await ambilTransaksi(req.params.id, req.user);
    const [detail, bayar, kirim] = await Promise.all([
      query(
        `SELECT d.*, p.nama_produk, p.satuan FROM detail_transaksi d JOIN produk p ON p.id_produk = d.id_produk
         WHERE d.id_transaksi = $1 ORDER BY d.id_detail_transaksi`, [t.id_transaksi]),
      query(`SELECT * FROM pembayaran WHERE id_transaksi = $1`, [t.id_transaksi]),
      query(`SELECT * FROM riwayat_pengiriman WHERE id_transaksi = $1 ORDER BY id_pengiriman`, [t.id_transaksi]),
    ]);
    res.json({ transaksi: t, detail: detail.rows, pembayaran: bayar.rows[0] ?? null, pengiriman: kirim.rows });
  }),
);

// PATCH /api/transaksi/:id/status   { status: "Selesai" | "Batal" }
router.patch(
  "/:id(\\d+)/status",
  asyncHandler(async (req, res) => {
    const { status } = parse(z.object({ status: z.enum(["Selesai", "Batal"]) }), req.body ?? {});
    const hasil = await tx(async (c) => {
      const t = (await c.query(`SELECT * FROM transaksi WHERE id_transaksi = $1 FOR UPDATE`, [req.params.id])).rows[0];
      if (!t) throw new HttpError(404, "Transaksi tidak ditemukan.");
      const admin = req.user.peran === "Admin";
      const pembeli = t.id_pembeli === req.user.id_user;
      const penjual = t.id_penjual === req.user.id_user;
      if (!admin && !pembeli && !penjual) throw new HttpError(403, "Bukan transaksi Anda.");

      if (status === "Selesai") {
        if (!admin && !pembeli) throw new HttpError(403, "Hanya pembeli yang dapat mengonfirmasi pesanan diterima.");
        if (t.status !== "Diproses") throw new HttpError(409, "Hanya pesanan berstatus Diproses yang dapat diselesaikan.");
        await c.query(`UPDATE transaksi SET status = 'Selesai' WHERE id_transaksi = $1`, [t.id_transaksi]);
      } else {
        if (t.status === "Pending") {
          await batalkanTransaksi(c, t.id_transaksi, "Gagal");
        } else if (t.status === "Diproses" && (admin || penjual)) {
          // Sudah dibayar: pembatalan hanya oleh penjual/admin; refund dilakukan di luar sistem.
          await batalkanTransaksi(c, t.id_transaksi);
          res.locals.logMessage = "Transaksi dibatalkan setelah pembayaran; refund manual diperlukan.";
        } else {
          throw new HttpError(409, "Transaksi tidak dapat dibatalkan pada status ini.");
        }
      }
      return (await c.query(`SELECT * FROM transaksi WHERE id_transaksi = $1`, [t.id_transaksi])).rows[0];
    });
    res.json({ data: hasil });
  }),
);

// POST /api/transaksi/:id/bukti  { bukti_transfer }  (pembeli, Transfer Manual)
router.post(
  "/:id(\\d+)/bukti",
  asyncHandler(async (req, res) => {
    const { bukti_transfer } = parse(z.object({ bukti_transfer: z.string().trim().min(3, "Bukti transfer wajib diisi.") }), req.body ?? {});
    const t = await ambilTransaksi(req.params.id, req.user);
    if (t.id_pembeli !== req.user.id_user) throw new HttpError(403, "Hanya pembeli yang dapat mengunggah bukti.");
    const { rows } = await query(
      `UPDATE pembayaran SET bukti_transfer = $2
       WHERE id_transaksi = $1 AND metode_pembayaran = 'Transfer Manual' AND status_pembayaran = 'Menunggu' RETURNING *`,
      [t.id_transaksi, bukti_transfer],
    );
    if (!rows[0]) throw new HttpError(409, "Bukti hanya untuk Transfer Manual yang masih menunggu pembayaran.");
    res.json({ message: "Bukti transfer dikirim. Menunggu konfirmasi penjual.", pembayaran: rows[0] });
  }),
);

// POST /api/transaksi/:id/konfirmasi  { diterima: boolean }  (penjual/admin, Transfer Manual)
router.post(
  "/:id(\\d+)/konfirmasi",
  asyncHandler(async (req, res) => {
    const { diterima } = parse(z.object({ diterima: z.boolean() }), req.body ?? {});
    const t = await ambilTransaksi(req.params.id, req.user);
    if (t.id_penjual !== req.user.id_user && req.user.peran !== "Admin") throw new HttpError(403, "Hanya penjual yang dapat mengonfirmasi.");
    await tx(async (c) => {
      const p = (await c.query(`SELECT * FROM pembayaran WHERE id_transaksi = $1 FOR UPDATE`, [t.id_transaksi])).rows[0];
      if (p.metode_pembayaran !== "Transfer Manual") throw new HttpError(409, "Konfirmasi manual hanya untuk Transfer Manual.");
      if (p.status_pembayaran !== "Menunggu") throw new HttpError(409, "Pembayaran sudah diproses.");
      if (!p.bukti_transfer) throw new HttpError(409, "Pembeli belum mengunggah bukti transfer.");
      if (diterima) await tandaiLunas(c, t.id_transaksi);
      else await batalkanTransaksi(c, t.id_transaksi, "Gagal");
    });
    res.json({ message: diterima ? "Pembayaran dikonfirmasi." : "Pembayaran ditolak, pesanan dibatalkan." });
  }),
);

// POST /api/transaksi/:id/pengiriman  { no_resi_lacak, id_mitra? }  (penjual/admin)
router.post(
  "/:id(\\d+)/pengiriman",
  asyncHandler(async (req, res) => {
    const d = parse(
      z.object({ no_resi_lacak: z.string().trim().min(3, "Nomor resi wajib diisi."), id_mitra: z.coerce.number().int().positive().optional() }),
      req.body ?? {},
    );
    const t = await ambilTransaksi(req.params.id, req.user);
    if (t.id_penjual !== req.user.id_user && req.user.peran !== "Admin") throw new HttpError(403, "Hanya penjual yang dapat membuat pengiriman.");
    if (t.status !== "Diproses") throw new HttpError(409, "Pengiriman hanya untuk pesanan yang sudah dibayar (Diproses).");
    const { rows } = await query(
      `INSERT INTO riwayat_pengiriman (id_transaksi, id_mitra, no_resi_lacak) VALUES ($1,$2,$3) RETURNING *`,
      [t.id_transaksi, d.id_mitra ?? null, d.no_resi_lacak],
    );
    res.status(201).json({ data: rows[0] });
  }),
);

// PATCH /api/transaksi/pengiriman/:idPengiriman  { status_pengiriman }  (penjual / mitra tertaut / admin)
router.patch(
  "/pengiriman/:idPengiriman(\\d+)",
  asyncHandler(async (req, res) => {
    const { status_pengiriman } = parse(
      z.object({ status_pengiriman: z.enum(["Diproses", "Dalam Perjalanan", "Tiba di Lokasi"]) }),
      req.body ?? {},
    );
    const r = (
      await query(
        `SELECT r.*, t.id_penjual, m.id_user AS user_mitra FROM riwayat_pengiriman r
         JOIN transaksi t ON t.id_transaksi = r.id_transaksi LEFT JOIN mitra m ON m.id_mitra = r.id_mitra
         WHERE r.id_pengiriman = $1`, [req.params.idPengiriman])
    ).rows[0];
    if (!r) throw new HttpError(404, "Data pengiriman tidak ditemukan.");
    const boleh = req.user.peran === "Admin" || r.id_penjual === req.user.id_user || r.user_mitra === req.user.id_user;
    if (!boleh) throw new HttpError(403, "Anda tidak menangani pengiriman ini.");
    const { rows } = await query(
      `UPDATE riwayat_pengiriman SET status_pengiriman = $2::status_pengiriman,
         tgl_diterima = CASE WHEN $2::status_pengiriman = 'Tiba di Lokasi' THEN now() ELSE tgl_diterima END
       WHERE id_pengiriman = $1 RETURNING *`,
      [r.id_pengiriman, status_pengiriman],
    );
    res.json({ data: rows[0] });
  }),
);

export default router;
