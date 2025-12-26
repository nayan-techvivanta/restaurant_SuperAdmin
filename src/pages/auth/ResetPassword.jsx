import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLock,
  FiCheck,
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import bgImg from "../../assets/images/Loginpage/bg01.jpg";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reset_token, email } = location.state || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    if (!reset_token || !email) {
      setError("Invalid reset session. Please verify OTP again.");
      setTimeout(() => navigate("/forgot-password"), 2000);
    }
  }, [reset_token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/api/v1/auth/reset-password", {
        reset_token,
        new_password: newPassword,
      });

      toast.success(response.data.message || "Password reset successfully!");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Password reset failed";
      setError(errorMsg);
      toast.error(errorMsg);
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
        {/* Header - SAME as VerifyOTP */}
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
            Reset Password
          </h2>

          <p className="text-gray-300 mt-2">
            Set new password for{" "}
            <span className="font-semibold">{email || "your account"}</span>
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
          {/* New Password */}
          <div>
            <label className="text-white font-medium mb-2 flex items-center">
              <FiLock className="mr-2" />
              New Password
            </label>
            <div className="relative flex items-center bg-black/40 border border-white/20 rounded-xl px-4 py-3 focus-within:border-yellow-400">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 pr-10"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-white font-medium mb-2 flex items-center">
              <FiLock className="mr-2" />
              Confirm Password
            </label>
            <div className="relative flex items-center bg-black/40 border border-white/20 rounded-xl px-4 py-3 focus-within:border-yellow-400">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-transparent w-full outline-none px-3 py-1 text-white placeholder-gray-400 pr-10"
                disabled={loading}
                required
              />
              <button
                type="button"
                className="absolute right-3 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={
              loading ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
            }
            whileHover={loading ? {} : { scale: 1.02 }}
            whileTap={loading ? {} : { scale: 0.98 }}
            className={`cursor-pointer w-full py-3.5 text-lg font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 ${
              loading ||
              newPassword.length < 6 ||
              newPassword !== confirmPassword
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-linear-to-r from-yellow-500 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30"
            } text-black`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Resetting...</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <FiCheck className="text-lg" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <motion.button
            onClick={() => navigate("/verify-otp")}
            className="cursor-pointer inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
            disabled={loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft />
            Back to Verify OTP
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
