import { adminService } from "../services/adminService.js";
export const adminController = {
    /**
     * GET /api/v1/admin/dashboard
     */
    async getDashboard(req, res) {
        try {
            const data = await adminService.getDashboardMetrics();
            res.status(200).json({
                success: true,
                message: "Data metrik dashboard admin berhasil dimuat.",
                data,
            });
        }
        catch (error) {
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
    async getVerifikasiList(req, res) {
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
        }
        catch (error) {
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
    async approveVerifikasi(req, res) {
        try {
            const id_user = parseInt(String(req.params.id), 10);
            const admin_id = req.body?.admin_id ? parseInt(String(req.body.admin_id), 10) : undefined;
            const user = await adminService.approveUser(id_user, admin_id);
            res.status(200).json({
                success: true,
                message: `Pengguna ${user.nama_lengkap} berhasil disetujui (Terverifikasi).`,
                data: user,
            });
        }
        catch (error) {
            console.error("Error approveVerifikasi:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal menyetujui verifikasi pengguna.",
            });
        }
    },
    /**
     * PUT /api/v1/admin/verifikasi/:id/tolak
     */
    async rejectVerifikasi(req, res) {
        try {
            const id_user = parseInt(String(req.params.id), 10);
            const { alasan, admin_id } = req.body || {};
            const user = await adminService.rejectUser(id_user, alasan, admin_id ? parseInt(String(admin_id), 10) : undefined);
            res.status(200).json({
                success: true,
                message: `Pendaftaran pengguna ${user.nama_lengkap} telah ditolak.`,
                data: user,
            });
        }
        catch (error) {
            console.error("Error rejectVerifikasi:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal menolak pendaftaran pengguna.",
            });
        }
    },
    /**
     * GET /api/v1/admin/pengguna
     */
    async getAllUsers(req, res) {
        try {
            const { peran, status, search, limit, offset } = req.query;
            const result = await adminService.getAllUsers({
                peran: typeof peran === "string" ? peran : undefined,
                status: typeof status === "string" ? status : undefined,
                search: typeof search === "string" ? search : undefined,
                limit: limit ? parseInt(String(limit), 10) : 50,
                offset: offset ? parseInt(String(offset), 10) : 0,
            });
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            console.error("Error getAllUsers:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat data pengguna.",
                error: error.message,
            });
        }
    },
    /**
     * PUT /api/v1/admin/pengguna/:id/status
     */
    async updateUserStatus(req, res) {
        try {
            const id_user = parseInt(String(req.params.id), 10);
            const { status, admin_id } = req.body;
            if (!status || !["Menunggu", "Terverifikasi", "Ditolak"].includes(status)) {
                res.status(400).json({
                    success: false,
                    message: "Status tidak valid. Harus Menunggu, Terverifikasi, atau Ditolak.",
                });
                return;
            }
            const user = await adminService.updateUserStatus(id_user, status, admin_id ? parseInt(String(admin_id), 10) : undefined);
            res.status(200).json({
                success: true,
                message: `Status pengguna berhasil diperbarui menjadi ${status}.`,
                data: user,
            });
        }
        catch (error) {
            console.error("Error updateUserStatus:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal memperbarui status pengguna.",
            });
        }
    },
    /**
     * GET /api/v1/admin/logs
     */
    async getLogs(req, res) {
        try {
            const { limit, level } = req.query;
            const logs = await adminService.getSystemLogs(limit ? parseInt(String(limit), 10) : 50, typeof level === "string" ? level : undefined);
            res.status(200).json({
                success: true,
                total: logs.length,
                data: logs,
            });
        }
        catch (error) {
            console.error("Error getLogs:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat riwayat log sistem.",
                error: error.message,
            });
        }
    },
    /**
     * POST /api/v1/admin/logs
     */
    async createLog(req, res) {
        try {
            const { id_user, level, aksi, endpoint_api, kode_status, pesan, detail_error } = req.body;
            if (!aksi || !pesan) {
                res.status(400).json({
                    success: false,
                    message: "Aksi dan pesan log wajib diisi.",
                });
                return;
            }
            const log = await adminService.createSystemLog({
                id_user: id_user ? parseInt(String(id_user), 10) : null,
                level: level || "Info",
                aksi,
                endpoint_api,
                kode_status: kode_status || 200,
                pesan,
                detail_error,
            });
            res.status(201).json({
                success: true,
                message: "Log sistem berhasil dicatat.",
                data: log,
            });
        }
        catch (error) {
            console.error("Error createLog:", error);
            res.status(500).json({
                success: false,
                message: "Gagal mencatat log sistem.",
                error: error.message,
            });
        }
    },
    /**
     * GET /api/v1/admin/profil/:id
     */
    async getProfile(req, res) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const profile = await adminService.getAdminProfile(id);
            if (!profile) {
                res.status(404).json({
                    success: false,
                    message: "Profil admin tidak ditemukan.",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            console.error("Error getProfile:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat profil admin.",
                error: error.message,
            });
        }
    },
};
