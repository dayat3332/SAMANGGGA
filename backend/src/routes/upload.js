import { Router } from "express";
import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";
import { HttpError, asyncHandler } from "../utils.js";
import { authenticate, requireVerified } from "../middleware/auth.js";

const router = Router();

// Jenis file yang diizinkan per tipe unggahan.
const TIPE = {
  bukti: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  produk: ["image/jpeg", "image/png", "image/webp"],
  limbah: ["image/jpeg", "image/png", "image/webp"],
};
const EKSTENSI = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

/** Cocokkan isi file (magic bytes) dengan Content-Type agar file palsu ditolak. */
function isiSesuai(buf, mime) {
  if (mime === "image/jpeg") return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/png") return buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mime === "image/webp") return buf.length > 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
  if (mime === "application/pdf") return buf.length > 5 && buf.subarray(0, 5).toString("ascii") === "%PDF-";
  return false;
}

const batas = config.maxUploadMb * 1024 * 1024;

// POST /api/upload/:tipe   (tipe: bukti | produk | limbah)
// Body = isi file mentah, header Content-Type = jenis file (image/jpeg, image/png, image/webp, application/pdf).
// Balasan: { path: "/uploads/<tipe>/<nama>.<ext>" } -> simpan path ini di bukti_transfer / gambar / foto_limbah.
router.post(
  "/:tipe(bukti|produk|limbah)",
  authenticate,
  requireVerified,
  express.raw({ type: () => true, limit: batas }),
  asyncHandler(async (req, res) => {
    const tipe = req.params.tipe;
    const mime = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
    if (!TIPE[tipe].includes(mime)) {
      throw new HttpError(415, `Jenis file tidak didukung. Gunakan: ${TIPE[tipe].join(", ")}.`);
    }
    const buf = req.body;
    if (!Buffer.isBuffer(buf) || buf.length === 0) throw new HttpError(422, "File kosong.");
    if (!isiSesuai(buf, mime)) throw new HttpError(422, "Isi file tidak sesuai dengan jenis file yang dikirim.");

    const nama = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${EKSTENSI[mime]}`;
    const dir = path.join(config.uploadDir, tipe);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, nama), buf);
    res.status(201).json({ message: "File berhasil diunggah.", path: `/uploads/${tipe}/${nama}`, ukuran: buf.length });
  }),
);

export default router;
