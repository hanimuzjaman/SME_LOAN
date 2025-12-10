// SME CLASSIFICATION (MICRO / SMALL / MEDIUM)
export const classifySME = (req, res) => {
  const { investment, turnover } = req.body;

  if (!investment || !turnover) {
    return res.status(400).json({ message: "Investment and turnover are required." });
  }

  let smeCategory = "";
  let maxLoanAmount = 0;

  if (investment <= 10000000 && turnover <= 50000000) {
    smeCategory = "Micro";
    maxLoanAmount = 1000000; // ₹10 lakh
  } else if (investment <= 100000000 && turnover <= 500000000) {
    smeCategory = "Small";
    maxLoanAmount = 20000000; // ₹2 crore
  } else {
    smeCategory = "Medium";
    maxLoanAmount = 50000000; // ₹5 crore
  }

  return res.json({
    smeCategory,
    maxLoanAmount,
  });
};

// APPLICANT CATEGORY BASED ON LOAN AMOUNT
export const classifyApplicantCategory = (req, res) => {
  const { loanAmount } = req.body;

  if (!loanAmount) {
    return res.status(400).json({ error: "Loan amount required" });
  }

  let applicantCategory = "";

  if (loanAmount <= 1000000) {
    applicantCategory = "Small";
  } else if (loanAmount <= 5000000) {
    applicantCategory = "Medium";
  } else {
    applicantCategory = "Large";
  }

  return res.json({ applicantCategory });
};