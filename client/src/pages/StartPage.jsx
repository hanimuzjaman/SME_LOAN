import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiBriefcase, 
  FiUserCheck, // Changed to reflect login/employee access
  FiLogIn,     // Added for Customer Auth
  FiShield, 
  FiCheckCircle 
} from "react-icons/fi";

const StartPage = () => {
  const navigate = useNavigate();

  return (
    // Updated container: full screen, centralized, and clean background
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-xl  p-10 md:p-12  text-center transform transition duration-500 ">
        
        {/* Logo/Icon Block */}
        <div className="inline-block p-4 rounded-full bg-blue-100 text-blue-700 mb-6">
          <FiBriefcase className="w-8 h-8" />
        </div>

        {/* Heading and Tagline */}
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          SME Financing Gateway
        </h1>
        <p className="text-lg text-gray-500 mb-8">
          Streamlined Business Loan Pre-Screening and Management System
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <button
            onClick={() => navigate("/employee-login")}
            className="w-full px-5 py-3 bg-[#004488] hover:bg-[#003366] text-white rounded-4xl font-semibold  transition duration-200 shadow-md flex items-center justify-center gap-3"
          >
            <FiUserCheck className="w-5 h-5" />
            Employee Access
          </button>

          <button
            onClick={() => navigate("/customer-auth")}
            className="w-full px-5 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-4xl font-semibold  transition duration-200 shadow-md flex items-center justify-center gap-3"
          >
            <FiLogIn className="w-5 h-5" />
            Customer Portal
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400">
            &copy; {new Date().getFullYear()} SME Financing Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default StartPage;