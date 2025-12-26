import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiArrowLeft, FiAlertCircle, FiCheck } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import bgImg from "../../assets/images/Loginpage/bg01.jpg";
import axiosInstance from "../../api/axiosInstance";

export default function Forgotpass() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpId, setOtpId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      toast.loading("Sending OTP...", { toastId: "otp-loading" });

      const response = await axiosInstance.post(
        "/api/v1/auth/forgot-password",
        { email }
      );

      setOtpId(response.data.otp_id);

      toast.update("otp-loading", {
        render: response.data.message || "OTP sent successfully to your email!",
        type: "success",
        isLoading: false,
        autoClose: 2000, // Short delay before navigation
      });

      // Navigate to VerifyOTP with required data
      navigate("/verify-otp", {
        state: {
          otpId: response.data.otp_id,
          email,
        },
      });
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.update("otp-loading", {
        render:
          err.response?.data?.message ||
          err.message ||
          "Unable to process request. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat px-4 relative"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
        style={{
          fontSize: "14px",
          backdropFilter: "blur(10px)",
        }}
        toastStyle={{
          background: "rgba(0, 0, 0, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg bg-linear-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-yellow-500 to-yellow-600 rounded-full mb-4">
            <FaUser className="text-3xl text-white" />
          </div>

          <h2
            className="text-3xl font-bold text-[#F5C857]"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontWeight: 700,
            }}
          >
            Forgot Password
          </h2>

          <p className="text-gray-300 mt-2">
            Enter your registered email to receive OTP
          </p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 bg-red-900/40 border border-red-500/50 rounded-xl flex items-center gap-3"
            >
              <FiAlertCircle className="text-red-300 text-xl" />
              <p className="text-red-100 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="text-white font-medium mb-2 flex items-center">
              <FiMail className="mr-2" />
              Email Address
            </label>
            <div className="flex items-center bg-black/40 border border-white/20 rounded-xl px-4 py-3 focus-within:border-yellow-400">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className={`w-full py-3.5 text-lg font-semibold rounded-xl transition-all ${
              loading
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-linear-to-r from-yellow-500 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30"
            } text-black`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </motion.button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
            disabled={loading}
          >
            <FiArrowLeft />
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
}
