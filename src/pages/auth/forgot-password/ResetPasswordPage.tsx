import StatusModal from "@/components/feedback/StatusModal";
import CustomInput from "@/components/input/CustomInput";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiCheck, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import resetLottie from "../../../assets/resetpass.lottie?url";
import { resetPasswordApi } from "@/api/auth/auth.api";
import { AxiosError } from "axios";

interface LocationState {
  email?: string;
  otp?: string;
}

// --- PASSWORD STRENGTH HELPER ---
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return { score: 0, label: "", bgColor: "bg-gray-200", textColor: "text-gray-500" };

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return { score: 1, label: "Weak", bgColor: "bg-red-500", textColor: "text-red-500" };
    case 2:
      return { score: 2, label: "Fair", bgColor: "bg-yellow-500", textColor: "text-yellow-500" };
    case 3:
      return { score: 3, label: "Good", bgColor: "bg-blue-500", textColor: "text-blue-500" };
    case 4:
      return { score: 4, label: "Strong", bgColor: "bg-green-500", textColor: "text-green-500" };
    default:
      return { score: 0, label: "", bgColor: "bg-gray-200", textColor: "text-gray-500" };
  }
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as LocationState)?.email || "";
  const otp = (location.state as LocationState)?.otp || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Track if the password field is currently focused
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const isPasswordValid = password.length >= 8;
  const doPasswordsMatch = isPasswordValid && password === confirmPassword;
  
  // Calculate strength dynamically
  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doPasswordsMatch || !email || !otp) return;

    setIsSubmitting(true);

    try {
      const response = await resetPasswordApi(email, otp, password);

      setStatus({
        show: true,
        type: "success",
        title: "Password Updated!",
        message:
          response.message ||
          "Your password has been successfully reset. You can now log in.",
      });

      // Redirect to login after success
      setTimeout(() => {
        navigate("/auth/login");
      }, 2500);
    } catch (error) {
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof AxiosError) {
        const responseData = error.response?.data;
        if (responseData && typeof responseData === 'object' && 'message' in responseData) {
          errorMessage = (responseData as Record<string, unknown>)['message'] as string;
        }
      }
      
      setStatus({
        show: true,
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
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
            <div className="w-48 h-48">
              <DotLottieReact src={resetLottie} loop autoplay />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              Create New Password
            </h1>
            <p className="text-gray-500 text-sm font-semibold mt-2">
              Your new password must be at least 8 characters long.
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="relative">
                <CustomInput
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••"
                  labelClass={labelStyle}
                  inputClass={inputWithBoth}
                  prefix={<FiLock className="text-gray-400" size={20} />}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()} // Keeps the focus on the input
                  className="absolute right-4 top-9.5 text-gray-400 hover:text-[#0F2942] transition-colors cursor-pointer"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>

              {/* VISUAL PASSWORD STRENGTH INDICATOR */}
              <AnimatePresence>
                {isPasswordFocused && password && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="px-1 overflow-hidden"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Strength
                      </span>
                      <span className={`text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors duration-300 ${strength.textColor}`}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1.5 h-1.5 w-full">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-all duration-500 ease-out ${
                            level <= strength.score ? strength.bgColor : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative mt-4">
                <CustomInput
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  labelClass={labelStyle}
                  inputClass={inputWithBoth}
                  prefix={<FiLock className="text-gray-400" size={20} />}
                  suffix={
                    doPasswordsMatch && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-green-600 mr-8"
                      >
                        <FiCheck size={20} strokeWidth={3} />
                      </motion.div>
                    )
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-9.5 text-gray-400 hover:text-[#0F2942] transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={doPasswordsMatch ? { scale: 1.02 } : {}}
                whileTap={doPasswordsMatch ? { scale: 0.98 } : {}}
                type="submit"
                disabled={!doPasswordsMatch || isSubmitting || status?.show}
                className="cursor-pointer w-full bg-[#F2C94C] hover:bg-[#e6bf43] text-[#0F2942] font-black py-4 rounded-2xl shadow-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Updating..." : "Reset Password"}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
