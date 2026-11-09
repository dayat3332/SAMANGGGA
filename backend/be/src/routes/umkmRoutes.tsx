import { Router } from "express";
import { umkmController } from "../controllers/umkmController.tsx";

const router = Router();

router.get("/", umkmController.getAll);

router.get("/profil/:id", umkmController.getProfile);
router.put("/profil/:id", umkmController.updateProfile);

router.get("/dashboard/:id", umkmController.getDashboard);

router.get("/produk/:id_user", umkmController.getProducts);
router.post("/produk", umkmController.createProduct);
router.put("/produk/:id", umkmController.updateProduct);
router.delete("/produk/:id", umkmController.deleteProduct);

router.get("/limbah/:id_umkm", umkmController.getMyWaste);
router.post("/limbah", umkmController.createWasteDeposit);

router.get("/transaksi/penjualan/:id_user", umkmController.getSalesOrders);
router.get("/transaksi/pembelian/:id_user", umkmController.getPurchaseOrders);
router.put("/transaksi/:id/status", umkmController.updateOrderStatus);

router.get("/keuangan/:id_user", umkmController.getFinancialRecords);
router.post("/keuangan", umkmController.addFinancialRecord);

router.post("/:id/resubmit", umkmController.resubmitDocument);

export default router;
