import type { Request, Response } from "express";
import { umkmService } from "../services/umkmService.tsx";

export const umkmController = {
  /**
   * GET /api/umkm
   * Mengambil semua daftar UMKM terdaftar
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.query;
      const data = await umkmService.getAllUmkm(typeof status === "string" ? status : undefined);
      res.status(200).json({
        success: true,
        total: data.length,
        data,
      });
    } catch (error: any) {
      console.error("Error umkmController.getAll:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat daftar UMKM.",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/umkm/profil/:id
   * Mengambil profil UMKM berdasarkan id_user (default) atau id_umkm (?by_umkm_id=true)
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const isUmkmId = req.query.by_umkm_id === "true";
      const profile = await umkmService.getProfile(isUmkmId ? { id_umkm: id } : { id_user: id });

      if (!profile) {
        res.status(404).json({
          success: false,
          message: "Profil UMKM tidak ditemukan.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error("Error umkmController.getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat profil UMKM.",
        error: error.message,
      });
    }
  },

  /**
   * PUT /api/umkm/profil/:id
   * Memperbarui profil UMKM berdasarkan id_user
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id), 10);
      const updated = await umkmService.updateProfile(id_user, req.body);
      res.status(200).json({
        success: true,
        message: "Profil UMKM berhasil diperbarui.",
        data: updated,
      });
    } catch (error: any) {
      console.error("Error umkmController.updateProfile:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal memperbarui profil UMKM.",
      });
    }
  },

  /**
   * GET /api/umkm/dashboard/:id
   * Mengambil statistik ringkasan dan dashboard operasional UMKM
   */
  async getDashboard(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const isUmkmId = req.query.by_umkm_id === "true";
      const metrics = await umkmService.getDashboard(isUmkmId ? { id_umkm: id } : { id_user: id });
      res.status(200).json({
        success: true,
        message: "Data dashboard operasional UMKM berhasil dimuat.",
        data: metrics,
      });
    } catch (error: any) {
      console.error("Error umkmController.getDashboard:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Gagal memuat data dashboard UMKM.",
      });
    }
  },

  /**
   * GET /api/umkm/produk/:id_user
   * Mengambil daftar produk olahan milik UMKM
   */
  async getProducts(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id_user), 10);
      const { kategori, search } = req.query;
      const products = await umkmService.getProducts(id_user, {
        kategori: typeof kategori === "string" ? kategori : undefined,
        search: typeof search === "string" ? search : undefined,
      });
      res.status(200).json({
        success: true,
        total: products.length,
        data: products,
      });
    } catch (error: any) {
      console.error("Error umkmController.getProducts:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat produk UMKM.",
        error: error.message,
      });
    }
  },

  /**
   * POST /api/umkm/produk
   * Menambah produk olahan baru
   */
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id_user, nama_produk, kategori, harga, stok, satuan, deskripsi, gambar, lokasi, tags } = req.body;
      if (!id_user || !nama_produk || harga === undefined || !satuan) {
        res.status(400).json({
          success: false,
          message: "id_user, nama_produk, harga, dan satuan wajib diisi.",
        });
        return;
      }

      const newProduct = await umkmService.createProduct(parseInt(String(id_user), 10), {
        nama_produk,
        kategori,
        harga,
        stok,
        satuan,
        deskripsi,
        gambar,
        lokasi,
        tags,
      });

      res.status(201).json({
        success: true,
        message: `Produk '${newProduct.nama_produk}' berhasil ditambahkan ke katalog.`,
        data: newProduct,
      });
    } catch (error: any) {
      console.error("Error umkmController.createProduct:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal menambahkan produk olahan.",
      });
    }
  },

  /**
   * PUT /api/umkm/produk/:id
   * Memperbarui produk olahan
   */
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const id_produk = parseInt(String(req.params.id), 10);
      const { id_user } = req.body;
      if (!id_user) {
        res.status(400).json({
          success: false,
          message: "id_user wajib disertakan untuk verifikasi kepemilikan.",
        });
        return;
      }

      const updated = await umkmService.updateProduct(id_produk, parseInt(String(id_user), 10), req.body);
      res.status(200).json({
        success: true,
        message: `Produk '${updated.nama_produk}' berhasil diperbarui.`,
        data: updated,
      });
    } catch (error: any) {
      console.error("Error umkmController.updateProduct:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal memperbarui produk olahan.",
      });
    }
  },

  /**
   * DELETE /api/umkm/produk/:id
   * Menghapus produk olahan
   */
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const id_produk = parseInt(String(req.params.id), 10);
      const id_user = req.body?.id_user || req.query?.id_user;
      if (!id_user) {
        res.status(400).json({
          success: false,
          message: "id_user wajib disertakan.",
        });
        return;
      }

      await umkmService.deleteProduct(id_produk, parseInt(String(id_user), 10));
      res.status(200).json({
        success: true,
        message: `Produk #${id_produk} berhasil dihapus.`,
      });
    } catch (error: any) {
      console.error("Error umkmController.deleteProduct:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal menghapus produk olahan.",
      });
    }
  },

  /**
   * GET /api/umkm/limbah/:id_umkm
   * Mengambil riwayat setoran limbah UMKM
   */
  async getMyWaste(req: Request, res: Response): Promise<void> {
    try {
      const id_umkm = parseInt(String(req.params.id_umkm), 10);
      const { status } = req.query;
      const data = await umkmService.getMyWaste(id_umkm, typeof status === "string" ? status : undefined);
      res.status(200).json({
        success: true,
        total: data.length,
        data,
      });
    } catch (error: any) {
      console.error("Error umkmController.getMyWaste:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat daftar limbah UMKM.",
        error: error.message,
      });
    }
  },

  /**
   * POST /api/umkm/limbah
   * Menyetor/mendaftarkan limbah dapur olahan ke Pasar Sirkular
   */
  async createWasteDeposit(req: Request, res: Response): Promise<void> {
    try {
      const { id_umkm, jenis_limbah, berat_kg, estimasi_harga, jenis_kompensasi, lokasi_penjemputan, titik_koordinat, foto_limbah } = req.body;
      if (!id_umkm || !jenis_limbah || !berat_kg || !lokasi_penjemputan) {
        res.status(400).json({
          success: false,
          message: "id_umkm, jenis_limbah, berat_kg, dan lokasi_penjemputan wajib diisi.",
        });
        return;
      }

      const created = await umkmService.createWasteDeposit(parseInt(String(id_umkm), 10), {
        jenis_limbah,
        berat_kg,
        estimasi_harga,
        jenis_kompensasi,
        lokasi_penjemputan,
        titik_koordinat,
        foto_limbah,
      });

      res.status(201).json({
        success: true,
        message: `Setoran limbah ${created.jenis_limbah} (${created.berat_kg} kg) berhasil didaftarkan di Bursa Sirkular.`,
        data: created,
      });
    } catch (error: any) {
      console.error("Error umkmController.createWasteDeposit:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal menyetor limbah ke pasar sirkular.",
      });
    }
  },

  /**
   * GET /api/umkm/transaksi/penjualan/:id_user
   * Mengambil pesanan penjualan olahan masuk
   */
  async getSalesOrders(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id_user), 10);
      const { status } = req.query;
      const data = await umkmService.getSalesOrders(id_user, typeof status === "string" ? status : undefined);
      res.status(200).json({
        success: true,
        total: data.length,
        data,
      });
    } catch (error: any) {
      console.error("Error umkmController.getSalesOrders:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat transaksi penjualan.",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/umkm/transaksi/pembelian/:id_user
   * Mengambil pesanan pembelian bahan baku dari petani
   */
  async getPurchaseOrders(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id_user), 10);
      const { status } = req.query;
      const data = await umkmService.getPurchaseOrders(id_user, typeof status === "string" ? status : undefined);
      res.status(200).json({
        success: true,
        total: data.length,
        data,
      });
    } catch (error: any) {
      console.error("Error umkmController.getPurchaseOrders:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat transaksi pembelian bahan baku.",
        error: error.message,
      });
    }
  },

  /**
   * PUT /api/umkm/transaksi/:id/status
   * Memperbarui status pesanan penjualan atau pembelian
   */
  async updateOrderStatus(req: Request, res: Response): Promise<void> {
    try {
      const id_transaksi = parseInt(String(req.params.id), 10);
      const { id_user, status } = req.body;
      if (!id_user || !status) {
        res.status(400).json({
          success: false,
          message: "id_user dan status transaksi wajib disertakan.",
        });
        return;
      }

      const updated = await umkmService.updateOrderStatus(
        id_transaksi,
        parseInt(String(id_user), 10),
        status
      );

      res.status(200).json({
        success: true,
        message: `Status transaksi #${id_transaksi} berhasil diubah menjadi '${status}'.`,
        data: updated,
      });
    } catch (error: any) {
      console.error("Error umkmController.updateOrderStatus:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal memperbarui status transaksi.",
      });
    }
  },

  /**
   * GET /api/umkm/keuangan/:id_user
   * Mengambil riwayat catatan arus kas keuangan UMKM
   */
  async getFinancialRecords(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id_user), 10);
      const { jenis } = req.query;
      const data = await umkmService.getFinancialRecords(id_user, {
        jenis: typeof jenis === "string" ? jenis : undefined,
      });
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Error umkmController.getFinancialRecords:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat catatan keuangan UMKM.",
        error: error.message,
      });
    }
  },

  /**
   * POST /api/umkm/keuangan
   * Menambahkan catatan arus kas keuangan baru
   */
  async addFinancialRecord(req: Request, res: Response): Promise<void> {
    try {
      const { id_user, jenis_transaksi, jumlah_uang, keterangan, id_transaksi, id_limbah } = req.body;
      if (!id_user || !jenis_transaksi || jumlah_uang === undefined || !keterangan) {
        res.status(400).json({
          success: false,
          message: "id_user, jenis_transaksi, jumlah_uang, dan keterangan wajib diisi.",
        });
        return;
      }

      const created = await umkmService.addFinancialRecord(parseInt(String(id_user), 10), {
        jenis_transaksi,
        jumlah_uang,
        keterangan,
        id_transaksi,
        id_limbah,
      });

      res.status(201).json({
        success: true,
        message: `Catatan keuangan kas '${created.jenis_transaksi}' berhasil disimpan.`,
        data: created,
      });
    } catch (error: any) {
      console.error("Error umkmController.addFinancialRecord:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal menambahkan catatan keuangan.",
      });
    }
  },

  /**
   * POST /api/umkm/:id/resubmit
   * Kirim ulang berkas persyaratan UMKM
   */
  async resubmitDocument(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id), 10);
      const { foto_persyaratan_url, foto_persyaratan_name } = req.body;
      if (!foto_persyaratan_url) {
        res.status(400).json({
          success: false,
          message: "File foto dokumen persyaratan baru wajib disertakan.",
        });
        return;
      }

      const updated = await umkmService.resubmitDocument(id_user, foto_persyaratan_url, foto_persyaratan_name);
      res.status(200).json({
        success: true,
        message: "Dokumen berkas UMKM berhasil dikirim ulang. Menunggu verifikasi admin.",
        data: updated,
      });
    } catch (error: any) {
      console.error("Error umkmController.resubmitDocument:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal mengirim ulang berkas dokumen UMKM.",
      });
    }
  },
};
