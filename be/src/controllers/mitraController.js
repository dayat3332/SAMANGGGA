import { mitraService } from "../services/mitraService.js";
export const mitraController = {
    /**
     * GET /api/mitra
     */
    async getAll(req, res) {
        try {
            const { status } = req.query;
            const data = await mitraService.getAllMitra(typeof status === "string" ? status : undefined);
            res.status(200).json({
                success: true,
                total: data.length,
                data,
            });
        }
        catch (error) {
            console.error("Error mitraController.getAll:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat daftar mitra.",
                error: error.message,
            });
        }
    },
    /**
     * GET /api/mitra/profil/:id
     */
    async getProfile(req, res) {
        try {
            const id = parseInt(String(req.params.id), 10);
            const isMitraId = req.query.by_mitra_id === "true";
            const profile = await mitraService.getProfile(isMitraId ? { id_mitra: id } : { id_user: id });
            if (!profile) {
                res.status(404).json({
                    success: false,
                    message: "Profil mitra tidak ditemukan.",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: profile,
            });
        }
        catch (error) {
            console.error("Error mitraController.getProfile:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat profil mitra.",
                error: error.message,
            });
        }
    },
    /**
     * PUT /api/mitra/profil/:id
     */
    async updateProfile(req, res) {
        try {
            const id_user = parseInt(String(req.params.id), 10);
            const updated = await mitraService.updateProfile(id_user, req.body);
            res.status(200).json({
                success: true,
                message: "Profil mitra berhasil diperbarui.",
                data: updated,
            });
        }
        catch (error) {
            console.error("Error mitraController.updateProfile:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal memperbarui profil mitra.",
            });
        }
    },
    /**
     * GET /api/mitra/dashboard/:id
     */
    async getDashboard(req, res) {
        try {
            const id_mitra = parseInt(String(req.params.id), 10);
            const metrics = await mitraService.getDashboard(id_mitra);
            res.status(200).json({
                success: true,
                message: "Data dashboard operasional mitra berhasil dimuat.",
                data: metrics,
            });
        }
        catch (error) {
            console.error("Error mitraController.getDashboard:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Gagal memuat data dashboard mitra.",
            });
        }
    },
    /**
     * GET /api/mitra/limbah/bursa
     */
    async getAvailableWaste(req, res) {
        try {
            const { jenis, search } = req.query;
            const data = await mitraService.getAvailableWaste({
                jenis: typeof jenis === "string" ? jenis : undefined,
                search: typeof search === "string" ? search : undefined,
            });
            res.status(200).json({
                success: true,
                total: data.length,
                data,
            });
        }
        catch (error) {
            console.error("Error mitraController.getAvailableWaste:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat bursa limbah sirkular.",
                error: error.message,
            });
        }
    },
    /**
     * GET /api/mitra/limbah/penjemputan/:id
     */
    async getMyPickups(req, res) {
        try {
            const id_mitra = parseInt(String(req.params.id), 10);
            const { status } = req.query;
            const data = await mitraService.getMyPickups(id_mitra, typeof status === "string" ? status : undefined);
            res.status(200).json({
                success: true,
                total: data.length,
                data,
            });
        }
        catch (error) {
            console.error("Error mitraController.getMyPickups:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat antrean penjemputan limbah.",
                error: error.message,
            });
        }
    },
    /**
     * POST /api/mitra/limbah/klaim
     */
    async claimPickup(req, res) {
        try {
            const { id_limbah, id_mitra, harga_kesepakatan } = req.body;
            if (!id_limbah || !id_mitra) {
                res.status(400).json({
                    success: false,
                    message: "id_limbah dan id_mitra wajib disertakan.",
                });
                return;
            }
            const updated = await mitraService.claimPickup(parseInt(String(id_limbah), 10), parseInt(String(id_mitra), 10), harga_kesepakatan ? parseFloat(String(harga_kesepakatan)) : undefined);
            res.status(200).json({
                success: true,
                message: `Penjemputan limbah #${id_limbah} berhasil diajukan.`,
                data: updated,
            });
        }
        catch (error) {
            console.error("Error mitraController.claimPickup:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal mengajukan penjemputan limbah.",
            });
        }
    },
    /**
     * PUT /api/mitra/limbah/:id/status
     */
    async updatePickupStatus(req, res) {
        try {
            const id_limbah = parseInt(String(req.params.id), 10);
            const { id_mitra, status_jemput } = req.body;
            if (!id_mitra || !status_jemput) {
                res.status(400).json({
                    success: false,
                    message: "id_mitra dan status_jemput wajib disertakan.",
                });
                return;
            }
            const updated = await mitraService.updatePickupStatus(id_limbah, parseInt(String(id_mitra), 10), status_jemput);
            res.status(200).json({
                success: true,
                message: `Status penjemputan limbah #${id_limbah} berhasil diperbarui menjadi '${status_jemput}'.`,
                data: updated,
            });
        }
        catch (error) {
            console.error("Error mitraController.updatePickupStatus:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal memperbarui status penjemputan limbah.",
            });
        }
    },
    /**
     * GET /api/mitra/pengiriman/:id
     */
    async getShipments(req, res) {
        try {
            const id_mitra = parseInt(String(req.params.id), 10);
            const { status } = req.query;
            const data = await mitraService.getShipments(id_mitra, typeof status === "string" ? status : undefined);
            res.status(200).json({
                success: true,
                total: data.length,
                data,
            });
        }
        catch (error) {
            console.error("Error mitraController.getShipments:", error);
            res.status(500).json({
                success: false,
                message: "Gagal memuat riwayat pengiriman logistik.",
                error: error.message,
            });
        }
    },
    /**
     * PUT /api/mitra/pengiriman/:id/status
     */
    async updateShipmentStatus(req, res) {
        try {
            const id_pengiriman = parseInt(String(req.params.id), 10);
            const { id_mitra, status_pengiriman } = req.body;
            if (!id_mitra || !status_pengiriman) {
                res.status(400).json({
                    success: false,
                    message: "id_mitra dan status_pengiriman wajib disertakan.",
                });
                return;
            }
            const updated = await mitraService.updateShipmentStatus(id_pengiriman, parseInt(String(id_mitra), 10), status_pengiriman);
            res.status(200).json({
                success: true,
                message: `Status pengiriman resi ${updated.no_resi_lacak} berhasil diperbarui menjadi '${status_pengiriman}'.`,
                data: updated,
            });
        }
        catch (error) {
            console.error("Error mitraController.updateShipmentStatus:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal memperbarui status pengiriman logistik.",
            });
        }
    },
    /**
     * POST /api/mitra/:id/resubmit
     */
    async resubmitDocument(req, res) {
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
            const updated = await mitraService.resubmitDocument(id_user, foto_persyaratan_url, foto_persyaratan_name);
            res.status(200).json({
                success: true,
                message: "Dokumen berkas mitra berhasil dikirim ulang. Menunggu verifikasi admin.",
                data: updated,
            });
        }
        catch (error) {
            console.error("Error mitraController.resubmitDocument:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Gagal mengirim ulang berkas dokumen mitra.",
            });
        }
    },
};
