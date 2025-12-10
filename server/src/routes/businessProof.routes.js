// src/routes/businessProof.routes.js
import express from "express";
import { uploadBusinessProof } from "../middleware/uploadBusinessProof.js";
import { submitBusinessProof } from "../controllers/businessProof.controller.js";

const router = express.Router();

router.post(
  "/",
  uploadBusinessProof.fields([
    { name: "regDocFile", maxCount: 1 },        // ⬅ matches formData.append("regDocFile", ...)
    { name: "directorsListFile", maxCount: 1 }, // ⬅ optional
  ]),
  submitBusinessProof
);

export default router;