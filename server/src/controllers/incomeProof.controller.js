import IncomeProof from "../models/IncomeProof.model.js";
import Applicant from "../models/Applicant.js";
import { saveFileLocal } from "../utils/saveFileLocal.js";

export async function submitIncomeProof(req, res) {
  try {
    const applicantId = req.params.applicantId?.trim();
    if (!applicantId) {
      return res.status(400).json({ message: "Applicant ID missing" });
    }

    const files = req.files || {};

    // ALWAYS use clean structure: Income_Proof -> FY1/FY2/FY3/Bank
    const save = async (field, folder) => {
      const f = files[field]?.[0];
      if (!f) return null;

      return await saveFileLocal({
        applicantId,
        section: `Income_Proof/${folder}`,
        label: field,
        buffer: f.buffer,
        originalName: f.originalname,
      });
    };

    const FY1 = {
      pl_fy1: await save("pl_fy1", "FY1"),
      bs_fy1: await save("bs_fy1", "FY1"),
      itr_fy1: await save("itr_fy1", "FY1"),
    };

    const FY2 = {
      pl_fy2: await save("pl_fy2", "FY2"),
      bs_fy2: await save("bs_fy2", "FY2"),
      itr_fy2: await save("itr_fy2", "FY2"),
    };

    const FY3 = {
      pl_fy3: await save("pl_fy3", "FY3"),
      bs_fy3: await save("bs_fy3", "FY3"),
      itr_fy3: await save("itr_fy3", "FY3"),
    };

    const Bank = {
      bankStatementFile: await save("bankStatementFile", "Bank"),
    };

    // Build correct document structure
    const saved = await IncomeProof.create({
      Applicant_ID: applicantId,
      documents: {
        FY1,
        FY2,
        FY3,
        Bank,
      },
    });

    await Applicant.findOneAndUpdate(
      { Applicant_ID: applicantId },
      { Income_Proof_Submitted: "Yes" }
    );

    return res.status(201).json({
      message: "Income Proof uploaded successfully",
      saved,
    });

  } catch (err) {
    console.error("INCOME PROOF ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}