import type { Request, Response } from "express";
import { prisma } from "../config/prisma.tsx";
import { SEED_PENGGUNA } from "../../db/seeds/users.seed.tsx";

export const penggunaController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const { peran, status } = req.query;
      const where: any = {};

      if (peran && typeof peran === "string") {
        where.peran = {
          equals: peran,
          mode: "insensitive",
        };
      }
      if (status && typeof status === "string") {
        where.status_verifikasi = {
          equals: status,
          mode: "insensitive",
        };
      }

      const users = await prisma.pengguna.findMany({
        where,
        orderBy: { id_user: "asc" },
      });

      res.status(200).json({
        success: true,
        total: users.length,
        data: users,
      });
    } catch (error) {
      let result = [...SEED_PENGGUNA];
      const { peran, status } = req.query;
      if (peran && typeof peran === "string") {
        result = result.filter((u) => u.peran.toLowerCase() === peran.toLowerCase());
      }
      if (status && typeof status === "string") {
        result = result.filter((u) => u.status_verifikasi.toLowerCase() === status.toLowerCase());
      }
      res.status(200).json({
        success: true,
        total: result.length,
        data: result,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    try {
      const user = await prisma.pengguna.findUnique({
        where: { id_user: id },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "Pengguna tidak ditemukan.",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      const user = SEED_PENGGUNA.find((u) => u.id_user === id);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "Pengguna tidak ditemukan.",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: user,
      });
    }
  },
};
