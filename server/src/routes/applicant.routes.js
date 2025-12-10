import express from "express";
import {
  createApplicant,
  getApplicant,
  getFullApplicant,
  patchUpdateFlags,
  updateLoanAmount,
  getAllApplicants,
  updateApplicationStatus,
} from "../controllers/applicant.controller.js";
import { verifyToken, requireEmployee } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/new", createApplicant);
router.get("/:id", getApplicant);
router.get("/full/:id", getFullApplicant);

// Employee protected endpoints
router.get("/all", verifyToken, requireEmployee, getAllApplicants);
router.get("/employee/full/:id", verifyToken, requireEmployee, getFullApplicant);

router.patch("/update/:id", patchUpdateFlags);
router.patch("/loan/:id", updateLoanAmount);
router.patch("/update-status/:id", verifyToken, requireEmployee, updateApplicationStatus);

export default router;