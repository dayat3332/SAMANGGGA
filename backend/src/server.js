import { pathToFileURL } from "node:url";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { pool } from "./db.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler, notFound } from "./middleware/error.js";
import auth from "./routes/auth.js";
import produk from "./routes/produk.js";
import transaksi from "./routes/transaksi.js";
import pembayaran from "./routes/pembayaran.js";
import limbah from "./routes/limbah.js";
import keuangan from "./routes/keuangan.js";
import admin from "./routes/admin.js";
import upload from "./routes/upload.js";
import path from "node:path";

export const app = express();
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

// File unggahan (foto produk, foto limbah, bukti transfer) disajikan statis
app.use("/uploads", express.static(path.resolve(config.uploadDir), { index: false, dotfiles: "deny", maxAge: "7d" }));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "database tidak tersedia" });
  }
});

// Batasi percobaan login/daftar (anti brute force)
app.use("/api/auth/masuk", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use("/api/auth/daftar", rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }));
app.use("/api/auth/google", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));

app.use("/api/auth", auth);
app.use("/api/produk", produk);
app.use("/api/transaksi", transaksi);
app.use("/api/pembayaran", pembayaran);
app.use("/api/limbah", limbah);
app.use("/api/keuangan", keuangan);
app.use("/api/admin", admin);
app.use("/api/upload", upload);

app.use(notFound);
app.use(errorHandler);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  app.listen(config.port, () => console.log(`SAMANGGA API berjalan di http://localhost:${config.port}`));
}
