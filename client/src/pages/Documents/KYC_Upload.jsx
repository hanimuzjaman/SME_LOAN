import React, { useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiArrowRight, FiFileText } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

function FileInput({ label, file, onChange }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {/* Small Upload Button */}
      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md cursor-pointer hover:bg-gray-300 hover:text-gray-900 transition">
        <FiFileText size={14} />
        <span>Upload</span>

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>

      {/* File Name */}
      {file && (
        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <FiCheckCircle size={12} className="text-green-600" />
          {file.name}
        </p>
      )}
    </div>
  );
}

export default function KYC_Upload() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const applicantId = state?.applicantId;

  const [businessPANFile, setBusinessPANFile] = useState(null);
  const [ownerPANFile, setOwnerPANFile] = useState(null);
  const [ownerAadharFile, setOwnerAadharFile] = useState(null);

  const [businessPAN, setBusinessPAN] = useState("");
  const [ownerPAN, setOwnerPAN] = useState("");
  const [ownerAadhaar, setOwnerAadhaar] = useState("");

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!businessPANFile) e.businessPANFile = "Business PAN PDF required.";
    if (!ownerPANFile) e.ownerPANFile = "Owner PAN PDF required.";
    if (!ownerAadharFile) e.ownerAadharFile = "Aadhaar PDF required.";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("businessPAN", businessPAN);
      fd.append("ownerPAN", ownerPAN);
      fd.append("ownerAadhaar", ownerAadhaar);

      fd.append("businessPANFile", businessPANFile);
      fd.append("ownerPANFile", ownerPANFile);
      fd.append("ownerAadharFile", ownerAadharFile);

      const res = await fetch(`http://localhost:8000/api/kyc/${applicantId}`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ submit: data.message });
        setLoading(false);
        return;
      }

      setSuccess("KYC Upload Successful!");
      setTimeout(() => navigate("/business-proof-upload", { state: { applicantId } }), 700);

    } catch (err) {
      console.error(err);
      setErrors({ submit: "Server error" });
    }

    setLoading(false);
  }

  return (
  <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-lg mt-10 border border-gray-200">
    {/* Title */}
    <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex gap-2 items-center">
      <FiFileText className="text-blue-700" /> KYC Document Upload
    </h2>

    {/* Error Alert */}
    {Object.keys(errors).length > 0 && (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg mb-5 flex gap-2 items-center text-sm">
        <FiAlertTriangle className="text-red-600" /> Please check required fields.
      </div>
    )}

    {/* Success Alert */}
    {success && (
      <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg mb-5 flex gap-2 items-center text-sm">
        <FiCheckCircle className="text-green-600" /> {success}
      </div>
    )}

    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Business PAN */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Business PAN</label>
        <input
          type="text"
          placeholder="Enter Business PAN"
          className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          value={businessPAN}
          onChange={(e) => setBusinessPAN(e.target.value.toUpperCase())}
        />
      </div>

      <FileInput
        label="Upload Business PAN PDF"
        file={businessPANFile}
        onChange={setBusinessPANFile}
      />

      {/* Owner PAN */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Owner PAN</label>
        <input
          type="text"
          placeholder="Enter Owner PAN"
          className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          value={ownerPAN}
          onChange={(e) => setOwnerPAN(e.target.value.toUpperCase())}
        />
      </div>

      <FileInput
        label="Upload Owner PAN PDF"
        file={ownerPANFile}
        onChange={setOwnerPANFile}
      />

      {/* Owner Aadhaar */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Owner Aadhaar</label>
        <input
          type="text"
          placeholder="Enter 12-digit Aadhaar"
          maxLength={12}
          className="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          value={ownerAadhaar}
          onChange={(e) => setOwnerAadhaar(e.target.value.replace(/\D/g, ""))}
        />
      </div>

      <FileInput
        label="Upload Aadhaar PDF"
        file={ownerAadharFile}
        onChange={setOwnerAadharFile}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-blue-700 hover:bg-blue-800 transition text-white rounded-lg flex items-center justify-center gap-2 font-medium shadow-sm disabled:opacity-60"
      >
        {loading ? "Uploading..." : <>Submit KYC <FiArrowRight /></>}
      </button>
    </form>
  </div>
);
}