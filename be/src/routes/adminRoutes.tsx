import { Router } from "express";
import { adminController } from "../controllers/adminController.tsx";

const router = Router();

// 1. Dashboard Metrik Ekosistem SAMANGGA
router.get("/dashboard", adminController.getDashboard);

// 2. Antrean & Moderasi Verifikasi Pengguna
router.get("/verifikasi", adminController.getVerifikasiList);
router.put("/verifikasi/:id/setujui", adminController.approveVerifikasi);
router.put("/verifikasi/:id/tolak", adminController.rejectVerifikasi);

// 3. Audit Trail & Log Sistem
router.get("/logs", adminController.getAuditLogs);

export default router;
