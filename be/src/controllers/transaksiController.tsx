import type { Request, Response } from "express";
import { prisma } from "../config/prisma.tsx";
import {
  SEED_TRANSAKSI,
  SEED_DETAIL_TRANSAKSI,
  SEED_PEMBAYARAN,
} from "../../db/seeds/transactions.seed.tsx";
import type { Transaksi, DetailTransaksi, Pembayaran } from "../types/samangga.tsx";

const transactionsFallback: Transaksi[] = [...SEED_TRANSAKSI];
const transactionDetailsFallback: DetailTransaksi[] = [...SEED_DETAIL_TRANSAKSI];
const paymentsFallback: Pembayaran[] = [...SEED_PEMBAYARAN];

export const transaksiController = {
  getAll: async (_req: Request, res: Response): Promise<void> => {
    try {
      const txs = await prisma.transaksi.findMany({
        include: {
          pengguna_transaksi_id_pembeliTopengguna: {
            select: { nama_lengkap: true },
          },
          pengguna_transaksi_id_penjualTopengguna: {
            select: { nama_lengkap: true },
          },
        },
        orderBy: { tgl_transaksi: "desc" },
      });

      const formatted = txs.map((t) => ({
        id_transaksi: t.id_transaksi,
        id_pembeli: t.id_pembeli,
        id_penjual: t.id_penjual,
        total_harga: t.total_harga,
        status: t.status,
        tgl_transaksi: t.tgl_transaksi,
        nama_pembeli: t.pengguna_transaksi_id_pembeliTopengguna.nama_lengkap,
        nama_penjual: t.pengguna_transaksi_id_penjualTopengguna.nama_lengkap,
      }));

      res.status(200).json({
        success: true,
        total: formatted.length,
        data: formatted,
      });
    } catch (error) {
      res.status(200).json({
        success: true,
        total: transactionsFallback.length,
        data: transactionsFallback,
      });
    }
  },

  getById: async (req: Request, res: Response): Promise<void> => {
    const id = parseInt(String(req.params.id), 10);
    try {
      const trx = await prisma.transaksi.findUnique({
        where: { id_transaksi: id },
        include: {
          pengguna_transaksi_id_pembeliTopengguna: {
            select: { nama_lengkap: true },
          },
          pengguna_transaksi_id_penjualTopengguna: {
            select: { nama_lengkap: true },
          },
          detail_transaksi: {
            include: {
              produk: {
                select: {
                  nama_produk: true,
                  satuan: true,
                  gambar: true,
                },
              },
            },
          },
          pembayaran: true,
          riwayat_pengiriman: {
            include: {
              mitra: {
                select: { nama_mitra_instansi: true },
              },
            },
          },
        },
      });

      if (!trx) {
        res.status(404).json({
          success: false,
          message: "Transaksi tidak ditemukan.",
        });
        return;
      }

      const items = trx.detail_transaksi.map((dt) => ({
        id_detail_transaksi: dt.id_detail_transaksi,
        id_transaksi: dt.id_transaksi,
        id_produk: dt.id_produk,
        jumlah_produk: dt.jumlah_produk,
        harga_satuan: dt.harga_satuan,
        subtotal_harga: dt.subtotal_harga,
        nama_produk: dt.produk.nama_produk,
        satuan: dt.produk.satuan,
        gambar: dt.produk.gambar,
      }));

      const pengiriman = trx.riwayat_pengiriman[0]
        ? {
            ...trx.riwayat_pengiriman[0],
            nama_mitra_instansi: trx.riwayat_pengiriman[0].mitra?.nama_mitra_instansi || null,
          }
        : null;

      res.status(200).json({
        success: true,
        data: {
          id_transaksi: trx.id_transaksi,
          id_pembeli: trx.id_pembeli,
          id_penjual: trx.id_penjual,
          total_harga: trx.total_harga,
          status: trx.status,
          tgl_transaksi: trx.tgl_transaksi,
          nama_pembeli: trx.pengguna_transaksi_id_pembeliTopengguna.nama_lengkap,
          nama_penjual: trx.pengguna_transaksi_id_penjualTopengguna.nama_lengkap,
          items,
          pembayaran: trx.pembayaran[0] || null,
          pengiriman,
        },
      });
    } catch (error) {
      const trx = transactionsFallback.find((t) => t.id_transaksi === id);
      if (!trx) {
        res.status(404).json({
          success: false,
          message: "Transaksi tidak ditemukan.",
        });
        return;
      }
      const details = transactionDetailsFallback.filter((d) => d.id_transaksi === id);
      const payment = paymentsFallback.find((p) => p.id_transaksi === id);
      res.status(200).json({
        success: true,
        data: {
          ...trx,
          items: details,
          pembayaran: payment,
        },
      });
    }
  },

  create: async (req: Request, res: Response): Promise<void> => {
    const { id_pembeli, id_penjual, items, total_harga, metode_pembayaran } = req.body;
    if (!id_pembeli || !id_penjual || !items || !total_harga) {
      res.status(400).json({
        success: false,
        message: "Data pemesanan tidak lengkap.",
      });
      return;
    }

    try {
      const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const randomCode = `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`;

      const created = await prisma.transaksi.create({
        data: {
          id_pembeli: Number(id_pembeli),
          id_penjual: Number(id_penjual),
          total_harga: parseFloat(String(total_harga)),
          status: "Pending",
          detail_transaksi: {
            create: Array.isArray(items)
              ? items
                  .filter((it) => it.id_produk && it.jumlah_produk)
                  .map((it) => ({
                    id_produk: Number(it.id_produk),
                    jumlah_produk: parseInt(String(it.jumlah_produk), 10),
                    harga_satuan: parseFloat(String(it.harga_satuan || 0)),
                    subtotal_harga: parseFloat(
                      String(it.subtotal_harga || it.jumlah_produk * (it.harga_satuan || 0))
                    ),
                  }))
              : [],
          },
          pembayaran: {
            create: [
              {
                metode_pembayaran: metode_pembayaran || "Virtual Account",
                jumlah_bayar: parseFloat(String(total_harga)),
                status_pembayaran: "Menunggu",
                id_referensi_gateway: `MID-SMG-${Date.now()}`,
                kode_pembayaran: randomCode,
                batas_waktu_bayar: deadline,
              },
            ],
          },
        },
        include: {
          pembayaran: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Pesanan berhasil dibuat.",
        data: {
          transaksi: created,
          pembayaran: created.pembayaran[0] || null,
        },
      });
    } catch (error) {
      const newTrxId = Date.now();
      const newTrx: Transaksi = {
        id_transaksi: newTrxId,
        id_pembeli: Number(id_pembeli),
        id_penjual: Number(id_penjual),
        tgl_transaksi: new Date().toISOString(),
        total_harga: Number(total_harga),
        status: "Pending",
      };
      transactionsFallback.unshift(newTrx);
      const newPayment: Pembayaran = {
        id_pembayaran: Date.now() + 1,
        id_transaksi: newTrxId,
        metode_pembayaran: metode_pembayaran || "Virtual Account",
        jumlah_bayar: Number(total_harga),
        status_pembayaran: "Menunggu",
        id_referensi_gateway: `MID-SMG-${newTrxId}`,
        kode_pembayaran: `8808${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        bukti_transfer: null,
        batas_waktu_bayar: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        tgl_bayar: null,
      };
      paymentsFallback.unshift(newPayment);
      res.status(201).json({
        success: true,
        message: "Pesanan berhasil dibuat (fallback).",
        data: {
          transaksi: newTrx,
          pembayaran: newPayment,
        },
      });
    }
  },
};
