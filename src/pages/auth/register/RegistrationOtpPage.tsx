import { verifyRegistrationOtpApi } from "@/api/auth/auth.api";
import otpLottie from "@/assets/otp.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";
import CustomInput from "@/components/input/CustomInput";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useTokenStore } from "@/stores/token/token.store";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
  email?: string;
}

export default function RegistrationOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState)?.email || "";
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useTokenStore((s) => s.setToken);

  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const otpValid = otp.length === 6 && /^\d+$/.test(otp);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValid || !email) return;

    setIsSubmitting(true);

    try {
      const response = await verifyRegistrationOtpApi(email, otp);

      setStatus({
        show: true,
        type: "success",
        title: "Account Verified!",
        message:
          response.message ||
          "Your account has been verified successfully. Welcome aboard!",
      });

      // Navigate to home page after showing success message
      setTimeout(() => {
        // Set user and token just before navigation to prevent premature redirect
        if (response.user) {
          setUser(response.user);
        }
        if (response.accessToken) {
          setToken(response.accessToken);
        }
        navigate("/home", { replace: true });
      }, 3000);
    } catch (error: unknown) {
      const errorMessage =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "The OTP you entered is invalid or has expired.";

      setStatus({
        show: true,
        type: "error",
        title: "Invalid OTP",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    // TODO: Implement resend OTP functionality
    setStatus({
      show: true,
      type: "success",
      title: "OTP Resent",
      message: "A new OTP has been sent to your email.",
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 120, damping: 10 },
    },
  };

  const labelStyle =
    "text-xs md:text-sm font-bold text-gray-400 mb-1.5 block uppercase tracking-wider";
  const baseInputStyle =
    "w-full py-3.5 rounded-2xl bg-[#F0F2F5] border-none text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none transition-all";
  const inputWithBoth = `${baseInputStyle} pl-12 pr-12`;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white px-4">
      <StatusModal
        isOpen={!!status?.show}
        type={status?.type || "success"}
        title={status?.title || ""}
        message={status?.message || ""}
        onClose={() => setStatus(null)}
      />

      <motion.div
        initial={{ y: "100%", scale: 1, borderRadius: "100%" }}
        animate={{ y: "0%", scale: 1, borderRadius: "100%" }}
        exit={{
          scale: 30,
          y: "-20%",
          borderRadius: "40%",
          transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          duration: 0.8,
        }}
        className="absolute bottom-[-15%] md:bottom-[-20%] left-[-10%] md:left-[-20%] w-[120%] md:w-[140%] h-[50%] md:h-[70%] bg-[#0F2942] z-0"
        style={{ transform: "rotate(-2deg)" }}
      />

      <div className="relative z-10 w-full max-w-105">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-[35px] md:rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-10 border border-gray-50"
        >
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-6"
          >
            <DotLottieReact src={otpLottie} loop autoplay />
          </motion.div>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              Verify Your Email
            </h1>
            <p className="text-gray-500 text-sm font-semibold mt-1">
              Enter the 6-digit code sent to{" "}
              <span className="font-bold">{email}</span>
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-4">
              <CustomInput
                label="OTP Code"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                labelClass={labelStyle}
                inputClass={inputWithBoth}
                maxLength={6}
                suffix={
                  otpValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-600"
                    >
                      <FiCheck size={20} strokeWidth={3} />
                    </motion.div>
                  )
                }
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={otpValid ? { scale: 1.02 } : {}}
                whileTap={otpValid ? { scale: 0.98 } : {}}
                type="submit"
                disabled={!otpValid || isSubmitting || status?.show}
                className="cursor-pointer w-full bg-[#F2C94C] hover:bg-[#e6bf43] text-[#0F2942] font-black py-4 rounded-2xl shadow-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="text-center mt-6">
            <p className="text-sm text-gray-500 mb-2">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isSubmitting}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Resend OTP
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-6">
            <button
              type="button"
              onClick={() => navigate("/auth/register")}
              className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
            >
              Back to Registration
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
