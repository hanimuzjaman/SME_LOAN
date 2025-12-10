// server/src/routes/incomeProof.routes.js
import express from "express";
import { uploadIncomeProof } from "../middleware/uploadIncomeProof.js";
import { submitIncomeProof } from "../controllers/incomeProof.controller.js";

const router = express.Router();

router.post("/:applicantId", uploadIncomeProof, submitIncomeProof);

export default router;