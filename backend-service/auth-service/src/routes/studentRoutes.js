import express from "express";
import { studentLogin } from "../controllers/studentController.js";

const router = express.Router();

router.post("/login", studentLogin);

export default router;
