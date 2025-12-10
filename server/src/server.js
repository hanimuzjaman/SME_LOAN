// server/src/server.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./database/db.js";

import applicantRoutes from "./routes/applicant.routes.js";
import authRoutes from "./routes/auth.routes.js";
import classificationRoutes from "./routes/classification.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import businessProofRoutes from "./routes/businessProof.routes.js";
import incomeProofRoutes from "./routes/incomeProof.routes.js";
import documentsRoutes from "./routes/documents.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const documentsDir = path.join(__dirname, "..", "Documents");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Serve uploaded documents
app.use("/files", express.static(documentsDir));

app.get("/", (req, res) => res.send("<h1>Backend running</h1>"));

app.use("/api/applicant", applicantRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/classify", classificationRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/business-proof", businessProofRoutes);
app.use("/api/income-proof", incomeProofRoutes);
app.use("/api/documents", documentsRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start:", err);
  });