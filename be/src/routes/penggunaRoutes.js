import { Router } from "express";
import { penggunaController } from "../controllers/penggunaController.js";
const router = Router();
router.get("/", penggunaController.getAll);
router.get("/:id", penggunaController.getById);
export default router;
