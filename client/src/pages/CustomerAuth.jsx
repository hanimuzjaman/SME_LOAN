import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CustomerAuth = () => {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Enter email and password");
    if (password !== confirm) return alert("Passwords do not match");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/register", {
        email,
        password,
      });

      if (res.data?.success) {
        localStorage.removeItem("jwt");
        sessionStorage.setItem("justRegistered", "true");
        navigate("/check-client");
      } else {
        alert(res.data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("register error:", err);
      alert(err?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Enter email and password");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });

      if (res.data?.success) {
        if (res.data.token) localStorage.setItem("jwt", res.data.token);

        if (res.data?.applicantId || res.data?.Applicant_ID) {
          const id = res.data.applicantId || res.data.Applicant_ID;
          navigate("/dashboard", { state: { Applicant_ID: id } });
        } else {
          navigate("/check-client");
        }
      } else {
        alert(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("login error:", err);
      alert(err?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg border border-gray-200 mt-10">
      {/* Toggle Buttons */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 rounded-lg transition ${
            mode === "login"
              ? "bg-[#003366] text-white shadow"
              : "text-gray-700"
          }`}
        >
          Login
        </button>

        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-2 rounded-lg transition ${
            mode === "register"
              ? "bg-[#003366] text-white shadow"
              : "text-gray-700"
          }`}
        >
          Register
        </button>
      </div>

      {/* LOGIN FORM */}
      {mode === "login" ? (
        <form onSubmit={login} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#003366] focus:outline-none transition text-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#003366] focus:outline-none transition text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-lg transition shadow-md font-medium disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      ) : (
        /* REGISTER FORM */
        <form onSubmit={register} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#003366] focus:outline-none transition text-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="username@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#003366] focus:outline-none transition text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create password"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#003366] focus:outline-none transition text-gray-800"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-lg transition shadow-md font-medium disabled:opacity-60"
          >
            {loading ? "Creating..." : "Register & Continue"}
          </button>
        </form>
      )}

      
    </div>
  );
};

export default CustomerAuth;