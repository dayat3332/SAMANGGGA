import { Router } from "express";
import authRoutes from "./authRoutes.js";
import produkRoutes from "./produkRoutes.js";
import limbahRoutes from "./limbahRoutes.js";
import transaksiRoutes from "./transaksiRoutes.js";
import mitraRoutes from "./mitraRoutes.js";
import penggunaRoutes from "./penggunaRoutes.js";
import adminRoutes from "./adminRoutes.js";
const apiRouter = Router();
apiRouter.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        service: "SAMANGGA Backend REST API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
    });
});
apiRouter.use("/auth", authRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/produk", produkRoutes);
apiRouter.use("/limbah", limbahRoutes);
apiRouter.use("/transaksi", transaksiRoutes);
apiRouter.use("/mitra", mitraRoutes);
apiRouter.use("/pengguna", penggunaRoutes);
export default apiRouter;
