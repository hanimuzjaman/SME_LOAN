import mongoose from "mongoose";

const IncomeProofSchema = new mongoose.Schema(
  {
    Applicant_ID: { type: String, required: true },

    documents: {
      FY1: {
        PL: {
          path: String,
          originalName: String,
        },
        BS: {
          path: String,
          originalName: String,
        },
        ITR: {
          path: String,
          originalName: String,
        },
      },
      FY2: {
        PL: { path: String, originalName: String },
        BS: { path: String, originalName: String },
        ITR: { path: String, originalName: String },
      },
      FY3: {
        PL: { path: String, originalName: String },
        BS: { path: String, originalName: String },
        ITR: { path: String, originalName: String },
      },
      BankStatement: {
        path: String,
        originalName: String,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("IncomeProof", IncomeProofSchema);