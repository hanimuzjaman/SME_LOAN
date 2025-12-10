import mongoose from "mongoose";

const KYCSchema = new mongoose.Schema(
  {
    Applicant_ID: { type: String, required: true },
    businessPAN: String,
    ownerPAN: String,
    ownerAadhaar: String,
    status: { type: String, default: "UPLOADED" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.model("KYC_Documents", KYCSchema);