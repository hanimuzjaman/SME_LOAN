// server/src/routes/documents.routes.js
import express from "express";
import { getApplicantDocuments } from "../controllers/documents.controller.js";

const router = express.Router();

router.get("/:applicantId", getApplicantDocuments);

export default router;