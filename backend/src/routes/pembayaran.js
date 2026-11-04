import { Router } from "express";
import { z } from "zod";
import { tx } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { config } from "../config.js";
import { authenticate } from "../middleware/auth.js";
import { batalkanTransaksi, tandaiLunas } from "../services/trx.js";

const router = Router();

// POST /api/pembayaran/callback  -> dipanggil payment gateway (Virtual Account / QRIS)
// Header wajib: x-callback-token. Idempoten: hanya memproses pembayaran berstatus Menunggu.
router.post(
  "/callback",
  asyncHandler(async (req, res) => {
    if (req.headers["x-callback-token"] !== config.callbackToken) throw new HttpError(401, "Token callback tidak valid.");
    const d = parse(
      z.object({ id_referensi_gateway: z.string().min(3), status: z.enum(["Berhasil", "Gagal", "Kedaluwarsa"]) }),
      req.body ?? {},
    );
    await tx(async (c) => {
      const p = (
        await c.query(`SELECT * FROM pembayaran WHERE id_referensi_gateway = $1 FOR UPDATE`, [d.id_referensi_gateway])
      ).rows[0];
      if (!p) throw new HttpError(404, "Referensi gateway tidak ditemukan.");
      if (p.status_pembayaran !== "Menunggu") return;
      if (d.status === "Berhasil") await tandaiLunas(c, p.id_transaksi);
      else await batalkanTransaksi(c, p.id_transaksi, d.status);
    });
    res.json({ message: "Callback diproses." });
  }),
);

// POST /api/pembayaran/simulasi/:idTransaksi  -> HANYA untuk demo/pengembangan (NODE_ENV != production).
// Meniru callback gateway "Berhasil" untuk Virtual Account / QRIS, dipanggil pembeli dari halaman Pesan.
router.post(
  "/simulasi/:idTransaksi(\\d+)",
  authenticate,
  asyncHandler(async (req, res) => {
    if (config.isProd) throw new HttpError(404, "Endpoint tidak ditemukan.");
    await tx(async (c) => {
      const t = (await c.query(`SELECT * FROM transaksi WHERE id_transaksi = $1 FOR UPDATE`, [req.params.idTransaksi])).rows[0];
      if (!t) throw new HttpError(404, "Transaksi tidak ditemukan.");
      if (t.id_pembeli !== req.user.id_user) throw new HttpError(403, "Bukan transaksi Anda.");
      const p = (await c.query(`SELECT * FROM pembayaran WHERE id_transaksi = $1 FOR UPDATE`, [t.id_transaksi])).rows[0];
      if (!p || p.metode_pembayaran === "Transfer Manual") throw new HttpError(409, "Simulasi hanya untuk Virtual Account / QRIS.");
      if (p.status_pembayaran !== "Menunggu") throw new HttpError(409, "Pembayaran sudah diproses.");
      await tandaiLunas(c, t.id_transaksi);
    });
    res.locals.logMessage = "Simulasi pembayaran gateway (demo)";
    res.json({ message: "Pembayaran disimulasikan berhasil." });
  }),
);

export default router;
