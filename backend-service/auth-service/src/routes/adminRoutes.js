import express from "express";
import { registerAdmin, adminLogin, verifyAdminOtp } from "../controllers/adminController.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", adminLogin);
router.post("/verify-otp", verifyAdminOtp);

export default router;
