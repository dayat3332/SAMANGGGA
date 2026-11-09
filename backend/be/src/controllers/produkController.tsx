import type { Request, Response } from "express";
import { prisma } from "../config/prisma.tsx";
import { SEED_PRODUK } from "../../db/seeds/products.seed.tsx";
import type { Produk } from "../types/samangga.tsx";

const productsFallback: Produk[] = [...SEED_PRODUK];

export const produkController = {
  getAll: async (req: Request, res: Response): Promise<void> => {
    try {
      const { kategori, search } = req.query;
      const where: any = {};

      if (kategori && typeof kategori === "string" && kategori !== "Semua") {
        where.kategori = {
          equals: kategori,
          mode: "insensitive",
        };
      }

      if (search && typeof search === "string") {
        where.OR = [
          { nama_produk: { contains: search, mode: "insensitive" } },
          { deskripsi: { contains: search, mode: "insensitive" } },
        ];
      }

      const products = await prisma.produk.findMany({
        where,
        orderBy: { tgl_dibuat: "desc" },
      });

      res.status(200).json({
        success: true,
        total: products.length,
        data: products,
      });
    } catch (error) {
      const { kategori, search } = req.query;
      let result = [...productsFallback];
      if (kategori && typeof kategori === "string" && kategori !== "Semua") {
        result = result.filter((p) => p.kategori.toLowerCase() === kategori.toLowerCase());
      }
      if (search && typeof search === "string") {
        const q = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.nama_produk.toLowerCase().includes(q) ||
            (p.deskripsi && p.deskripsi.toLowerCase().includes(q)) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
        );
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
      const product = await prisma.produk.findUnique({
        where: { id_produk: id },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      const item = productsFallback.find((p) => p.id_produk === id);
      if (!item) {
        res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: item,
      });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const { nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, id_user, tags, lokasi } = req.body;
    if (!nama_produk || !kategori || !harga || !satuan) {
      res.status(400).json({
        success: false,
        message: "Nama produk, kategori, harga, dan satuan wajib diisi.",
      });
      return;
    }

    try {
      const created = await prisma.produk.create({
        data: {
          id_user: id_user || 101,
          nama_produk,
          kategori,
          harga: parseFloat(String(harga)),
          stok: parseInt(String(stok || 0), 10),
          satuan,
          deskripsi: deskripsi || null,
          gambar: gambar || "/images/mangga/mangga_gincu.jpg",
          status_verifikasi: "Terverifikasi",
          lokasi: lokasi || "Indramayu",
          tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
        },
      });

      res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan ke katalog.",
        data: created,
      });
    } catch (error) {
      const newProduct: Produk = {
        id_produk: Date.now(),
        id_user: id_user || 101,
        nama_produk,
        kategori,
        harga: Number(harga),
        stok: Number(stok || 0),
        satuan,
        deskripsi: deskripsi || "",
        gambar: gambar || "/images/mangga/mangga_gincu.jpg",
        status_verifikasi: "Terverifikasi",
        tags: tags || [],
        lokasi: lokasi || "Indramayu",
      };
      productsFallback.unshift(newProduct);
      res.status(201).json({
        success: true,
        message: "Produk berhasil ditambahkan ke katalog (fallback).",
        data: newProduct,
      });
    }
  },

  delete: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    try {
      const existing = await prisma.produk.findUnique({
        where: { id_produk: id },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
        return;
      }

      await prisma.produk.delete({
        where: { id_produk: id },
      });

      res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus.",
        data: existing,
      });
    } catch (error) {
      const idx = productsFallback.findIndex((p) => p.id_produk === id);
      if (idx === -1) {
        res.status(404).json({
          success: false,
          message: "Produk tidak ditemukan.",
        });
        return;
      }
      const removed = productsFallback.splice(idx, 1)[0];
      res.status(200).json({
        success: true,
        message: "Produk berhasil dihapus (fallback).",
        data: removed,
      });
    }
  },
};
