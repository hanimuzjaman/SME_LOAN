import mongoose from "mongoose";
import Applicants from "../models/Applicant.js";
import ApplicantInfo from "../models/ApplicantInfo.js";

// CREATE APPLICANT
export const createApplicant = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let { companyName, phone, email, companyType } = req.body;

    companyName = companyName.trim();
    phone = phone.trim();
    email = email.trim().toLowerCase();
    companyType = companyType.trim();

    const loanDoc = new Applicants({
      Applicant_industry: companyType,
    });

    await loanDoc.save({ session });

    await ApplicantInfo.create(
      [
        {
          S_No: loanDoc.S_No,
          Applicant_ID: loanDoc.Applicant_ID,
          fullName: companyName,
          phone,
          email,
          industryType: companyType,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json(loanDoc);
  } catch (err) {
    await session.abortTransaction().catch(() => {});
    session.endSession();

    console.error("createApplicant error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET APPLICANT (LOAN DOC ONLY)
export const getApplicant = async (req, res) => {
  try {
    let id = decodeURIComponent(req.params.id || "").trim();
    if (!id) return res.status(400).json({ message: "Applicant ID required" });

    const loan = await Applicants.findOne({
      Applicant_ID: { $regex: `^${id}$`, $options: "i" },
    });

    if (!loan) return res.status(404).json({ message: "Applicant not found" });

    res.json(loan);
  } catch (err) {
    console.error("getApplicant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET FULL MERGED PROFILE DOCUMENT
export const getFullApplicant = async (req, res) => {
  try {
    let id = decodeURIComponent(req.params.id || "").trim();

    const loan = await Applicants.findOne({
      Applicant_ID: { $regex: `^${id}$`, $options: "i" },
    });
    if (!loan) return res.status(404).json({ message: "Applicant not found (loan)" });

    const personal = await ApplicantInfo.findOne({
      Applicant_ID: { $regex: `^${id}$`, $options: "i" },
    });
    if (!personal) return res.status(404).json({ message: "Personal info not found" });

    return res.json({ ...loan.toObject(), ...personal.toObject() });
  } catch (err) {
    console.error("getFullApplicant error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// GET ALL APPLICANTS (merged summary) - for employee listing
export const getAllApplicants = async (req, res) => {
  try {
    const loans = await Applicants.find({}).lean();

    // For each loan doc, attach basic personal info if present
    const merged = await Promise.all(
      loans.map(async (loan) => {
        const personal = await ApplicantInfo.findOne({ Applicant_ID: loan.Applicant_ID }).lean().catch(() => null);
        return {
          Applicant_ID: loan.Applicant_ID,
          S_No: loan.S_No,
          Applicant_industry: loan.Applicant_industry,
          LoanAmount_Requested: loan.LoanAmount_Requested || null,
          Applicant_Category: loan.Applicant_Category || null,
          fullName: personal?.fullName || null,
          email: personal?.email || null,
          phone: personal?.phone || null,
        };
      })
    );

    return res.json({ count: merged.length, applicants: merged });
  } catch (err) {
    console.error("getAllApplicants error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// PATCH FLAGS (KYC / PROOFS)
export const patchUpdateFlags = async (req, res) => {
  try {
    let id = decodeURIComponent(req.params.id || "").trim();

    const { field } = req.body;

    const allowed = {
      KYC_Submitted: "KYC_Submitted",
      Income_Proof_Submitted: "Income_Proof_Submitted",
      Business_Proof_Submitted: "Business_Proof_Submitted",
    };

    if (!allowed[field]) return res.status(400).json({ message: "Invalid flag" });

    const updated = await Applicants.findOneAndUpdate(
      { Applicant_ID: { $regex: `^${id}$`, $options: "i" } },
      { [field]: "Yes" },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Applicant not found" });

    res.json({ success: true, applicant: updated });
  } catch (err) {
    console.error("patchUpdateFlags error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE LOAN AMOUNT + APPLICANT_CATEGORY
export const updateLoanAmount = async (req, res) => {
  try {
    const id = req.params.id.trim();
    const { loanAmount, applicantCategory } = req.body;

    if (!loanAmount) {
      return res.status(400).json({ message: "loanAmount is required" });
    }

    const updated = await Applicants.findOneAndUpdate(
      { Applicant_ID: { $regex: `^${id}$`, $options: "i" } },
      {
        LoanAmount_Requested: loanAmount,
        Applicant_Category: applicantCategory || null,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    return res.json({ success: true, applicant: updated });
  } catch (err) {
    console.error("updateLoanAmount error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// UPDATE APPLICATION STATUS (Approved, Rejected, Pending)
export const updateApplicationStatus = async (req, res) => {
  try {
    const id = req.params.id.trim();
    const { applicationStatus } = req.body;

    if (!applicationStatus || !["Approved", "Rejected", "Pending"].includes(applicationStatus)) {
      return res.status(400).json({ message: "Invalid applicationStatus. Must be 'Approved', 'Rejected', or 'Pending'" });
    }

    const updated = await Applicants.findOneAndUpdate(
      { Applicant_ID: { $regex: `^${id}$`, $options: "i" } },
      { applicationStatus },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Applicant not found" });
    }

    return res.json({ success: true, applicant: updated });
  } catch (err) {
    console.error("updateApplicationStatus error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};