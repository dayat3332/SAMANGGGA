import { Router } from "express";
import { penggunaController } from "../controllers/penggunaController.tsx";

const router = Router();

router.get("/", penggunaController.getAll);
router.get("/:id", penggunaController.getById);

export default router;
