import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMail,
  FiCheck,
  FiArrowLeft,
  FiClock,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import bgImg from "../../assets/images/Loginpage/bg01.jpg";

const OTPInput = ({ code, setCode }) => {
  const inputs = Array(6).fill(0);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 1);
    const newCode = code.split("");
    newCode[index] = value;
    setCode(newCode.join(""));

    if (value && index < 5) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center w-full px-2">
      {inputs.map((_, index) => (
        <motion.input
          key={index}
          id={`otp-input-${index}`}
          type="text"
          maxLength={1}
          value={code[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl font-bold text-center bg-black/40 border-2 border-white/30 rounded-lg sm:rounded-xl focus:border-yellow-400 focus:outline-none text-white transition-all duration-300 hover:border-white/50 backdrop-blur-sm flex-1 min-w-0"
          style={{ letterSpacing: "0" }}
          whileFocus={{
            scale: 1.05,
            boxShadow: "0 0 0 3px rgba(245, 200, 87, 0.3)",
          }}
          autoComplete="off"
        />
      ))}
    </div>
  );
};

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { otpId: passedOtpId, email } = location.state || {};

  const [code, setCode] = useState("");
  const [otpId, setOtpId] = useState(passedOtpId);
  const [counter, setCounter] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (passedOtpId) {
      toast.success("OTP sent! Enter the 6-digit code from your email.");
    }
  }, [passedOtpId]);

  useEffect(() => {
    if (counter === 0) return;
    const timer = setInterval(() => {
      setCounter((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [counter]);

  const resendOtp = async () => {
    if (counter > 0 || isLoading) return;

    setIsLoading(true);
    setError("");
    try {
      toast.loading("Resending OTP...", { toastId: "resend-loading" });

      const response = await axiosInstance.post(
        "/api/v1/auth/forgot-password",
        {
          email: email || "",
        }
      );

      setOtpId(response.data.otp_id);
      toast.update("resend-loading", {
        render: response.data.message || "OTP resent successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      setCounter(60);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
      toast.error("Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter complete 6-digit code");
      return;
    }

    if (!otpId) {
      setError("OTP session expired. Please request new OTP.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await axiosInstance.post(
        "/api/v1/auth/verify-auth-otp",
        {
          otp_id: otpId,
          otp: code,
        }
      );

      const { message, reset_token } = response.data;

      toast.success(message || "OTP verified successfully!");

      // ✅ Navigate to Reset Password with reset_token
      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            reset_token, // Pass reset_token for reset API
            email, // Pass email for display
          },
        });
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
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
        {/* Header - SAME as Forgot Password */}
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
            Verify OTP
          </h2>

          <p className="text-gray-300 mt-2">
            Enter 6-digit code sent to {email || "your email"}
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
          {/* OTP Input */}
          <div>
            <label className="text-white font-medium mb-2 flex items-center justify-center">
              <FiCheckCircle className="mr-2" />
              Verification Code
            </label>
            <div className="flex items-center bg-black/40 border border-white/20 rounded-xl px-4 py-3 focus-within:border-yellow-400">
              <OTPInput code={code} setCode={setCode} />
            </div>
          </div>

          {/* Resend OTP */}
          <div className="text-center">
            {counter > 0 ? (
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <FiClock className="text-yellow-400" />
                Resend in {counter}s
              </p>
            ) : (
              <motion.button
                type="button"
                onClick={resendOtp}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-yellow-400 cursor-pointer hover:text-yellow-300 text-sm font-semibold flex items-center gap-1 mx-auto"
              >
                {isLoading ? (
                  <FiRefreshCw className="animate-spin" />
                ) : (
                  "Resend OTP"
                )}
              </motion.button>
            )}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isVerifying || code.length !== 6 || isLoading}
            whileHover={{ scale: isVerifying || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isVerifying || isLoading ? 1 : 0.98 }}
            className={`cursor-pointer w-full py-3.5 text-lg font-semibold rounded-xl transition-all ${
              isVerifying || isLoading || code.length !== 6
                ? "bg-gray-700 cursor-not-allowed"
                : "bg-linear-to-r from-yellow-500 to-yellow-600 hover:shadow-lg hover:shadow-yellow-500/30"
            } text-black flex items-center justify-center space-x-2`}
          >
            {isVerifying ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify OTP</span>
                <FiCheck className="text-lg" />
              </>
            )}
          </motion.button>
        </form>

        {/* Back to Forgot Password */}
        <div className="mt-6 text-center">
          <motion.button
            onClick={() => navigate("/forgot-password")}
            className="inline-flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
            disabled={isVerifying || isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiArrowLeft />
            Back to Forgot Password
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
