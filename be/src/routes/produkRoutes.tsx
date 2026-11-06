import { Router } from "express";
import { produkController } from "../controllers/produkController.tsx";

const router = Router();

router.get("/", produkController.getAll);
router.get("/:id", produkController.getById);
router.post("/", produkController.create);
router.delete("/:id", produkController.delete);

export default router;
