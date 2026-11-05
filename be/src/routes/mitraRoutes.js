import { Router } from "express";
import { mitraController } from "../controllers/mitraController.js";
const router = Router();
// 1. Publik / Daftar Seluruh Mitra
router.get("/", mitraController.getAll);
// 2. Profil Mitra
router.get("/profil/:id", mitraController.getProfile);
router.put("/profil/:id", mitraController.updateProfile);
// 3. Dashboard & Metrik Operasional Mitra
router.get("/dashboard/:id", mitraController.getDashboard);
// 4. Operasional Limbah Sirkular (ERD: Tabel Limbah)
router.get("/limbah/bursa", mitraController.getAvailableWaste);
router.get("/limbah/penjemputan/:id", mitraController.getMyPickups);
router.post("/limbah/klaim", mitraController.claimPickup);
router.put("/limbah/:id/status", mitraController.updatePickupStatus);
// 5. Operasional Logistik Pengiriman (ERD: Tabel Riwayat Pengiriman)
router.get("/pengiriman/:id", mitraController.getShipments);
router.put("/pengiriman/:id/status", mitraController.updateShipmentStatus);
// 6. Resubmit Berkas / Dokumen jika Ditolak
router.post("/:id/resubmit", mitraController.resubmitDocument);
export default router;
