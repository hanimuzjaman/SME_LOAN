// server/src/controllers/kyc.controller.js
import KYC from "../models/KYC.model.js";
import Applicant from "../models/Applicant.js";
import { saveFileLocal } from "../utils/saveFileLocal.js";

export async function submitKYC(req, res) {
  try {
    const applicantId = req.params.applicantId?.trim();
    if (!applicantId) {
      return res.status(400).json({ message: "Applicant ID missing" });
    }

    const { businessPAN, ownerPAN, ownerAadhaar } = req.body;

    if (!businessPAN || !ownerPAN || !ownerAadhaar) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const files = req.files || {};
    if (!files.businessPANFile || !files.ownerPANFile || !files.ownerAadharFile) {
      return res.status(400).json({ message: "Missing required KYC PDFs" });
    }

    const businessPANFile = files.businessPANFile[0];
    const ownerPANFile = files.ownerPANFile[0];
    const ownerAadharFile = files.ownerAadharFile[0];

    // Save into data.json under <Applicant_ID>.KYC
    const panBizMeta = await saveFileLocal({
      applicantId,
      section: "KYC",
      label: "businessPANFile",
      buffer: businessPANFile.buffer,
      originalName: businessPANFile.originalname,
    });

    const panOwnerMeta = await saveFileLocal({
      applicantId,
      section: "KYC",
      label: "ownerPANFile",
      buffer: ownerPANFile.buffer,
      originalName: ownerPANFile.originalname,
    });

    const aadhaarMeta = await saveFileLocal({
      applicantId,
      section: "KYC",
      label: "ownerAadharFile",
      buffer: ownerAadharFile.buffer,
      originalName: ownerAadharFile.originalname,
    });

    // Store basic KYC info in Mongo
    await KYC.create({
      Applicant_ID: applicantId,
      businessPAN,
      ownerPAN,
      ownerAadhaar,
      status: "UPLOADED",
    });

    await Applicant.findOneAndUpdate(
      { Applicant_ID: applicantId },
      { KYC_Submitted: "Yes" }
    );

    return res.status(201).json({
      message: "KYC submitted successfully",
      files: {
        businessPAN: panBizMeta,
        ownerPAN: panOwnerMeta,
        ownerAadhaar: aadhaarMeta,
      },
    });
  } catch (err) {
    console.error("KYC ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}