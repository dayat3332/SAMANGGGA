import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { query, tx } from "../db.js";
import { HttpError, asyncHandler, parse } from "../utils.js";
import { authenticate, signToken } from "../middleware/auth.js";
import { config } from "../config.js";

const router = Router();

const noTelp = z
  .string()
  .trim()
  .refine((v) => /^(\+62|62|0)8[0-9]{7,12}$/.test(v.replace(/[\s-]/g, "")), "Gunakan nomor HP Indonesia, contoh 0812xxxxxxx.");

const daftarSchema = z.object({
  nama_lengkap: z.string().trim().min(3, "Nama minimal 3 karakter."),
  email: z.string().trim().toLowerCase().email("Email tidak valid."),
  no_telp: noTelp,
  peran: z.enum(["Supplier", "UMKM", "Mitra", "Konsumen"], { errorMap: () => ({ message: "Pilih peran Anda." }) }),
  alamat: z.string().trim().min(8, "Alamat minimal 8 karakter."),
  password: z.string().min(8, "Password minimal 8 karakter."),
  // Data profil khusus peran (opsional, sesuai tabel Supplier/UMKM/Mitra/Konsumen)
  profil: z.record(z.any()).optional(),
});

const str = (v, d = "") => (typeof v === "string" ? v.trim() : d);
const num = (v, d = 0) => (Number.isFinite(Number(v)) && v !== "" && v !== null ? Number(v) : d);

async function buatProfilPeran(c, user, p = {}) {
  const { id_user, peran, no_telp, nama_lengkap, alamat } = user;
  if (peran === "Supplier") {
    await c.query(
      `INSERT INTO supplier (id_user, tipe_supplier, no_telp, luas_lahan_m2, jenis_komoditas_utama, nama_bank, no_rekening)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id_user, p.tipe_supplier === "Pengepul" ? "Pengepul" : "Petani", no_telp, num(p.luas_lahan_m2),
       str(p.jenis_komoditas_utama), str(p.nama_bank), str(p.no_rekening)],
    );
  } else if (peran === "UMKM") {
    await c.query(
      `INSERT INTO umkm (id_user, nama_usaha, nib, no_telp, kategori_produk_olahan, kapasitas_produksi_bulanan, nama_bank, no_rekening)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id_user, str(p.nama_usaha, nama_lengkap), str(p.nib), no_telp, str(p.kategori_produk_olahan),
       num(p.kapasitas_produksi_bulanan), str(p.nama_bank), str(p.no_rekening)],
    );
  } else if (peran === "Mitra") {
    await c.query(
      `INSERT INTO mitra (id_user, nama_mitra_instansi, no_telp, jenis_pengolahan_limbah, kapasitas_tampung_limbah_kg, jangkauan_area, nama_bank, no_rekening)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id_user, str(p.nama_mitra_instansi, nama_lengkap), no_telp, str(p.jenis_pengolahan_limbah),
       num(p.kapasitas_tampung_limbah_kg), str(p.jangkauan_area), str(p.nama_bank), str(p.no_rekening)],
    );
  } else if (peran === "Konsumen") {
    await c.query(
      `INSERT INTO konsumen (id_user, kategori_konsumen, no_telp, alamat_pengiriman_utama, titik_koordinat)
       VALUES ($1,$2,$3,$4,$5)`,
      [id_user, p.kategori_konsumen === "Grosir" ? "Grosir" : "Ritel", no_telp,
       str(p.alamat_pengiriman_utama, alamat), str(p.titik_koordinat)],
    );
  }
}

// POST /api/auth/daftar
router.post(
  "/daftar",
  asyncHandler(async (req, res) => {
    const d = parse(daftarSchema, req.body ?? {});
    const hash = await bcrypt.hash(d.password, 10);
    await tx(async (c) => {
      const { rows } = await c.query(
        `INSERT INTO pengguna (nama_lengkap, peran, no_telp, alamat, email, password)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING id_user, peran, no_telp, nama_lengkap, alamat`,
        [d.nama_lengkap, d.peran, normalisasiTelp(d.no_telp), d.alamat, d.email, hash],
      );
      await buatProfilPeran(c, rows[0], d.profil || req.body);
    });
    res.status(201).json({
      message: "Pendaftaran diterima. Akun Anda menunggu verifikasi admin.",
      status_verifikasi: "Menunggu",
    });
  }),
);

const masukSchema = z
  .object({
    identifier: z.string().trim().min(3, "Email atau nomor WhatsApp wajib diisi.").optional(),
    email: z.string().trim().optional(), // kompatibel dengan klien lama
    password: z.string().min(1, "Password wajib diisi."),
  })
  .refine((v) => v.identifier || v.email, { message: "Email atau nomor WhatsApp wajib diisi.", path: ["identifier"] });

/** Normalisasi nomor HP Indonesia ke format 08xxxxxxxx. Mengembalikan null bila bukan nomor HP. */
function normalisasiTelp(v) {
  const x = v.replace(/[\s-]/g, "");
  if (!/^(\+62|62|0)8[0-9]{7,12}$/.test(x)) return null;
  return "0" + x.replace(/^(\+62|62|0)/, "");
}

// POST /api/auth/masuk  { identifier | email, password }
router.post(
  "/masuk",
  asyncHandler(async (req, res) => {
    const d = parse(masukSchema, req.body ?? {});
    const id = (d.identifier ?? d.email ?? "").toLowerCase();
    const telp = id.includes("@") ? null : normalisasiTelp(id);
    const { rows } = telp
      ? await query(`SELECT * FROM pengguna WHERE no_telp = $1 ORDER BY id_user LIMIT 5`, [telp])
      : await query(`SELECT * FROM pengguna WHERE lower(email) = $1`, [id]);
    let u = null;
    for (const r of rows) {
      if (await bcrypt.compare(d.password, r.password)) { u = r; break; }
    }
    if (!u) throw new HttpError(401, "Email/nomor WhatsApp atau password salah.");
    if (u.status_verifikasi === "Ditolak") throw new HttpError(403, "Akun Anda ditolak oleh admin.");
    res.json({ token: signToken(u), pengguna: bersih(u) });
  }),
);

const bersih = ({ password, ...u }) => u;

// POST /api/auth/google  { access_token }
// Login dengan Google: token dari Google Identity Services (FE) diverifikasi ke Google,
// lalu dicocokkan dengan email akun SAMANGGA yang sudah terdaftar.
router.post(
  "/google",
  asyncHandler(async (req, res) => {
    const d = parse(z.object({ access_token: z.string().min(10, "Token Google tidak valid.") }), req.body ?? {});
    if (!config.googleClientId) {
      throw new HttpError(503, "Login Google belum dikonfigurasi di server (isi GOOGLE_CLIENT_ID di .env backend).");
    }

    let tokenRes, userRes;
    try {
      tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(d.access_token)}`);
      userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { authorization: `Bearer ${d.access_token}` },
      });
    } catch {
      throw new HttpError(502, "Server tidak dapat menghubungi Google. Periksa koneksi internet backend.");
    }
    if (!tokenRes.ok || !userRes.ok) throw new HttpError(401, "Token Google tidak valid atau sudah kedaluwarsa.");

    const info = await tokenRes.json().catch(() => ({}));
    const profilGoogle = await userRes.json().catch(() => ({}));

    // Pastikan token memang diterbitkan untuk aplikasi SAMANGGA (bukan aplikasi lain).
    if (info.aud !== config.googleClientId && info.azp !== config.googleClientId) {
      throw new HttpError(401, "Token Google bukan untuk aplikasi ini.");
    }
    const email = String(profilGoogle.email ?? "").trim().toLowerCase();
    if (!email || profilGoogle.email_verified !== true) {
      throw new HttpError(401, "Email akun Google belum terverifikasi.");
    }

    const { rows } = await query(`SELECT * FROM pengguna WHERE lower(email) = $1`, [email]);
    const u = rows[0];
    if (!u) {
      throw new HttpError(
        404,
        `Email ${email} belum terdaftar di SAMANGGA. Daftar akun kemitraan dulu memakai email yang sama, lalu masuk dengan Google.`,
      );
    }
    if (u.status_verifikasi === "Ditolak") throw new HttpError(403, "Akun Anda ditolak oleh admin.");
    res.json({ token: signToken(u), pengguna: bersih(u) });
  }),
);

const TABEL_PROFIL = { Supplier: "supplier", UMKM: "umkm", Mitra: "mitra", Konsumen: "konsumen", Admin: "admin" };

// GET /api/auth/me  -> data pengguna + profil peran
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await query(`SELECT * FROM pengguna WHERE id_user = $1`, [req.user.id_user]);
    const tabel = TABEL_PROFIL[rows[0].peran];
    const profil = await query(`SELECT * FROM ${tabel} WHERE id_user = $1`, [req.user.id_user]);
    res.json({ pengguna: bersih(rows[0]), profil: profil.rows[0] ?? null });
  }),
);

// PATCH /api/auth/me  -> ubah data dasar
router.patch(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const d = parse(
      z.object({
        nama_lengkap: z.string().trim().min(3).optional(),
        no_telp: noTelp.optional(),
        alamat: z.string().trim().min(8).optional(),
      }),
      req.body ?? {},
    );
    const { rows } = await query(
      `UPDATE pengguna SET nama_lengkap = COALESCE($2, nama_lengkap), no_telp = COALESCE($3, no_telp), alamat = COALESCE($4, alamat)
       WHERE id_user = $1 RETURNING *`,
      [req.user.id_user, d.nama_lengkap ?? null, d.no_telp?.replace(/[\s-]/g, "") ?? null, d.alamat ?? null],
    );
    res.json({ pengguna: bersih(rows[0]) });
  }),
);

// POST /api/auth/ganti-password
router.post(
  "/ganti-password",
  authenticate,
  asyncHandler(async (req, res) => {
    const d = parse(
      z.object({ password_lama: z.string().min(1), password_baru: z.string().min(8, "Password minimal 8 karakter.") }),
      req.body ?? {},
    );
    const { rows } = await query(`SELECT password FROM pengguna WHERE id_user = $1`, [req.user.id_user]);
    if (!(await bcrypt.compare(d.password_lama, rows[0].password))) throw new HttpError(401, "Password lama salah.");
    await query(`UPDATE pengguna SET password = $2 WHERE id_user = $1`, [req.user.id_user, await bcrypt.hash(d.password_baru, 10)]);
    res.json({ message: "Password berhasil diubah." });
  }),
);

export default router;
