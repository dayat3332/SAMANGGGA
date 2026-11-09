import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { pool, withTx } from "../config/db.tsx";
import { sendError } from "../utils/httpError.tsx";
import { requireText, optionalText } from "../utils/parse.tsx";
import { ensureKonsumen, logAktivitas } from "../services/akunService.tsx";

const PERAN_DAFTAR = ["Supplier", "UMKM", "Mitra", "Konsumen"] as const;

function sanitizeUser(u: any) {
  const { password, ...rest } = u;
  return rest;
}

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const identifier = requireText(req.body?.email, "Email atau nomor WhatsApp");
      const password = requireText(req.body?.password, "Kata sandi");
      const isEmail = identifier.includes("@");
      const key = isEmail ? identifier.toLowerCase() : identifier.replace(/\D/g, "");
      const { rows } = await pool.query(
        `SELECT * FROM pengguna
          WHERE ($1 = TRUE AND LOWER(email) = $2)
             OR ($1 = FALSE AND regexp_replace(COALESCE(no_telp, ''), '[^0-9]', '', 'g') = $2)
          ORDER BY id_user ASC
          LIMIT 1`,
        [isEmail, key],
      );
      const user = rows[0];
      if (!user) {
        res.status(401).json({ success: false, message: "Akun dengan email tersebut belum terdaftar di platform SAMANGGA." });
        return;
      }
      const cocok = await bcrypt.compare(password, user.password).catch(() => false);
      if (!cocok) {
        res.status(401).json({ success: false, message: "Kata sandi yang Anda masukkan salah." });
        return;
      }
      await logAktivitas(pool, user.id_user, "LOGIN", "/api/auth/login", `Pengguna ${user.nama_lengkap} masuk ke platform.`);
      res.status(200).json({
        success: true,
        message: "Login berhasil.",
        data: {
          user: {
            id: user.id_user,
            nama: user.nama_lengkap,
            email: user.email,
            peran: user.peran,
            statusVerifikasi: user.status_verifikasi,
          },
          token: randomUUID(),
        },
      });
    } catch (err) {
      sendError(res, err);
    }
  },

  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const nama = requireText(req.body?.nama_lengkap, "Nama lengkap", 3);
      const email = requireText(req.body?.email, "Email").toLowerCase();
      const noTelp = requireText(req.body?.no_telp, "Nomor telepon");
      const peran = req.body?.peran;
      if (!(PERAN_DAFTAR as readonly string[]).includes(peran)) {
        res.status(400).json({ success: false, message: "Peran tidak valid. Pilih Supplier, UMKM, Mitra, atau Konsumen." });
        return;
      }
      const password = requireText(req.body?.password, "Kata sandi", 8);
      const alamat = optionalText(req.body?.alamat) || "";
      const statusVerifikasi = peran === "Supplier" || peran === "Mitra" ? "Menunggu" : "Terverifikasi";

      const existing = await pool.query(`SELECT 1 FROM pengguna WHERE LOWER(email) = $1`, [email]);
      if (existing.rows.length) {
        res.status(409).json({ success: false, message: "Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda." });
        return;
      }

      const hash = await bcrypt.hash(password, 10);
      const created = await withTx(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO pengguna (nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi, foto_persyaratan_url, foto_persyaratan_name)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           RETURNING *`,
          [
            nama,
            peran,
            noTelp,
            alamat,
            email,
            hash,
            statusVerifikasi,
            optionalText(req.body?.foto_persyaratan_url),
            optionalText(req.body?.foto_persyaratan_name),
          ],
        );
        const user = rows[0];
        if (peran === "Supplier") await client.query(`INSERT INTO supplier (id_user, tipe_supplier, no_telp) VALUES ($1, 'Petani', $2)`, [user.id_user, noTelp]);
        if (peran === "Konsumen") await ensureKonsumen(client, user.id_user);
        if (peran === "UMKM")
          await client.query(`INSERT INTO umkm (id_user, nama_usaha, no_telp) VALUES ($1, $2, $3)`, [user.id_user, optionalText(req.body?.nama_usaha) || nama, noTelp]);
        if (peran === "Mitra")
          await client.query(`INSERT INTO mitra (id_user, nama_mitra_instansi, no_telp) VALUES ($1, $2, $3)`, [user.id_user, optionalText(req.body?.nama_usaha) || nama, noTelp]);
        await logAktivitas(client, user.id_user, "DAFTAR_AKUN", "/api/auth/register", `Pendaftaran akun ${peran} atas nama ${nama}.`);
        return user;
      });

      res.status(201).json({
        success: true,
        message: "Pendaftaran akun berhasil disimpan.",
        data: sanitizeUser(created),
      });
    } catch (err) {
      sendError(res, err);
    }
  },

  googleAuth: async (req: Request, res: Response): Promise<void> => {
    try {
      const email = requireText(req.body?.email, "Email Google").toLowerCase();
      const name = optionalText(req.body?.name) || "Pengguna Google";
      const { rows } = await pool.query(`SELECT * FROM pengguna WHERE LOWER(email) = $1`, [email]);
      let user = rows[0];
      if (!user) {
        user = await withTx(async (client) => {
          const created = await client.query(
            `INSERT INTO pengguna (nama_lengkap, peran, no_telp, alamat, email, password, status_verifikasi)
             VALUES ($1, 'Konsumen', '', '', $2, $3, 'Terverifikasi') RETURNING *`,
            [name, email, await bcrypt.hash(randomUUID(), 10)],
          );
          await ensureKonsumen(client, created.rows[0].id_user);
          return created.rows[0];
        });
      }
      res.status(200).json({
        success: true,
        message: "Autentikasi Google berhasil.",
        data: {
          user: {
            id: user.id_user,
            nama: user.nama_lengkap,
            email: user.email,
            peran: user.peran,
            statusVerifikasi: user.status_verifikasi,
          },
          token: randomUUID(),
        },
      });
    } catch (err) {
      sendError(res, err);
    }
  },

  getAllUsers: async (_req: Request, res: Response): Promise<void> => {
    try {
      const { rows } = await pool.query(`SELECT * FROM pengguna ORDER BY id_user ASC`);
      res.status(200).json({ success: true, total: rows.length, data: rows.map(sanitizeUser) });
    } catch (err) {
      sendError(res, err);
    }
  },
};

