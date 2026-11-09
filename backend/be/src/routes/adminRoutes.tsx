import { Router } from "express";
import { adminController } from "../controllers/adminController.tsx";

const router = Router();

router.get("/dashboard", adminController.getDashboard);

router.get("/verifikasi", adminController.getVerifikasiList);
router.put("/verifikasi/:id/setujui", adminController.approveVerifikasi);
router.put("/verifikasi/:id/tolak", adminController.rejectVerifikasi);

router.get("/logs", adminController.getAuditLogs);

export default router;
