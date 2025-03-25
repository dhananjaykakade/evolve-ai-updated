import express from "express";
import { teacherLogin } from "../controllers/teacherController.js";

const router = express.Router();

router.post("/login", teacherLogin);

export default router;
