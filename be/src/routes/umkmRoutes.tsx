import { Router } from "express";
import { umkmController } from "../controllers/umkmController.tsx";

const router = Router();

// 1. Publik / Daftar Seluruh UMKM
router.get("/", umkmController.getAll);

// 2. Profil UMKM
router.get("/profil/:id", umkmController.getProfile);
router.put("/profil/:id", umkmController.updateProfile);

// 3. Dashboard & Metrik Operasional UMKM
router.get("/dashboard/:id", umkmController.getDashboard);

// 4. Katalog Produk Olahan Mangga (ERD: Tabel Produk)
router.get("/produk/:id_user", umkmController.getProducts);
router.post("/produk", umkmController.createProduct);
router.put("/produk/:id", umkmController.updateProduct);
router.delete("/produk/:id", umkmController.deleteProduct);

// 5. Residu Dapur Olahan ke Pasar Sirkular (ERD: Tabel Limbah)
router.get("/limbah/:id_umkm", umkmController.getMyWaste);
router.post("/limbah", umkmController.createWasteDeposit);

// 6. Transaksi Rantai Pasok (ERD: Tabel Transaksi & Detail Transaksi)
router.get("/transaksi/penjualan/:id_user", umkmController.getSalesOrders);
router.get("/transaksi/pembelian/:id_user", umkmController.getPurchaseOrders);
router.put("/transaksi/:id/status", umkmController.updateOrderStatus);

// 7. Catatan Kas & Keuangan (ERD: Tabel Pencatatan Keuangan)
router.get("/keuangan/:id_user", umkmController.getFinancialRecords);
router.post("/keuangan", umkmController.addFinancialRecord);

// 8. Resubmit Dokumen Persyaratan Akun
router.post("/:id/resubmit", umkmController.resubmitDocument);

export default router;
