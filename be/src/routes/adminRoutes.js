import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
const router = Router();
// 1. Dashboard Metrik Ekosistem SAMANGGA
router.get("/dashboard", adminController.getDashboard);
// 2. Verifikasi Mitra / Akun Baru
router.get("/verifikasi", adminController.getVerifikasiList);
router.put("/verifikasi/:id/setujui", adminController.approveVerifikasi);
router.put("/verifikasi/:id/tolak", adminController.rejectVerifikasi);
// 3. Manajemen Seluruh Pengguna
router.get("/pengguna", adminController.getAllUsers);
router.put("/pengguna/:id/status", adminController.updateUserStatus);
// 4. Log Sistem & Audit Trail
router.get("/logs", adminController.getLogs);
router.post("/logs", adminController.createLog);
// 5. Profil Admin
router.get("/profil/:id", adminController.getProfile);
export default router;
