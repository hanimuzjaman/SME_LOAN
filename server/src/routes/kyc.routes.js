// server/src/routes/kyc.routes.js
import express from "express";
import { uploadKYC } from "../middleware/uploadKYC.js";
import { submitKYC } from "../controllers/kyc.controller.js";

const router = express.Router();

router.post(
  "/:applicantId",
  uploadKYC.fields([
    { name: "businessPANFile", maxCount: 1 },
    { name: "ownerPANFile", maxCount: 1 },
    { name: "ownerAadharFile", maxCount: 1 },
  ]),
  submitKYC
);

export default router;