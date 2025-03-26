import express from "express";
import { studentLogin ,getStudents} from "../controllers/studentController.js";

const router = express.Router();

router.post("/login", studentLogin);

router.get("/", getStudents);

export default router;
