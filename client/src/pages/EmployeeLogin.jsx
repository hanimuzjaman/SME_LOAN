import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock } from "react-icons/fi";

const EmployeeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Provide email and password");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/employee/login", {
        email,
        password,
      });

      if (res.data?.success) {
        // persist employee token for protected routes (status updates, full applicant view)
        if (res.data.token) {
          localStorage.setItem("employee_jwt", res.data.token);
        }
        navigate("/applicants");
      } else {
        alert(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("employee login error:", err);
      const msg = err?.response?.data?.message || "Server error or backend not implemented";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md border border-gray-200">
        
        {/* Title */}
        <h2 className="text-3xl font-semibold text-gray-800 text-center mb-2">
          Employee Login
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          Access your employee dashboard
        </p>

        {/* Form */}
        <form onSubmit={submit} className="space-y-6">

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-[#003366] transition">
              <FiMail className="text-gray-500 text-lg" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-gray-800"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-[#003366] transition">
              <FiLock className="text-gray-500 text-lg" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-gray-800"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#003366] text-white font-semibold rounded-xl hover:bg-[#00234d] transition shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Note */}
        <p className="mt-6 text-center text-gray-500 text-xs">
          Having trouble? Contact the admin for access.
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;