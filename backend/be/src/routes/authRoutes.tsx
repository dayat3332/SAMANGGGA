import { Router } from "express";
import { authController } from "../controllers/authController.tsx";

const router = Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/google", authController.googleAuth);
router.get("/users", authController.getAllUsers);

export default router;
