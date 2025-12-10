import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const LoanAmountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state;

  const [loanAmount, setLoanAmount] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (!state?.smeCategory || !state?.maxLoanAmount || !state?.applicantId) {
      navigate("/sme-classification");
    }
  }, [state, navigate]);

  if (!state?.applicantId) return null;

  const { smeCategory, maxLoanAmount, applicantId } = state;

  const handleSubmit = async () => {
    setWarning("");

    if (!loanAmount.trim()) {
      setWarning("Please enter the desired loan amount.");
      return;
    }

    const numericAmount = Number(loanAmount);

    if (isNaN(numericAmount)) {
      setWarning("Enter a valid number.");
      return;
    }

    if (numericAmount < 50000) {
      setWarning("Minimum loan amount is ₹50,000.");
      return;
    }

    if (numericAmount > maxLoanAmount) {
      setWarning(
        `⚠️ As a ${smeCategory} enterprise, your maximum limit is ₹${Number(
          maxLoanAmount
        ).toLocaleString()}.`
      );
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8000/api/applicant/loan/${encodeURIComponent(
          applicantId
        )}`,
        {
          loanAmount: numericAmount,
          applicantCategory: smeCategory,
        }
      );
    } catch (err) {
      console.error("PATCH ERROR:", err);
      setWarning("Failed to save loan amount.");
      return;
    }

    // 👇 FIX: Ensure applicantId is passed to KYC
    navigate("/kyc-upload", {
      state: {
        applicantId: String(applicantId),
        smeCategory,
        loanAmount: numericAmount,
      },
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-8 border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">
          Enter Desired Loan Amount
        </h1>

        <p className="text-gray-700 text-sm mb-6 leading-relaxed">
          SME Category: <strong>{smeCategory}</strong> <br />
          Maximum Loan Allowed:{" "}
          <strong className="text-green-700">
            ₹{Number(maxLoanAmount).toLocaleString()}
          </strong>
        </p>

        <label className="block font-medium text-gray-800 mb-1">
          Loan Amount (₹)
        </label>

        <input
          type="number"
          className="w-full mb-2 px-4 py-2 border rounded-md"
          placeholder="Enter desired loan amount"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
        />

        {warning && (
          <p className="text-red-600 text-sm font-medium mb-4">{warning}</p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-blue-900 text-white rounded-md text-lg hover:bg-blue-800 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default LoanAmountPage;