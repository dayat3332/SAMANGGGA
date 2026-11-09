import type { Request, Response } from "express";
import { prisma } from "../config/prisma.tsx";
import { SEED_PENGGUNA } from "../../db/seeds/users.seed.tsx";
import type { Pengguna } from "../types/samangga.tsx";

const usersFallback: Pengguna[] = [...SEED_PENGGUNA];

export const authController = {
  login: async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email dan kata sandi wajib diisi.",
      });
      return;
    }

    try {
      const user = await prisma.pengguna.findFirst({
        where: {
          email: {
            equals: String(email).trim(),
            mode: "insensitive",
          },
        },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Akun dengan email tersebut belum terdaftar di platform SAMANGGA.",
        });
        return;
      }

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
          token: `jwt_token_${user.id_user}_${Date.now()}`,
        },
      });
    } catch (error) {
      const user = usersFallback.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Akun dengan email tersebut belum terdaftar di platform SAMANGGA.",
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: "Login berhasil (fallback).",
        data: {
          user: {
            id: user.id_user,
            nama: user.nama_lengkap,
            email: user.email,
            peran: user.peran,
            statusVerifikasi: user.status_verifikasi,
          },
          token: `mock_jwt_token_${user.id_user}_${Date.now()}`,
        },
      });
    }
  },

  register: async (req: Request, res: Response): Promise<void> => {
    const { nama_lengkap, email, no_telp, peran, alamat, password, foto_persyaratan_url, foto_persyaratan_name } = req.body;
    if (!nama_lengkap || !email || !no_telp || !peran || !password) {
      res.status(400).json({
        success: false,
        message: "Semua field pendaftaran wajib diisi lengkap.",
      });
      return;
    }

    try {
      const existing = await prisma.pengguna.findFirst({
        where: {
          email: {
            equals: String(email).trim(),
            mode: "insensitive",
          },
        },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: "Email sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda.",
        });
        return;
      }

      const status_verifikasi = peran === "Mitra" ? "Menunggu" : "Terverifikasi";
      const created = await prisma.pengguna.create({
        data: {
          nama_lengkap,
          peran,
          no_telp,
          alamat: alamat || "",
          email: String(email).trim().toLowerCase(),
          password: `$2b$10$hash_${Date.now()}`,
          status_verifikasi,
          foto_persyaratan_url: foto_persyaratan_url || null,
          foto_persyaratan_name: foto_persyaratan_name || null,
        },
      });

      res.status(201).json({
        success: true,
        message: "Pendaftaran akun berhasil disimpan.",
        data: created,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Gagal mendaftarkan akun.",
      });
    }
  },

  googleAuth: async (req: Request, res: Response): Promise<void> => {
    const { email, name } = req.body;
    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email Google wajib disertakan.",
      });
      return;
    }

    try {
      let user = await prisma.pengguna.findFirst({
        where: {
          email: {
            equals: String(email).trim(),
            mode: "insensitive",
          },
        },
      });

      if (!user) {
        user = await prisma.pengguna.create({
          data: {
            nama_lengkap: name || "Pengguna Google",
            email: String(email).trim().toLowerCase(),
            peran: "Konsumen",
            no_telp: "",
            alamat: "",
            password: "$2b$10$hash_google_oauth",
            status_verifikasi: "Terverifikasi",
          },
        });
      }

      res.status(200).json({
        success: true,
        message: "Autentikasi Google berhasil.",
        data: {
          user,
          token: `google_jwt_${user.id_user}`,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Gagal autentikasi Google.",
      });
    }
  },

  getAllUsers: async (_req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.pengguna.findMany({
        orderBy: { id_user: "asc" },
      });
      res.status(200).json({
        success: true,
        total: users.length,
        data: users,
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        total: usersFallback.length,
        data: usersFallback,
      });
    }
  },
};
