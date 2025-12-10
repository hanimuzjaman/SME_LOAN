import mongoose from "mongoose";

const ApplicantSchema = new mongoose.Schema(
  {
    S_No: {
      type: Number,
      unique: true,
      min: 1,
    },

    Applicant_ID: {
      type: String,
      unique: true,
      index: true,
    },

    Applicant_industry: {
      type: String,
      required: true,
      trim: true,
    },

    LoanAmount_Requested: { type: Number, default: null },

    Applicant_Category: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: null,
    },

    Loan_Category: { type: String, default: "SME" },

    KYC_Submitted: { type: String, default: "No" },
    Income_Proof_Submitted: { type: String, default: "No" },
    Business_Proof_Submitted: { type: String, default: "No" },

    applicationStatus: { type: String, default: "Pending" },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Auto-generate S_No + Applicant_ID
ApplicantSchema.pre("save", async function () {
  if (!this.isNew) return;

  const Model = this.constructor;
  const last = await Model.findOne({}, { S_No: 1 }, { sort: { S_No: -1 } });
  this.S_No = last ? last.S_No + 1 : 1;

  const raw = (this.Applicant_industry || "").toString().trim();
  const industryCode = raw.substring(0, 4).replace(/\s+/g, "").toLowerCase();
  this.Applicant_ID = `SME${industryCode}${this.S_No}`;
});

const Applicants = mongoose.model("Applicants", ApplicantSchema);
export default Applicants;