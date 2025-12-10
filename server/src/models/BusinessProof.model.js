// src/models/BusinessProof.model.js
import mongoose from "mongoose";

const BusinessProofSchema = new mongoose.Schema(
  {
    applicantId: { type: String, required: true },
    companyType: { type: String, enum: ["OTHER", "PVT_LTD"], required: true },
    cinNumber: { type: String },

    // store the relative paths inside Documents/
    registrationDocPath: { type: String, required: true },
    directorsListPath: { type: String, default: null },

    uploadedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("BusinessProof", BusinessProofSchema);