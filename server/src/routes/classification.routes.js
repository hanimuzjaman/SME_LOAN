import express from "express";
import {
  classifySME,
  classifyApplicantCategory,
} from "../controllers/classification.controller.js";

const router = express.Router();

router.post("/sme", classifySME);
router.post("/loan-category", classifyApplicantCategory);

export default router;