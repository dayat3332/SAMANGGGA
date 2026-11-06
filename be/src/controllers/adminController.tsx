import type { Request, Response } from "express";
import { adminService } from "../services/adminService.tsx";

export const adminController = {
  /**
   * GET /api/v1/admin/dashboard
   */
  async getDashboard(_req: Request, res: Response): Promise<void> {
    try {
      const data = await adminService.getDashboardMetrics();
      res.status(200).json({
        success: true,
        message: "Data metrik dashboard admin berhasil dimuat.",
        data,
      });
    } catch (error: any) {
      console.error("Error getDashboard:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat metrik dashboard admin.",
        error: error.message,
      });
    }
  },

  /**
   * GET /api/v1/admin/verifikasi
   */
  async getVerifikasiList(req: Request, res: Response): Promise<void> {
    try {
      const { peran, status, search, limit, offset } = req.query;
      const result = await adminService.getVerifikasiList({
        peran: typeof peran === "string" ? peran : undefined,
        status: typeof status === "string" ? status : undefined,
        search: typeof search === "string" ? search : undefined,
        limit: limit ? parseInt(String(limit), 10) : 50,
        offset: offset ? parseInt(String(offset), 10) : 0,
      });

      res.status(200).json({
        success: true,
        message: "Daftar pendaftaran mitra/pengguna berhasil dimuat.",
        ...result,
      });
    } catch (error: any) {
      console.error("Error getVerifikasiList:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat antrean verifikasi pengguna.",
        error: error.message,
      });
    }
  },

  /**
   * PUT /api/v1/admin/verifikasi/:id/setujui
   */
  async approveVerifikasi(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id), 10);
      const admin_id = req.body?.admin_id ? parseInt(String(req.body.admin_id), 10) : undefined;
      const user = await adminService.approveUser(id_user, admin_id);

      res.status(200).json({
        success: true,
        message: `Pendaftaran pengguna ${user.nama_lengkap} (${user.peran}) berhasil disetujui.`,
        data: user,
      });
    } catch (error: any) {
      console.error("Error approveVerifikasi:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal menyetujui akun.",
      });
    }
  },

  /**
   * PUT /api/v1/admin/verifikasi/:id/tolak
   */
  async rejectVerifikasi(req: Request, res: Response): Promise<void> {
    try {
      const id_user = parseInt(String(req.params.id), 10);
      const { alasan, admin_id } = req.body;
      if (!alasan || !alasan.trim()) {
        res.status(400).json({
          success: false,
          message: "Alasan penolakan berkas wajib disertakan.",
        });
        return;
      }

      const user = await adminService.rejectUser(
        id_user,
        alasan,
        admin_id ? parseInt(String(admin_id), 10) : undefined
      );

      res.status(200).json({
        success: true,
        message: `Pendaftaran pengguna ${user.nama_lengkap} telah ditolak dengan alasan yang tercatat.`,
        data: user,
      });
    } catch (error: any) {
      console.error("Error rejectVerifikasi:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Gagal menolak akun.",
      });
    }
  },

  /**
   * GET /api/v1/admin/logs
   */
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const { level, limit, offset } = req.query;
      const result = await adminService.getAuditLogs({
        level: typeof level === "string" ? level : undefined,
        limit: limit ? parseInt(String(limit), 10) : 50,
        offset: offset ? parseInt(String(offset), 10) : 0,
      });

      res.status(200).json({
        success: true,
        message: "Riwayat log sistem berhasil dimuat.",
        ...result,
      });
    } catch (error: any) {
      console.error("Error getAuditLogs:", error);
      res.status(500).json({
        success: false,
        message: "Gagal memuat log sistem.",
        error: error.message,
      });
    }
  },
};
