import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiSettings,
  FiDatabase,
  FiUsers,
} from "react-icons/fi";
import bgImg from "../../assets/images/Loginpage/bg01.jpg";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

export default function SuperAdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/api/v1/auth/login-email", {
        email: formData.email,
        password: formData.password,
        type: "super",
      });

      console.log("LOGIN SUCCESS:", response.data);

      if (response.data?.data?.access_token) {
        localStorage.setItem("access_token", response.data.data.access_token);
        console.log(
          "Token stored successfully:",
          response.data.data.access_token
        );
      } else {
        console.error("No access token found in response");
        setError("Login failed: No access token received");
        setIsLoading(false);
        return;
      }

      if (response.data?.data) {
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message === "Network Error") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Invalid credentials. Please check your email and password.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{
        backgroundImage: `url(${bgImg})`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative w-full max-w-7xl flex items-center justify-between z-10 lg:ps-10">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hidden lg:block text-white max-w-xl space-y-6 m-auto"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-4xl xl:text-5xl font-bold leading-tight"
          >
            <span className="text-gray-100 block">Welcome to</span>
            <span
              className="block text-[#F5C857]"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                fontSize: "3.5rem",
              }}
            >
              Hotel Management
            </span>
          </motion.h1>

          <div className="h-1 w-20 bg-yellow-400 rounded-full"></div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-gray-200 leading-relaxed text-lg"
          >
            Access the complete administrative control panel for Hotel Vivanta.
            Manage all aspects of the hotel operations from a single dashboard.
          </motion.p>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
            className="bg-black/30 backdrop-blur-sm border-l-4 border-yellow-500 p-4 rounded-r-lg mt-6"
          >
            <p className="text-gray-200 text-sm">
              <span className="font-semibold text-yellow-300">
                Security Notice:
              </span>{" "}
              This portal is restricted to authorized personnel only. All
              activities are logged and monitored.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-lg bg-linear-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8"
        >
          {/* Super Admin Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-full mb-4">
              <FaUser className="text-3xl text-white" />
            </div>
            <h2
              className="text-3xl font-bold text-[#F5C857] mb-2"
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Super Admin Login
            </h2>
            <p className="text-gray-300">
              Elevated access to administrative controls
            </p>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <FiAlertCircle className="text-red-300 text-xl shrink-0" />
                  <p className="text-red-100 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <label className="text-white font-medium mb-2 flex items-center">
                <FiMail className="mr-2" />
                Email Address
              </label>
              <div className="flex items-center bg-black/40 border border-white/20 rounded-xl px-4 py-3 transition-all duration-300 hover:border-yellow-400 focus-within:border-yellow-400">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400"
                  placeholder="admin@hotelvivanta.com"
                  required
                />
              </div>
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <label className="text-white font-medium mb-2 flex items-center">
                <FiLock className="mr-2" />
                Password
              </label>
              <div className="flex items-center bg-black/40 border border-white/20 rounded-xl px-4 py-3 transition-all duration-300 hover:border-yellow-400 focus-within:border-yellow-400">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 p-1"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </motion.div>
            {/* Forgot Password */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="text-right"
            >
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm cursor-pointer  text-yellow-400 hover:text-yellow-300 transition-colors duration-200"
              >
                Forgot password?
              </button>
            </motion.div>

            {/* Login Button */}
            <motion.button
              type="submit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              disabled={isLoading}
              className={`cursor-pointer w-full py-3.5 text-lg font-semibold rounded-xl ${
                isLoading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-linear-to-r from-yellow-500 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30"
              } text-black transition-all duration-300 flex items-center justify-center space-x-2`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Super Admin Panel</span>
                  <FiArrowRight className="text-xl" />
                </>
              )}
            </motion.button>
          </form>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-400 text-sm">
              Contact system administrator for account issues
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
