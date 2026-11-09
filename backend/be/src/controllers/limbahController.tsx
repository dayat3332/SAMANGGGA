import type { Request, Response } from "express";
import { prisma } from "../config/prisma.tsx";
import { SEED_LIMBAH } from "../../db/seeds/waste.seed.tsx";
import type { Limbah } from "../types/samangga.tsx";

const wasteFallback: Limbah[] = [...SEED_LIMBAH];

export const limbahController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const { jenis, status } = req.query;
      const where: any = {};

      if (jenis && typeof jenis === "string" && jenis !== "Semua") {
        where.jenis_limbah = {
          equals: jenis,
          mode: "insensitive",
        };
      }
      if (status && typeof status === "string") {
        where.status_jemput = {
          equals: status,
          mode: "insensitive",
        };
      }

      const items = await prisma.limbah.findMany({
        where,
        include: {
          umkm: {
            include: {
              pengguna: {
                select: {
                  nama_lengkap: true,
                },
              },
            },
          },
        },
        orderBy: { tgl_input: "desc" },
      });

      const formatted = items.map((l) => ({
        ...l,
        nama_usaha: l.umkm?.nama_usaha || null,
        nama_pemilik_umkm: l.umkm?.pengguna?.nama_lengkap || null,
      }));

      res.status(200).json({
        success: true,
        total: formatted.length,
        data: formatted,
      });
    } catch (error) {
      const { jenis, status } = req.query;
      let result = [...wasteFallback];
      if (jenis && typeof jenis === "string" && jenis !== "Semua") {
        result = result.filter((w) => w.jenis_limbah.toLowerCase() === jenis.toLowerCase());
      }
      if (status && typeof status === "string") {
        result = result.filter((w) => w.status_jemput.toLowerCase() === status.toLowerCase());
      }
      res.status(200).json({
        success: true,
        total: result.length,
        data: result,
      });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const { id_umkm, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, lokasi_penjemputan, titik_koordinat, foto_limbah } = req.body;
    if (!jenis_limbah || !berat_kg || !lokasi_penjemputan) {
      res.status(400).json({
        success: false,
        message: "Jenis limbah, berat (kg), dan lokasi penjemputan wajib diisi.",
      });
      return;
    }

    try {
      const created = await prisma.limbah.create({
        data: {
          id_umkm: id_umkm || 1,
          jenis_limbah,
          berat_kg: parseFloat(String(berat_kg)),
          estimasi_harga: parseFloat(String(estimasi_harga || 0)),
          jenis_kompensasi: jenis_kompensasi || "Jual Beli",
          lokasi_penjemputan,
          titik_koordinat: titik_koordinat || null,
          foto_limbah: foto_limbah || "/images/limbah/limbah_kulit_mangga.jpg",
          status_jemput: "Tersedia",
          status_verifikasi: "Terverifikasi",
        },
      });

      res.status(201).json({
        success: true,
        message: "Setor limbah sirkular berhasil dicatat ke sistem.",
        data: created,
      });
    } catch (error) {
      const newWaste: Limbah = {
        id_limbah: Date.now(),
        id_umkm: Number(id_umkm || 1),
        id_mitra: null,
        jenis_limbah,
        berat_kg: Number(berat_kg),
        estimasi_harga: Number(estimasi_harga || 0),
        jenis_kompensasi: jenis_kompensasi || "Jual Beli",
        harga_kesepakatan: null,
        lokasi_penjemputan,
        titik_koordinat: null,
        foto_limbah: foto_limbah || "/images/limbah/limbah_kulit_mangga.jpg",
        status_jemput: "Tersedia",
        tgl_jemput: null,
        status_verifikasi: "Terverifikasi",
        tgl_input: new Date().toISOString(),
      };
      wasteFallback.unshift(newWaste);
      res.status(201).json({
        success: true,
        message: "Setor limbah sirkular berhasil dicatat ke sistem (fallback).",
        data: newWaste,
      });
    }
  },

  claimPickup: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    const { id_mitra, tgl_jemput, harga_kesepakatan } = req.body;

    try {
      const existing = await prisma.limbah.findUnique({
        where: { id_limbah: id },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Data limbah tidak ditemukan.",
        });
        return;
      }

      const updated = await prisma.limbah.update({
        where: { id_limbah: id },
        data: {
          id_mitra: id_mitra || 1,
          status_jemput: "Proses",
          tgl_jemput: tgl_jemput ? new Date(tgl_jemput) : new Date(),
          harga_kesepakatan:
            harga_kesepakatan !== undefined
              ? parseFloat(String(harga_kesepakatan))
              : existing.harga_kesepakatan ?? existing.estimasi_harga,
        },
      });

      res.status(200).json({
        success: true,
        message: "Pengajuan jemput limbah berhasil diproses.",
        data: updated,
      });
    } catch (error) {
      const item = wasteFallback.find((w) => w.id_limbah === id);
      if (!item) {
        res.status(404).json({
          success: false,
          message: "Data limbah tidak ditemukan.",
        });
        return;
      }
      item.id_mitra = id_mitra || 1;
      item.status_jemput = "Proses";
      item.tgl_jemput = tgl_jemput || new Date().toISOString();
      res.status(200).json({
        success: true,
        message: "Pengajuan jemput limbah berhasil diproses (fallback).",
        data: item,
      });
    }
  },
};
