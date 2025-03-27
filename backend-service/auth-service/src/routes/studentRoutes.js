import express from "express";
import { studentLogin ,getStudents,getSingleStudent} from "../controllers/studentController.js";

const router = express.Router();

router.post("/login", studentLogin);

router.get("/get", getStudents);

router.get("/:id", getSingleStudent);


export default router;
