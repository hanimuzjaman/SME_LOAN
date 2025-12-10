import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiUserPlus, FiArrowRightCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// --- InputField Component ---
const InputField = ({ type = "text", value, onChange, placeholder, disabled = false }) => (
  <input
    type={type}
    placeholder={placeholder}
    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      disabled ? "bg-gray-100 text-gray-500" : "bg-white"
    }`}
    value={value}
    onChange={onChange}
    disabled={disabled}
  />
);

// --- SelectField Component ---
const SelectField = ({ value, onChange, options, placeholder }) => (
  <select
    className={`w-full px-4 py-2 border rounded-md appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      value === "" ? "text-gray-400" : "text-gray-800"
    }`}
    value={value}
    onChange={onChange}
  >
    <option value="" disabled>
      {placeholder}
    </option>

    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const CheckClient = () => {
  // Personal/Company fields
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Business fields
  const [industryType, setIndustryType] = useState("");

  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  // If user is logged in (JWT present AND not just registered), ask backend for profile.
  // If profile has applicantId -> navigate to dashboard.
  // Otherwise show the new-applicant form so the logged-in customer can create their application.
  // NOTE: We check sessionStorage flag to avoid redirecting on fresh registration.
  useEffect(() => {
    const checkProfile = async () => {
      const token = localStorage.getItem("jwt");
      if (!token) return;

      // If this is a fresh registration, don't auto-redirect
      const justRegistered = sessionStorage.getItem("justRegistered");
      if (justRegistered) {
        sessionStorage.removeItem("justRegistered");
        // Stay on the form; don't try to fetch profile
        return;
      }

      try {
        const res = await axios.get("http://localhost:8000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const applicantId = res.data?.applicantId || res.data?.Applicant_ID || null;
        if (applicantId) {
          // User logged in and has an applicant -> go to dashboard
          navigate("/dashboard", { state: { Applicant_ID: applicantId } });
        } else {
          // logged-in customer without an applicant record -> prefill email if available
          if (res.data?.user?.email) setEmail(res.data.user.email);
        }
      } catch (err) {
        console.error("profile check error:", err);
        // token might be invalid/expired — remove it and stay on check-client
        localStorage.removeItem("jwt");
      }
    };

    checkProfile();
  }, [navigate]);

  // ---------------------------------------------
  // CREATE APPLICANT ("new" flow)
  // --------------------------------------------- 
  const createApplicant = async () => {
    const company = companyName.trim();
    const ph = phone.trim();
    const mail = email.trim().toLowerCase();
    const ind = industryType.trim(); // keep original case;

    if (!company || !ph || !mail || !ind) {
      alert("Please fill all required fields.");
      return;
    }

    if (!/^[A-Za-z0-9\s&.,'-]{3,}$/.test(company)) {
      alert("Enter a valid Company Name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(ph)) {
      alert("Phone number must be 10 digits.");
      return;
    }

    if (!mail.includes("@") || !mail.includes(".")) {
      alert("Enter a valid email address.");
      return;
    }

    setCreating(true);

    try {
      const res = await axios.post("http://localhost:8000/api/applicant/new", {
        companyName: company,
        phone: ph,
        email: mail,
        companyType: ind,
      });

      alert("Applicant created successfully!");

      // Navigate to SME classification / KYC step with the applicant id from backend
      navigate("/sme-classification", {
        state: { applicantId: res.data.Applicant_ID },
      });
    } catch (err) {
      console.error("Create applicant error:", err);
      const msg = err?.response?.data?.message || "Failed to create applicant.";
      alert(msg);
    } finally {
      setCreating(false);
    }
  };  // ---------------------------------------------------
  // UI - Only new applicant form (Search + existing removed)
  // ---------------------------------------------------
  return (
  <div className="px-6 py-12 max-w-xl mx-auto font-sans">
    <div className="space-y-6 p-8 border border-gray-200 rounded-2xl shadow-md">

      {/* HEADER */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
        <FiUserPlus className="text-blue-700" />
        Start New Application
      </h2>
      <p className="text-sm text-gray-500 -mt-2 mb-4">
        Please provide business details to begin the application process.
      </p>

      {/* Company Name */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Company Name *</label>
        <InputField
          placeholder="Enter company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>

      {/* Email */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Email Address *</label>
        <InputField
          type="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {/* Phone */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Phone Number *</label>
        <InputField
          type="tel"
          placeholder="10-digit phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      {/* Industry Type */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Industry Type *</label>
        <SelectField
          placeholder="Select industry type"
          value={industryType}
          onChange={(e) => setIndustryType(e.target.value)}
          options={[
            { value: "SERVICES", label: "Services" },
            { value: "TRADING", label: "Trading" },
            { value: "MANUFACTURING", label: "Manufacturing" },
          ]}
        />
      </div>

      {/* Loan Category */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Loan Category</label>
        <InputField value={"SME"} disabled={true} />
      </div>

      {/* Button */}
      <button
        onClick={createApplicant}
        disabled={creating}
        className={`w-full py-3 text-lg rounded-lg flex items-center justify-center gap-2 font-medium transition ${
          creating
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-blue-900 text-white hover:bg-blue-950"
        }`}
      >
        {creating ? "Creating..." : "Proceed to KYC"} <FiArrowRightCircle />
      </button>
    </div>
  </div>
);
};

export default CheckClient;