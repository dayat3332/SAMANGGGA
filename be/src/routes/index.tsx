import { Router } from "express";
import authRoutes from "./authRoutes.tsx";
import produkRoutes from "./produkRoutes.tsx";
import limbahRoutes from "./limbahRoutes.tsx";
import transaksiRoutes from "./transaksiRoutes.tsx";
import mitraRoutes from "./mitraRoutes.tsx";
import umkmRoutes from "./umkmRoutes.tsx";
import penggunaRoutes from "./penggunaRoutes.tsx";
import adminRoutes from "./adminRoutes.tsx";

const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SAMANGGA Backend REST API (TypeScript / TSX)",
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
apiRouter.use("/umkm", umkmRoutes);
apiRouter.use("/pengguna", penggunaRoutes);

export default apiRouter;
