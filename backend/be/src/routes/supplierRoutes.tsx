import { Router } from "express";
import { supplierController as c } from "../controllers/supplierController.tsx";

const router = Router();

router.get("/profil/:id", c.getProfil);
router.put("/profil/:id", c.updateProfil);
router.get("/dashboard/:id", c.getDashboard);

router.get("/produk/:id", c.listProduk);
router.post("/produk", c.createProduk);
router.put("/produk/:id", c.updateProduk);
router.delete("/produk/:id", c.removeProduk);

router.get("/pesanan/:id", c.listPesanan);
router.put("/pesanan/:id/status", c.ubahStatusPesanan);

router.get("/keuangan/:id", c.listKeuangan);
router.post("/keuangan", c.createKeuangan);
router.put("/keuangan/:id", c.updateKeuangan);
router.delete("/keuangan/:id", c.removeKeuangan);

router.post("/:id/resubmit", c.resubmitDokumen);

export default router;
