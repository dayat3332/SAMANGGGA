import { Router } from "express";
import { konsumenController as c } from "../controllers/konsumenController.tsx";

const router = Router();

router.get("/profil/:id", c.getProfil);
router.put("/profil/:id", c.updateProfil);
router.get("/dashboard/:id", c.getDashboard);

router.get("/katalog", c.katalog);

router.get("/pesanan/:id", c.listPesanan);
router.get("/pesanan/detail/:id", c.detailPesanan);
router.post("/pesanan", c.buatPesanan);
router.put("/pesanan/:id/bayar", c.konfirmasiBayar);
router.put("/pesanan/:id/status", c.ubahStatusPesanan);

router.get("/keuangan/:id", c.listKeuangan);
router.post("/keuangan", c.createKeuangan);
router.put("/keuangan/:id", c.updateKeuangan);
router.delete("/keuangan/:id", c.removeKeuangan);

export default router;
