import { Router } from "express";
import { limbahController } from "../controllers/limbahController.js";
const router = Router();
router.get("/", limbahController.getAll);
router.post("/", limbahController.create);
router.patch("/:id/jemput", limbahController.claimPickup);
export default router;
