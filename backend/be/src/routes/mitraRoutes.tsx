import { Router } from "express";
import { mitraController } from "../controllers/mitraController.tsx";

const router = Router();

router.get("/", mitraController.getAll);

router.get("/profil/:id", mitraController.getProfile);
router.put("/profil/:id", mitraController.updateProfile);

router.get("/dashboard/:id", mitraController.getDashboard);

router.get("/limbah/bursa", mitraController.getAvailableWaste);
router.get("/limbah/penjemputan/:id", mitraController.getMyPickups);
router.post("/limbah/klaim", mitraController.claimPickup);
router.put("/limbah/:id/status", mitraController.updatePickupStatus);

router.get("/pengiriman/:id", mitraController.getShipments);
router.put("/pengiriman/:id/status", mitraController.updateShipmentStatus);

router.post("/:id/resubmit", mitraController.resubmitDocument);

export default router;
