import React, { useState } from "react";
import {
  FiFileText,
  FiAlertTriangle,
  FiCheckCircle,
  FiDollarSign,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

function FileInput({ label, file, onChange, name }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Styled Small Upload Button */}
      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md cursor-pointer hover:bg-gray-300 transition shadow-sm">
        <FiFileText size={14} />
        Upload
        <input
          type="file"
          name={name}
          accept="application/pdf,image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {file && (
        <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
          <FiCheckCircle size={12} className="text-green-600" /> {file.name}
        </p>
      )}
    </div>
  );
}

export default function IncomeProofPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const applicantId = state?.applicantId;

  // State for files
  const [plFiles, setPlFiles] = useState([null, null, null]);
  const [bsFiles, setBsFiles] = useState([null, null, null]);
  const [itrFiles, setItrFiles] = useState([null, null, null]);
  const [bankStatementFile, setBankStatementFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const updateArray = (setter, index, file) => {
    setter((list) => list.map((f, i) => (i === index ? file : f)));
  };

  function validate() {
    const e = {};

    for (let i = 0; i < 3; i++) {
      if (!plFiles[i]) e[`pl${i}`] = `P&L FY${i + 1} required`;
      if (!bsFiles[i]) e[`bs${i}`] = `Balance Sheet FY${i + 1} required`;
      if (!itrFiles[i]) e[`itr${i}`] = `ITR FY${i + 1} required`;
    }

    if (!bankStatementFile) e.bank = "Bank Statement required";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();

      // Attach FY1–FY3 files in correct names
      for (let fy = 1; fy <= 3; fy++) {
        formData.append(`pl_fy${fy}`, plFiles[fy - 1]);
        formData.append(`bs_fy${fy}`, bsFiles[fy - 1]);
        formData.append(`itr_fy${fy}`, itrFiles[fy - 1]);
      }

      formData.append("bankStatementFile", bankStatementFile);

      const res = await fetch(
        `http://localhost:8000/api/income-proof/${encodeURIComponent(applicantId)}`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      console.log("Income Proof Response:", data);

      if (!res.ok) {
        setErrors({ submit: data.message });
        setSubmitting(false);
        return;
      }

      setSuccessMsg("Income Proof Uploaded Successfully ✔");

      setTimeout(() => {
        navigate("/dashboard", { state: { applicantId } });
      }, 1200);
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Server error. Try again." });
    }

    setSubmitting(false);
  }

  return (
    <div className="w-[76rem] mx-auto p-10 font-sans mt-5  ">

      {/* Title */}
      <h2 className="text-3xl font-semibold text-blue-900 flex items-center gap-2 mb-6">
        <FiFileText /> Income & Financial Proof
      </h2>

      {/* Error Alert */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
          <FiAlertTriangle /> Please fix the highlighted errors.
        </div>
      )}

      {/* Success Alert */}
      {successMsg && (
        <div className="p-4 mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
          <FiCheckCircle /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* Three FY boxes in a row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((fy) => (
            <div
              key={fy}
              className="p-5 border rounded-2xl bg-gray-50 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
                Financial Year {fy}
              </h3>

              <FileInput
                label="P&L Statement"
                name={`pl_fy${fy}`}
                file={plFiles[fy - 1]}
                onChange={(f) => updateArray(setPlFiles, fy - 1, f)}
              />
              {errors[`pl${fy - 1}`] && (
                <p className="text-xs text-red-600">{errors[`pl${fy - 1}`]}</p>
              )}

              <FileInput
                label="Balance Sheet"
                name={`bs_fy${fy}`}
                file={bsFiles[fy - 1]}
                onChange={(f) => updateArray(setBsFiles, fy - 1, f)}
              />
              {errors[`bs${fy - 1}`] && (
                <p className="text-xs text-red-600">{errors[`bs${fy - 1}`]}</p>
              )}

              <FileInput
                label="Income Tax Return (ITR)"
                name={`itr_fy${fy}`}
                file={itrFiles[fy - 1]}
                onChange={(f) => updateArray(setItrFiles, fy - 1, f)}
              />
              {errors[`itr${fy - 1}`] && (
                <p className="text-xs text-red-600">{errors[`itr${fy - 1}`]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Bank Statement */}
        <div className="p-6 bg-gray-50 border rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2 mb-4">
            <FiDollarSign /> Business Bank Statement
          </h3>

          <FileInput
            label="Upload Last 6–12 Months Bank Statement"
            name="bankStatementFile"
            file={bankStatementFile}
            onChange={setBankStatementFile}
          />

          {errors.bank && (
            <p className="text-xs text-red-600">{errors.bank}</p>
          )}
        </div>

        {/* Submit */}
        {errors.submit && (
          <p className="text-red-700 mb-2 text-sm">{errors.submit}</p>
        )}

<div className="flex justify-end">
  <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-blue-800 hover:bg-blue-900 text-white rounded-xl font-semibold shadow-md transition disabled:opacity-60"
        >
          {submitting ? "Uploading..." : "Submit Income Proof"}
        </button>
</div>
        
      </form>
    </div>
  );
}