import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = axios.create({
  baseURL: "http://localhost:5000/api/auth", // change when deployed
});

const Auth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  region: "", // ✅ added
});

  const [otp, setOtp] = useState("");
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Restore pending signup from sessionStorage
  useEffect(() => {
    const savedData = sessionStorage.getItem("pendingSignup");
    if (savedData) {
      const { formData } = JSON.parse(savedData);
      setFormData(formData);
      setActiveTab("signup");
      setShowOtpOverlay(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🟢 Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
        const { data } = await API.post("/signup", {
          username: formData.name,
          email: formData.email,
          password: formData.password,
          region: formData.region, // ✅ sending region to backend
        });


      if (data.message?.includes("OTP")) {
        alert("OTP sent to your email!");
        setShowOtpOverlay(true);

        // ✅ Store signup data temporarily in sessionStorage
        sessionStorage.setItem(
          "pendingSignup",
          JSON.stringify({ formData, time: Date.now() })
        );
      } else {
        alert(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // 🟡 Verify OTP handler
  const handleVerifyOtp = async () => {
    if (!otp) return alert("Please enter the OTP!");

    const savedData = sessionStorage.getItem("pendingSignup");
    if (!savedData) {
      alert("Session expired. Please sign up again.");
      setShowOtpOverlay(false);
      return;
    }

    const { formData } = JSON.parse(savedData);

    setLoading(true);
    try {
      const { data } = await API.post("/verify-otp", {
        email: formData.email,
        otp,
        username: formData.name,
        password: formData.password,
      });

      if (data.token) {
        alert("Email verified successfully!");
        sessionStorage.removeItem("pendingSignup");

        // ✅ Store session token (session-only)
        sessionStorage.setItem("sessionToken", data.token);

        setShowOtpOverlay(false);
        setActiveTab("login");
        navigate("/");
      } else {
        alert(data.message || "OTP verification failed.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔵 Login handler
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data } = await API.post("/login", {
        email: formData.email,
        password: formData.password,
      });

      if (data.token) {
        // ✅ Store session token instead of localStorage
        sessionStorage.setItem("sessionToken", data.token);
        sessionStorage.setItem("username", data.user.username);
        sessionStorage.setItem("region", data.user.region);
        sessionStorage.setItem("userId", data.user.id);

        alert("Login successful!");
        navigate("/");
      } else {
        alert(data.message || "Login failed.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 🌐 Handle form submit
  const handleAuth = (e) => {
    e.preventDefault();
    activeTab === "login" ? handleLogin(e) : handleSignup(e);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
      <div className="w-full max-w-md p-6 text-white border shadow-2xl bg-white/10 backdrop-blur-md rounded-2xl border-white/20">
        {/* Tabs */}
        <div className="flex justify-around mb-6">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 py-2 font-semibold rounded-l-2xl transition ${
              activeTab === "login"
                ? "bg-white/30 text-white"
                : "bg-transparent text-white/70 hover:bg-white/20"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`w-1/2 py-2 font-semibold rounded-r-2xl transition ${
              activeTab === "signup"
                ? "bg-white/30 text-white"
                : "bg-transparent text-white/70 hover:bg-white/20"
            }`}
          >
            Signup
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {activeTab === "signup" && (
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
            required
          />
{activeTab === "signup" && (
  <>
    <input
      type="password"
      name="confirmPassword"
      placeholder="Confirm Password"
      value={formData.confirmPassword}
      onChange={handleInputChange}
      className="px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400"
      required
    />

    {/* ✅ Region Dropdown */}
    <select
      name="region"
      value={formData.region}
      onChange={handleInputChange}
      className="px-4 py-2 text-white border rounded-lg bg-white/10 border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
      required
    >
      <option value="" disabled className="text-gray-700">Select Region</option>
      <option value="North America" className="text-gray-700">North America</option>
      <option value="South America" className="text-gray-700">South America</option>
      <option value="Europe" className="text-gray-700">Europe</option>
      <option value="Asia" className="text-gray-700">Asia</option>
      <option value="Middle East" className="text-gray-700">Middle East</option>
      <option value="Africa" className="text-gray-700">Africa</option>
      <option value="Australia" className="text-gray-700">Australia</option>
    </select>
  </>
)}


          <button
            type="submit"
            className="w-full py-2 mt-2 font-semibold transition rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : activeTab === "login"
              ? "Login"
              : "Create Account"}
          </button>
        </form>
      </div>

      {/* OTP Overlay */}
      {showOtpOverlay && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white rounded-lg shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Verify Your Email
            </h2>
            <p className="mb-3 text-sm text-gray-600">
              Enter the OTP sent to <b>{formData.email}</b>
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 mb-4 text-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex gap-3">
              <button
                onClick={handleVerifyOtp}
                className="w-full py-2 font-semibold text-white transition bg-indigo-600 rounded-lg hover:bg-indigo-700"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={() => {
                  setShowOtpOverlay(false);
                  sessionStorage.removeItem("pendingSignup");
                }}
                className="w-full py-2 font-semibold text-gray-700 transition bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;
