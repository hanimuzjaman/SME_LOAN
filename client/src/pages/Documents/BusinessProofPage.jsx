import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiUsers,
  FiClipboard,
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";

const cinRegex = /^[LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;

function StyledFileInput({ label, file, onChange, accept = "application/pdf" }) {
  return (
    <div className="space-y-1 flex flex-col mb-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <label className="w-24 inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md cursor-pointer hover:bg-gray-300 transition shadow-sm">
        <FiFileText size={14} />
        Upload
        <input
          type="file"
          accept={accept}
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

export default function BusinessProofPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Applicant ID coming from KYC Upload
  const incomingApplicantId = state?.applicantId || "";

  const [applicantId] = useState(incomingApplicantId); // not editable
  const [companyType, setCompanyType] = useState("OTHER");
  const [regDocFile, setRegDocFile] = useState(null);
  const [cinNumber, setCinNumber] = useState("");
  const [directorsListFile, setDirectorsListFile] = useState(null);

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  function validate() {
    const e = {};
    if (!applicantId) e.applicantId = "Applicant ID missing (system error).";
    if (!regDocFile) e.regDocFile = "Registration Document required.";

    if (cinNumber && !cinRegex.test(cinNumber.trim())) {
      e.cinNumber = "Invalid CIN format.";
    }

    if (companyType === "PVT_LTD" && !directorsListFile) {
      e.directorsListFile = "Directors list required for Pvt Ltd.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    if (!validate()) return;

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("applicantId", applicantId);

      // 🔴 FIX HERE: send uppercase values that backend expects
      formData.append("companyType", companyType); // "PVT_LTD" or "OTHER"

      formData.append("cinNumber", cinNumber);
      formData.append("regDocFile", regDocFile);
      if (companyType === "PVT_LTD" && directorsListFile) {
        formData.append("directorsListFile", directorsListFile);
      }

      const res = await fetch("http://localhost:8000/api/business-proof", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.message });
        return;
      }

      setSuccessMsg("Business Proof Submitted Successfully!");

      // 👉 MOVE TO INCOME PROOF WITH APPLICANT ID
      navigate("/income-proof-upload", { state: { applicantId } });
    } catch (err) {
      console.error(err);
      setErrors({ submit: "Network/server error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
  <div className="max-w-3xl mx-auto p-10 bg-white shadow-md rounded-2xl mt-10 border border-gray-200">
    {/* Title */}
    <h2 className="text-3xl font-semibold text-[#003366] mb-6 flex items-center gap-2">
      <FiClipboard className="text-blue-700" size={26} />
      Business Proof Upload
    </h2>

    {/* Success Message */}
    {successMsg && (
      <div className="p-4 mb-5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
        <FiCheckCircle size={18} /> {successMsg}
      </div>
    )}

    {/* Error Message */}
    {errors.submit && (
      <div className="p-4 mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
        <FiAlertTriangle size={18} /> {errors.submit}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-6">

     

      {/* Company Type */}
      <div>
        <label className="font-medium text-gray-700 mb-1 block">Company Type</label>
        <select
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
          className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
        >
          <option value="OTHER">Other</option>
          <option value="PVT_LTD">Private Limited</option>
        </select>
      </div>

      {/* Registration Document Upload */}
      <StyledFileInput
        label="Registration Document (PDF)"
        file={regDocFile}
        onChange={setRegDocFile}
      />
      {errors.regDocFile && <p className="text-xs text-red-600">{errors.regDocFile}</p>}

      {/* CIN Number */}
      <div>
        <label className="font-medium text-gray-700 mb-1 block">CIN Number</label>
        <input
          type="text"
          placeholder="L12345DL2000PTC123456"
          value={cinNumber}
          onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
          className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-600 outline-none transition"
        />
        {errors.cinNumber && <p className="text-xs text-red-600">{errors.cinNumber}</p>}
      </div>

      {/* Directors List (Conditional) */}
      {companyType === "PVT_LTD" && (
        <>
          <StyledFileInput
            label="Directors List (PDF)"
            file={directorsListFile}
            onChange={setDirectorsListFile}
          />
          {errors.directorsListFile && (
            <p className="text-xs text-red-600">{errors.directorsListFile}</p>
          )}
        </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-3 bg-[#003366] hover:bg-[#002244] text-white rounded-xl font-semibold flex items-center gap-2 shadow-sm transition disabled:opacity-60"
      >
        {submitting ? "Uploading..." : "Save & Continue"}
        <FiArrowRight size={18} />
      </button>
    </form>
  </div>
);
}