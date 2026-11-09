import { Router } from "express";
import { limbahController } from "../controllers/limbahController.tsx";

const router = Router();

router.get("/", limbahController.getAll);
router.post("/", limbahController.create);
router.patch("/:id/jemput", limbahController.claimPickup);

export default router;
