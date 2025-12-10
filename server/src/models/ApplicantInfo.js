import mongoose from "mongoose";

const ApplicantInfoSchema = new mongoose.Schema(
  {
    S_No: { type: Number },

    Applicant_ID: {
      type: String,
      index: true,
      sparse: true,
    },

    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },

    industryType: { type: String },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const ApplicantInfo = mongoose.model("ApplicantInfo", ApplicantInfoSchema);
export default ApplicantInfo;