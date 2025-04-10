import express from "express";
import { createTest,getAllTests,getTestById,deleteTest,updateTest } from "../controllers/testController.js";
const router = express.Router();

router.get("/", getAllTests);
router.post("/", createTest);
router.get("/:id", getTestById);
router.put("/:id", updateTest);
router.delete("/:id", deleteTest);



export default router;