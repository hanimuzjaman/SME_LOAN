// src/controllers/businessProof.controller.js
import BusinessProof from "../models/BusinessProof.model.js";
import Applicant from "../models/Applicant.js";
import { saveFileLocal } from "../utils/saveFileLocal.js";

export async function submitBusinessProof(req, res) {
  try {
    console.log("=== Business Proof Upload Started ===");

    const { applicantId, companyType, cinNumber } = req.body;

    if (!applicantId) {
      return res.status(400).json({ message: "Applicant ID missing" });
    }

    if (!companyType) {
      return res.status(400).json({ message: "Company type missing" });
    }

    const files = req.files || {};

    const regDoc = files.regDocFile?.[0] || null;
    const directorsFile = files.directorsListFile?.[0] || null;

    if (!regDoc) {
      return res
        .status(400)
        .json({ message: "Registration Document required." });
    }

    // 🔹 Registration document
    const regMeta = await saveFileLocal({
      applicantId,
      section: "Business_Proof",
      label: "regDocFile",
      buffer: regDoc.buffer,
      originalName: regDoc.originalname,
    });

    // 🔹 Directors list (optional, for Pvt Ltd)
    let directorsMeta = null;
    if (companyType === "PVT_LTD" && directorsFile) {
      directorsMeta = await saveFileLocal({
        applicantId,
        section: "Business_Proof",
        label: "directorsListFile",
        buffer: directorsFile.buffer,
        originalName: directorsFile.originalname,
      });
    }

    const saved = await BusinessProof.create({
      applicantId,
      companyType,
      cinNumber,
      registrationDocPath: regMeta.relativePath, // ✅ now defined
      directorsListPath: directorsMeta ? directorsMeta.relativePath : null,
    });

    await Applicant.findOneAndUpdate(
      { Applicant_ID: applicantId },
      { Business_Proof_Submitted: "Yes" }
    );

    return res.status(201).json({
      message: "Business Proof uploaded successfully",
      data: saved,
    });
  } catch (err) {
    console.error("BusinessProof Upload Error:", err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
}