import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  FiFileText,
  FiUser,
  FiBriefcase,
  FiDownload,
  FiZap,
  FiClock,
  FiEdit3,
  FiDollarSign,
  FiMail,
  FiPhone,
  FiCalendar,
  FiTag,
  FiUserCheck,
  FiBarChart2,
  FiAlertCircle,
} from "react-icons/fi";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white p-4 rounded-lg shadow-md border border-gray-100 ${className}`}>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, right }) => (
  <div className="flex items-center justify-between gap-3 mb-5 border-b-2 border-slate-200 pb-4">
    <div className="flex items-center gap-3">
      {Icon && <Icon className="w-6 h-6 text-slate-600" />}
      <h3 className="text-lg md:text-xl font-bold text-gray-900">{title}</h3>
    </div>
    {right && <div className="text-sm">{right}</div>}
  </div>
);

const Kpi = ({ label, value, icon: Icon, colorClass = "text-slate-700", bgColor = "bg-slate-100" }) => (
  <Card className="p-3 flex items-start gap-3 h-full">
    <div className={`p-2 rounded-lg ${bgColor}`}>
      <Icon className={`w-5 h-5 ${colorClass}`} />
    </div>
    <div className="flex-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl md:text-2xl font-bold mt-1 ${colorClass}`}>{value ?? "—"}</p>
    </div>
  </Card>
);

const DetailField = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-b-0 px-2 rounded">
    <Icon className="w-5 h-5 mt-0.5 text-slate-500 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-gray-900 text-sm mt-1">{value ?? "—"}</p>
    </div>
  </div>
);

const DocumentList = ({ title, documents, icon: Icon, docsLoading }) => {
  const filteredDocs = documents.filter(doc => doc.section === title);
  return (
    <Card className="shadow-md">
      <SectionTitle 
        icon={Icon} 
        title={`${title} Documents`}
        right={<span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${filteredDocs.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {filteredDocs.length > 0 ? `✓ ${filteredDocs.length}` : "Pending"}
        </span>}
      />
      {docsLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full" />
          <p className="text-sm text-gray-500 ml-2">Loading documents...</p>
        </div>
      )}
      {!docsLoading && filteredDocs.length === 0 && (
        <div className="py-6 text-center">
          <FiAlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No {title} files uploaded yet</p>
        </div>
      )}
      <div className="space-y-2">
        {filteredDocs.map((doc, i) => (
          <div key={i} className="p-2 border border-slate-200 rounded-md flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{doc.label}</p>
              <p className="text-xs text-gray-500 truncate">{doc.originalName}</p>
            </div>
            <a href={`http://localhost:8000/files/${encodeURIComponent(doc.relativePath)}`} target="_blank" rel="noreferrer" className="ml-2 p-2 text-slate-600 rounded-md shrink-0" title="Download document">
              <FiDownload className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </Card>
  );
};

const EmployeeDashhboard = () => {
  const location = useLocation();
  const initialState = location.state || {};
  const employeeHeaders = () => {
    const token = localStorage.getItem("employee_jwt");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("Pending");

  const idFromState = initialState?.Applicant_ID || initialState?.applicantId || null;

  const fetchFullApplicant = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/applicant/employee/full/${encodeURIComponent(id)}`, {
        headers: employeeHeaders(),
      });
      setApplicant(res.data);
      setApplicationStatus(res.data?.applicationStatus || "Pending");
    } catch (err) {
      // If employee token missing/invalid fall back to public endpoint so UI still loads
      try {
        const fallback = await axios.get(`http://localhost:8000/api/applicant/${encodeURIComponent(id)}`);
        setApplicant(fallback.data);
        setApplicationStatus(fallback.data?.applicationStatus || "Pending");
      } catch (e) {
        setApplicant(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async (appId) => {
    if (!appId) return;
    setDocsLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/api/documents/${encodeURIComponent(appId)}`);
      setDocuments(res.data.documents || []);
    } catch (err) {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = idFromState || initialState?.Applicant_ID || initialState?.applicantId;
    if (id) fetchFullApplicant(id);
  }, [initialState, idFromState, fetchFullApplicant]);

  useEffect(() => {
    if (applicant?.Applicant_ID) fetchDocuments(applicant.Applicant_ID);
  }, [applicant, fetchDocuments]);

  const handleStatusUpdate = async (newStatus) => {
    if (!applicant?.Applicant_ID) {
      alert("Applicant ID not found");
      return;
    }

    const token = localStorage.getItem("employee_jwt");
    if (!token) {
      alert("Employee session expired. Please log in again.");
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.patch(
        `http://localhost:8000/api/applicant/update-status/${encodeURIComponent(applicant.Applicant_ID)}`,
        { applicationStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplicationStatus(newStatus);
      setApplicant((prev) => ({
        ...prev,
        applicationStatus: newStatus,
      }));
      alert(`Application ${newStatus.toLowerCase()}`);
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update application status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-700">Loading applicant data...</p>
        </div>
      </div>
    );

  if (!applicant)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="max-w-md text-center">
          <p className="text-base font-semibold text-red-600 mb-1">Applicant not found</p>
          <p className="text-sm text-gray-600">Please verify the Applicant ID and try again.</p>
        </Card>
      </div>
    );

  const applicantId = applicant.Applicant_ID || applicant.ApplicantId || "N/A";
  const fullName = applicant.fullName || applicant.FullName || applicant.name || "Unnamed Applicant";
  const docsCompletedCount =
    (applicant.KYC_Submitted === "Yes" ? 1 : 0) +
    (applicant.Income_Proof_Submitted === "Yes" ? 1 : 0) +
    (applicant.Business_Proof_Submitted === "Yes" ? 1 : 0);

  return (
    <div className="bg-linear-to-br from-slate-50 to-blue-50 min-h-screen px-4 md:px-8 py-8 md:py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="mb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">📋 Loan Application Review</p>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">{fullName}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                applicationStatus === "Approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : applicationStatus === "Rejected"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}>
                {applicationStatus === "Approved" && "✓ Application Approved"}
                {applicationStatus === "Rejected" && "✗ Application Rejected"}
                {applicationStatus === "Pending" && "⏳ Pending"}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <FiTag className="w-4 h-4 text-slate-500" /> <strong>{applicantId}</strong>
            </span>
            <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <FiBriefcase className="w-4 h-4 text-slate-500" /> {applicant.Applicant_Category || "N/A"}
            </span>
            <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200">
              <FiCalendar className="w-4 h-4 text-slate-500" /> {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => handleStatusUpdate("Approved")}
              disabled={updating || applicationStatus === "Approved"}
              className="px-4 py-2 rounded-md bg-emerald-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700"
            >
              <FiZap className="w-4 h-4" /> {updating ? "Updating..." : "Approve"}
            </button>
            <button 
              onClick={() => handleStatusUpdate("Rejected")}
              disabled={updating || applicationStatus === "Rejected"}
              className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
            >
              <FiAlertCircle className="w-4 h-4" /> {updating ? "Updating..." : "Reject"}
            </button>
            <button className="px-4 py-2 rounded-md bg-amber-500 text-white font-semibold flex items-center gap-2 hover:bg-amber-600">
              <FiClock className="w-4 h-4" /> Request Documents
            </button>
            <button className="px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-800 font-semibold flex items-center gap-2 hover:bg-slate-50">
              <FiEdit3 className="w-4 h-4" /> Edit Information
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Kpi label="Loan Requested" value={applicant.LoanAmount_Requested ? `₹${Number(applicant.LoanAmount_Requested).toLocaleString("en-IN")}` : "N/A"} icon={FiDollarSign} colorClass="text-emerald-600" bgColor="bg-emerald-100" />
          <Kpi label="Documents Status" value={`${docsCompletedCount}/3`} icon={FiFileText} colorClass={docsCompletedCount === 3 ? "text-emerald-600" : "text-amber-600"} bgColor={docsCompletedCount === 3 ? "bg-emerald-100" : "bg-amber-100"} />
          <Card className="p-3 flex items-center gap-3 h-full">
            <div className="w-12 h-12 rounded-md bg-linear-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg font-bold shrink-0">
              {(fullName || "?").split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</p>
              <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{fullName}</h4>
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{applicant.email || "N/A"}</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <SectionTitle icon={FiUser} title="Contact & Registration" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailField label="Phone Number" value={applicant.phone} icon={FiPhone} />
              <DetailField label="Application ID" value={applicantId} icon={FiTag} />
              <DetailField label="Email" value={applicant.email} icon={FiMail} />
              <DetailField label="S_No" value={applicant.S_No} icon={FiTag} />
            </div>
          </Card>
          <Card>
            <SectionTitle icon={FiBriefcase} title="Business & Loan Information" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailField label="Industry Type" value={applicant.Applicant_industry || applicant.industryType} icon={FiBriefcase} />
              <DetailField label="Loan Category" value={applicant.Loan_Category || applicant.LoanCategory} icon={FiDollarSign} />
              <DetailField label="Applicant Category" value={applicant.Applicant_Category} icon={FiUser} />
              <DetailField label="Registered On" value={applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : "—"} icon={FiCalendar} />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <SectionTitle icon={FiFileText} title="Document Checklist" />
            <div className="space-y-2.5">
              {[
                { label: "KYC Documents", key: "KYC_Submitted", icon: FiUserCheck },
                { label: "Income Proof", key: "Income_Proof_Submitted", icon: FiBarChart2 },
                { label: "Business Proof", key: "Business_Proof_Submitted", icon: FiBriefcase },
              ].map(({ label, key, icon: Icon }) => (
                <div key={key} className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${applicant[key] === "Yes" ? "bg-emerald-50 border-emerald-200 shadow-sm" : "bg-amber-50 border-amber-200"}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${applicant[key] === "Yes" ? "text-emerald-600" : "text-amber-600"}`} />
                    <span className="font-semibold text-gray-800 text-sm">{label}</span>
                  </div>
                  <span className={`px-3 py-1.5 text-xs font-bold rounded-full flex items-center gap-1 ${applicant[key] === "Yes" ? "bg-emerald-200 text-emerald-800" : "bg-amber-200 text-amber-800"}`}>
                    {applicant[key] === "Yes" ? "✓ Done" : "⏳ Pending"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <DocumentList title="KYC" documents={documents} icon={FiUserCheck} docsLoading={docsLoading} />
          <DocumentList title="Business_Proof" documents={documents} icon={FiBriefcase} docsLoading={docsLoading} />
        </div>

        <Card>
          <SectionTitle 
            icon={FiBarChart2} 
            title="Income Proof Documents"
            right={<span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${documents.filter(doc => doc.section.startsWith('Income_Proof')).length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {documents.filter(doc => doc.section.startsWith('Income_Proof')).length > 0 ? `✓ ${documents.filter(doc => doc.section.startsWith('Income_Proof')).length}` : "Pending"}
            </span>}
          />
          {docsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full mr-2" />
              <p className="text-sm text-gray-600">Loading documents...</p>
            </div>
          )}
          {!docsLoading && documents.filter(doc => doc.section.startsWith('Income_Proof')).length === 0 && (
            <div className="py-8 text-center">
              <FiAlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2 opacity-70" />
              <p className="text-sm text-gray-600">No Income Proof files uploaded yet</p>
            </div>
          )}
          {!docsLoading && documents.filter(doc => doc.section.startsWith('Income_Proof')).length > 0 && (
            <div className="space-y-4">
              {documents.filter(doc => doc.section === 'Income_Proof/Bank').length > 0 && (
                <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                  <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <FiDownload className="w-4 h-4" /> Bank Statements
                  </h4>
                  <div className="space-y-2">
                    {documents.filter(doc => doc.section === 'Income_Proof/Bank').map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white border border-blue-100 rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                          <p className="text-xs text-gray-500 truncate">{doc.originalName}</p>
                        </div>
                        <a href={`http://localhost:8000/files/${encodeURIComponent(doc.relativePath)}`} target="_blank" rel="noreferrer" className="ml-2 p-2 text-blue-600 rounded-md shrink-0">
                          <FiDownload className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {['FY1', 'FY2', 'FY3'].map((fy, idx) => {
                const fyDocs = documents.filter(doc => doc.section === `Income_Proof/${fy}`);
                const colors = ['purple', 'indigo', 'violet'];
                const colorClass = colors[idx];
                return fyDocs.length > 0 ? (
                  <div key={fy} className={`border-2 border-${colorClass}-200 rounded-xl p-4 bg-${colorClass}-50 hover:bg-${colorClass}-100 transition`}>
                    <h4 className={`text-sm font-bold text-${colorClass}-900 mb-3`}>Fiscal Year: {fy}</h4>
                      <div className="space-y-2">
                        {fyDocs.map((doc, i) => (
                          <div key={i} className={`flex items-center justify-between p-2 bg-white border border-${colorClass}-100 rounded-md`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 uppercase">{doc.label}</p>
                              <p className="text-xs text-gray-500 truncate">{doc.originalName}</p>
                            </div>
                            <a href={`http://localhost:8000/files/${encodeURIComponent(doc.relativePath)}`} target="_blank" rel="noreferrer" className={`ml-2 p-2 text-${colorClass}-600 rounded-md shrink-0`}>
                              <FiDownload className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                  </div>
                ) : null;
              })}
              {documents.filter(doc => doc.section === 'Income_Proof/BankStatement').length > 0 && (
                <div className="border-2 border-cyan-200 rounded-lg p-3 bg-cyan-50">
                  <h4 className="text-sm font-bold text-cyan-900 mb-2 flex items-center gap-2">
                    <FiDownload className="w-4 h-4" /> Bank Statements (Alt Format)
                  </h4>
                  <div className="space-y-2">
                    {documents.filter(doc => doc.section === 'Income_Proof/BankStatement').map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white border border-cyan-100 rounded-md">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800">{doc.label}</p>
                          <p className="text-xs text-gray-500 truncate">{doc.originalName}</p>
                        </div>
                        <a href={`http://localhost:8000/files/${encodeURIComponent(doc.relativePath)}`} target="_blank" rel="noreferrer" className="ml-2 p-2 text-cyan-600 rounded-md shrink-0">
                          <FiDownload className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashhboard;
