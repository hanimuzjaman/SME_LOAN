// src/pages/DashBoard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiBriefcase,
  FiUploadCloud,
  FiDollarSign,
  FiTag,
  FiHash,
  FiZap,
  FiCheckCircle,
  FiFileText,
  FiAlertTriangle,
  FiLink,
} from "react-icons/fi";

/**
 * Utility: friendly mapping from UI "field" to backend flag key.
 */
const UI_TO_BACKEND_FLAG = {
  "KYC Submitted": "KYC_Submitted",
  "Income Document Submitted": "Income_Proof_Submitted",
  "Business Proof Submitted": "Business_Proof_Submitted",
};

/** Small reusable card */
const KpiCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 flex-1 min-w-0">
    <div className={`text-2xl mb-1 ${colorClass}`}>
      <Icon size={24} />
    </div>
    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </p>
    <p className="text-xl font-extrabold text-gray-900 mt-0.5 truncate">
      {value}
    </p>
  </div>
);

/** Document status row — shows Submitted or Update button */
const DocumentStatusItem = ({ label, status, onUpdate }) => {
  const isSubmitted = status === "Yes";
  const StatusIcon = isSubmitted ? FiCheckCircle : FiUploadCloud;
  const statusColor = isSubmitted ? "text-green-600" : "text-red-600";

  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        <StatusIcon size={16} className={`${statusColor}`} />
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>

      <div className="flex items-center space-x-3">
        {isSubmitted ? (
          <p className="text-sm py-1 px-2 bg-green-200 font-light rounded-full">
            Submitted
          </p>
        ) : (
          <button
            onClick={() => onUpdate(label)}
            className="text-[#003366] text-sm px-2 py-1 font-light rounded-full border border-[#003366] hover:bg-[#003366] hover:text-white transition duration-150"
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const location = useLocation();
  const initialState = location.state || null;

  const [applicant, setApplicant] = useState(null); // full merged applicant object
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // NEW: document list state
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState("");

  // Extract candidate Applicant_ID from location.state if present
  const idFromState =
    initialState?.Applicant_ID ||
    initialState?.ApplicantId ||
    initialState?.applicantId ||
    initialState?.["Applicant ID"] ||
    null;

  const normalizeId = (raw) => {
    if (!raw) return null;
    return String(raw).trim();
  };

  // Fetch full applicant (loan + personal) from backend
  const fetchFullApplicant = useCallback(async (appId) => {
    const id = normalizeId(appId);
    if (!id) {
      setError("No Applicant ID provided.");
      setApplicant(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Try merged endpoint first
      const res = await axios.get(
        `http://localhost:8000/api/applicant/full/${encodeURIComponent(id)}`
      );
      setApplicant(res.data);
    } catch (err) {
      console.warn("fetchFullApplicant failed:", err?.response?.status);
      // If merged endpoint is not available or returns 404, fallback to loan-only
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        try {
          const loanRes = await axios.get(
            `http://localhost:8000/api/applicant/${encodeURIComponent(id)}`
          );
          setApplicant({ ...loanRes.data, _personalMissing: true });
        } catch (loanErr) {
          console.error("loan-only fetch failed:", loanErr);
          if (loanErr?.response?.status === 404) {
            setError("Applicant not found.");
          } else {
            setError("Server error while fetching applicant.");
          }
          setApplicant(null);
        }
      } else {
        console.error("fetchFullApplicant error:", err);
        setError("Server error while fetching applicant.");
        setApplicant(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-load documents once applicant is loaded
  useEffect(() => {
    if (applicant && applicant?.Applicant_ID) {
      fetchDocuments();
    }
  }, [applicant]);

  // On mount
  useEffect(() => {
    if (initialState) {
      const maybeId =
        initialState.Applicant_ID ||
        initialState.ApplicantId ||
        initialState["Applicant ID"] ||
        idFromState;

      const looksFull =
        (initialState.fullName ||
          initialState.email ||
          initialState.phone) &&
        (initialState.Applicant_industry ||
          initialState.industryType ||
          initialState["Applicant's Industry"]);

      if (looksFull) {
        setApplicant(initialState);
        return;
      }

      if (maybeId) {
        fetchFullApplicant(maybeId);
        return;
      }
    }

    if (!initialState) {
      setError("No applicant data provided. Use the search to load an applicant.");
      setApplicant(null);
    }
  }, [initialState, idFromState, fetchFullApplicant]);

  // If no applicantId was supplied via location.state, but user may be logged in,
  // try to get applicantId from profile (requires stored JWT). This supports
  // the flow: customer logs in -> server returns token and links applicantId by email.
  useEffect(() => {
    const tryProfileFetch = async () => {
      if (applicant || idFromState) return; // already loaded or in progress
      const token = localStorage.getItem("jwt");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:8000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const applicantIdFromProfile = res.data?.applicantId || res.data?.Applicant_ID || null;
        if (applicantIdFromProfile) {
          fetchFullApplicant(applicantIdFromProfile);
        } else {
          // No linked applicant: send user to check-client so they can create one
          // but only if they explicitly landed here without an applicant.
          // We don't auto-redirect immediately to avoid surprising the user.
          console.info("No applicant linked to profile");
        }
      } catch (err) {
        console.error("profile -> fetch applicant failed:", err);
        // token may be invalid; remove it so future checks are clean
        localStorage.removeItem("jwt");
      }
    };

    tryProfileFetch();
  }, [applicant, idFromState, fetchFullApplicant]);

  // Update a single workflow flag using mapped backend key names
  const updateField = async (label) => {
    if (!applicant || !applicant.Applicant_ID) {
      alert("No applicant loaded.");
      return;
    }

    const backendKey = UI_TO_BACKEND_FLAG[label];
    if (!backendKey) {
      alert("Unsupported field.");
      return;
    }

    const id = String(applicant.Applicant_ID).trim();

    try {
      await axios.patch(
        `http://localhost:8000/api/applicant/update/${encodeURIComponent(id)}`,
        {
          field: backendKey,
        }
      );

      setApplicant((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [backendKey]: "Yes",
          "KYC Submitted":
            backendKey === "KYC_Submitted"
              ? "Yes"
              : prev["KYC Submitted"],
          "Income Document Submitted":
            backendKey === "Income_Proof_Submitted"
              ? "Yes"
              : prev["Income Document Submitted"],
          "Business Proof Submitted":
            backendKey === "Business_Proof_Submitted"
              ? "Yes"
              : prev["Business Proof Submitted"],
        };
      });

      alert("Updated successfully");
    } catch (err) {
      console.error("updateField error:", err);
      alert("Failed to update flag.");
    }
  };

  // Derived applicant values
  const applicantId =
    applicant?.Applicant_ID ||
    applicant?.ApplicantId ||
    applicant?.["Applicant ID"] ||
    "N/A";
  const fullName =
    applicant?.fullName ||
    applicant?.FullName ||
    applicant?.name ||
    "Applicant Data Not Found";
  const phone = applicant?.phone || applicant?.Phone || "—";
  const loanAmount =
    applicant?.LoanAmount_Requested ?? applicant?.loanAmount ?? 0;
  const companyType =
    applicant?.Applicant_industry ||
    applicant?.industryType ||
    "N/A";
  const loanCategory =
    applicant?.Loan_Category || applicant?.LoanCategory || "N/A";
  const applicantCategory =
    applicant?.Applicant_Category ||
    applicant?.ApplicantCategory ||
    "—";

  // Application status
  const applicationStatus = applicant?.applicationStatus || "Pending";

  // For document flags
  const incomeFlag =
    applicant?.Income_Proof_Submitted ||
    applicant?.["Income Document Submitted"] ||
    "No";
  const kycFlag =
    applicant?.KYC_Submitted || applicant?.["KYC Submitted"] || "No";
  const businessFlag =
    applicant?.Business_Proof_Submitted ||
    applicant?.["Business Proof Submitted"] ||
    "No";

  const docsFlags = [incomeFlag, kycFlag, businessFlag];
  const submittedCount = docsFlags.filter((s) => s === "Yes").length;
  const docStatus = `${submittedCount}/${docsFlags.length} Completed`;

  // NEW: fetch documents list from /api/documents/:applicantId
  const fetchDocuments = async () => {
    if (!applicantId || applicantId === "N/A") {
      setDocsError("No Applicant ID to fetch documents.");
      return;
    }

    setDocsLoading(true);
    setDocsError("");
    setDocuments([]);

    try {
      const res = await axios.get(
        `http://localhost:8000/api/documents/${encodeURIComponent(
          applicantId
        )}`
      );
      setDocuments(res.data.documents || []);
    } catch (err) {
      console.error("fetchDocuments error:", err);
      setDocsError("Failed to load documents.");
    } finally {
      setDocsLoading(false);
    }
  };

  // Loading / error UI
  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-700">Loading applicant data...</p>
      </div>
    );
  }

  if (error && !applicant) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <p className="text-sm text-gray-600">
          Try searching the applicant again or create a new applicant.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-6 max-w-full mx-auto font-sans h-screen overflow-hidden flex flex-col">
      <header className="pb-4 mb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold text-[#003366] tracking-tight">
            Dashboard
          </h1>
          <div className={`px-4 py-2 rounded-full font-bold text-sm ${
            applicationStatus === "Approved"
              ? "bg-emerald-100 text-emerald-700"
              : applicationStatus === "Rejected"
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {applicationStatus === "Approved" && "Application Approved"}
            {applicationStatus === "Rejected" && "Application Rejected"}
            {applicationStatus === "Pending" && "Application Pending"}
          </div>
        </div>

        <div className="flex text-sm text-gray-500 mt-1 space-x-4">
          <span className="flex items-center">
            <FiHash size={14} className="mr-1" /> ID:
            <span className="font-semibold text-gray-700 ml-1">
              {applicantId}
            </span>
          </span>
          <span className="flex items-center">
            <FiPhone size={14} className="mr-1" /> {phone}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 mb-6">
        <KpiCard
          icon={FiDollarSign}
          label="Loan Requested"
          value={
            loanAmount && loanAmount !== 0
              ? `₹${Number(loanAmount).toLocaleString()}`
              : "N/A"
          }
          colorClass="text-green-600"
        />
        <KpiCard
          icon={FiBriefcase}
          label="Company Type"
          value={companyType}
          colorClass="text-blue-600"
        />
        <KpiCard
          icon={FiTag}
          label="Loan Category"
          value={loanCategory}
          colorClass="text-purple-600"
        />
        <KpiCard
          icon={FiZap}
          label="Doc Status"
          value={applicantId !== "N/A" ? docStatus : "0/3 Completed"}
          colorClass={
            submittedCount === docsFlags.length
              ? "text-green-600"
              : "text-yellow-600"
          }
        />
      </div>

      <div className="flex flex-1 flex-col md:flex-row gap-6 min-h-0">
        {/* LEFT: Profile */}
        <section className="md:w-1/3 bg-white p-5 rounded-xl border border-gray-100 shadow-lg flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center space-x-2">
            <FiUser />
            <span>Applicant Profile</span>
          </h2>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            <div className="p-2 border rounded bg-gray-50">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="font-medium text-sm">{fullName}</p>
            </div>

            <div className="p-2 border rounded bg-gray-50">
              <p className="text-xs text-gray-500">Industry</p>
              <p className="font-medium text-sm">{companyType}</p>
            </div>

            <div className="p-2 border rounded bg-gray-50">
              <p className="text-xs text-gray-500">Applicant Category</p>
              <p className="font-medium text-sm">{applicantCategory}</p>
            </div>

            <div className="p-2 border rounded bg-gray-50">
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="font-medium text-sm">
                {applicant ? "Review Pending" : "No Data"}
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: Documents + Files */}
        <section className="md:w-2/3 bg-white p-5 rounded-xl border border-gray-100 shadow-lg flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center space-x-2">
            <FiUploadCloud />
            <span>Required Documents</span>
          </h2>

          <div className="space-y-1 pb-4 border-b border-gray-200 mb-4">
            <DocumentStatusItem
              label="Income Document Submitted"
              status={incomeFlag}
              onUpdate={updateField}
            />
            <DocumentStatusItem
              label="KYC Submitted"
              status={kycFlag}
              onUpdate={updateField}
            />
            <DocumentStatusItem
              label="Business Proof Submitted"
              status={businessFlag}
              onUpdate={updateField}
            />
          </div>

          {/* Uploaded Files Viewer */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-semibold text-[#003366] flex items-center gap-2">
              <FiFileText />
              Uploaded Files (from Documents/data.json)
            </h3>
            <button
              onClick={fetchDocuments}
              disabled={docsLoading || applicantId === "N/A"}
              className={`px-3 py-1 text-sm rounded-md border ${
                docsLoading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white"
              }`}
            >
              {docsLoading ? "Loading..." : "Load Documents"}
            </button>
          </div>

          {docsError && (
            <div className="mb-3 p-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded flex items-center gap-1">
              <FiAlertTriangle size={14} />
              <span>{docsError}</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {documents.length === 0 && !docsLoading && !docsError && (
              <p className="text-sm text-gray-500">
                No documents loaded yet. Click{" "}
                <span className="font-semibold">Load Documents</span> to fetch.
              </p>
            )}

            {documents.length > 0 && (
              <ul className="text-sm space-y-2">
                {documents.map((doc, idx) => (
                  <li
                    key={`${doc.relativePath}-${idx}`}
                    className="flex items-center justify-between border-b border-gray-100 pb-1 last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-800">
                        {doc.label}{" "}
                        <span className="text-xs text-gray-500">
                          ({doc.section})
                        </span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {doc.originalName}
                      </span>
                    </div>
                    <a
                      href={`http://localhost:8000/files/${encodeURIComponent(
                        doc.relativePath
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-700 hover:text-blue-900 flex items-center mr-5 gap-1"
                    >
                      <FiLink size={14} />
                      View
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;