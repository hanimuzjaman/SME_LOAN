import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const SMEClassificationPage = () => {
  const [investment, setInvestment] = useState("");
  const [turnover, setTurnover] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const applicantId = location.state?.applicantId || null;

  const handleSubmit = async () => {
    if (!investment || !turnover) return alert("Please fill both fields.");

    try {
      const res = await axios.post("http://localhost:8000/api/classify/sme", {
        investment: Number(investment),
        turnover: Number(turnover),
      });

      const { smeCategory, maxLoanAmount } = res.data;

      navigate("/loan-amount", {
        state: { smeCategory, maxLoanAmount, applicantId },
      });
    } catch (err) {
      console.error(err);
      alert("Server error. Try again.");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-2xl p-8 border border-blue-100">

        <h1 className="text-2xl font-bold text-blue-900 mb-4">
          SME Classification Details
        </h1>

        {/* FIXED – No <ul> inside <p> */}
        <div className="text-gray-700 mb-6 text-sm leading-relaxed">
          <p >
            Enter the details required for SME classification as per MSME
            guidelines.
          </p>

          <br />

          <p className="font-semibold  text-blue-800">Instructions:</p>

          <ul className="list-disc ml-5  mt-2 text-gray-700">
            <li><strong>Total Investment</strong> = machinery + equipment</li>
            <li><strong>Annual Turnover</strong> = yearly business revenue</li>
          </ul>
        </div>

        {/* Investment */}
        <label className="block font-medium text-gray-800 mb-1">
          Total Investment (₹)
        </label>
        <input
          type="number"
          className="w-full mb-4 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter total investment (e.g., 500000)"
          value={investment}
          onChange={(e) => setInvestment(e.target.value)}
        />

        {/* Turnover */}
        <label className="block font-medium text-gray-800 mb-1">
          Annual Turnover (₹)
        </label>
        <input
          type="number"
          className="w-full mb-6 px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter annual turnover (e.g., 2000000)"
          value={turnover}
          onChange={(e) => setTurnover(e.target.value)}
        />

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

export default SMEClassificationPage;