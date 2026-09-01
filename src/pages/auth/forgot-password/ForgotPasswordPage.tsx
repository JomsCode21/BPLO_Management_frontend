import { forgotPasswordApi } from "@/api/auth/auth.api";
import fg from "@/assets/forgotpassword.lottie?url";
import RecaptchaChallenge from "@/components/auth/RecaptchaChallenge";
import StatusModal from "@/components/feedback/StatusModal";
import CustomInput from "@/components/input/CustomInput";
import { requireRecaptchaToken } from "@/utils/recaptcha/recaptcha.util";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiCheck, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaResetCounter, setRecaptchaResetCounter] = useState(0);

  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) return;

    setIsSubmitting(true);

    try {
      const verifiedRecaptchaToken = requireRecaptchaToken(recaptchaToken);
      const response = await forgotPasswordApi(email, verifiedRecaptchaToken);

      // Check if account is Google authenticated
      if (response.isGoogleAuth) {
        setStatus({
          show: true,
          type: "error",
          title: "Google Account Detected",
          message:
            "This account uses Google Sign-In. Please log in with Google instead.",
        });
        return;
      }

      setStatus({
        show: true,
        type: "success",
        title: "OTP Sent!",
        message: response.message || "Check your email for the OTP code.",
      });

      // Redirect to OTP verification after 2 seconds
      setTimeout(() => {
        navigate("/auth/verify-otp", { state: { email } });
      }, 2000);
    } catch (error: unknown) {
      const errorData = (
        error as {
          response?: { data?: { isGoogleAuth?: boolean; message?: string } };
        }
      ).response?.data;

      // Check if error indicates Google authentication
      if (errorData?.isGoogleAuth) {
        setStatus({
          show: true,
          type: "error",
          title: "Google Account Detected",
          message:
            errorData.message ||
            "This account uses Google Sign-In. Google authenticated account don't reset password.",
        });
        return;
      }

      setStatus({
        show: true,
        type: "error",
        title: "Error",
        message: errorData?.message || "Failed to send OTP. Please try again.",
      });
    } finally {
      setRecaptchaToken("");
      setRecaptchaResetCounter((value) => value + 1);
      setIsSubmitting(false);
    }
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
            <DotLottieReact src={fg} loop autoplay />
          </motion.div>
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              Reset your Password
            </h1>
            <p className="text-gray-500 text-sm font-semibold mt-1">
              Enter the email you use to register
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-4">
              <CustomInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremailaddress@gmail.com"
                labelClass={labelStyle}
                inputClass={inputWithBoth}
                prefix={<FiMail className="text-gray-400" size={20} />}
                suffix={
                  emailValid && (
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
              <RecaptchaChallenge
                onTokenChange={setRecaptchaToken}
                resetSignal={recaptchaResetCounter}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={emailValid ? { scale: 1.02 } : {}}
                whileTap={emailValid ? { scale: 0.98 } : {}}
                type="submit"
                disabled={
                  !emailValid || !recaptchaToken || isSubmitting || status?.show
                }
                className="cursor-pointer w-full bg-[#F2C94C] hover:bg-[#e6bf43] text-[#0F2942] font-black py-4 rounded-2xl shadow-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="text-center mt-8">
            {status?.type === "success" && (
              <button
                type="button"
                onClick={() =>
                  navigate("/auth/verify-otp", { state: { email } })
                }
                className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                Proceed to OTP Verification
              </button>
            )}
            {status?.type === "error" &&
              status?.title === "Google Account Detected" && (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  Go to Landing Page
                </button>
              )}
          </motion.div>
          <motion.div variants={itemVariants} className="text-center mt-8">
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Back to Login
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
