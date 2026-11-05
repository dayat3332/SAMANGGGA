import { Router } from "express";
import { transaksiController } from "../controllers/transaksiController.js";
const router = Router();
router.get("/", transaksiController.getAll);
router.get("/:id", transaksiController.getById);
router.post("/", transaksiController.create);
export default router;
