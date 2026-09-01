import { loginWithGoogleApi } from "@/api/auth/auth.api";
import RecaptchaChallenge from "@/components/auth/RecaptchaChallenge";
import StatusModal from "@/components/feedback/StatusModal";
import CustomInput from "@/components/input/CustomInput";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useTokenStore } from "@/stores/token/token.store";
import { getErrorMessage } from "@/utils/error/error.util";
import { requireRecaptchaToken } from "@/utils/recaptcha/recaptcha.util";
import { useGoogleLogin } from "@react-oauth/google";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  FiCheck,
  FiChevronDown,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiTag,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

// --- PASSWORD STRENGTH HELPER ---
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (!password)
    return {
      score: 0,
      label: "",
      bgColor: "bg-gray-200",
      textColor: "text-gray-500",
    };

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return {
        score: 1,
        label: "Weak",
        bgColor: "bg-red-500",
        textColor: "text-red-500",
      };
    case 2:
      return {
        score: 2,
        label: "Fair",
        bgColor: "bg-yellow-500",
        textColor: "text-yellow-500",
      };
    case 3:
      return {
        score: 3,
        label: "Good",
        bgColor: "bg-blue-500",
        textColor: "text-blue-500",
      };
    case 4:
      return {
        score: 4,
        label: "Strong",
        bgColor: "bg-green-500",
        textColor: "text-green-500",
      };
    default:
      return {
        score: 0,
        label: "",
        bgColor: "bg-gray-200",
        textColor: "text-gray-500",
      };
  }
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const setRegister = useAuthStore((s) => s.setRegister);
  const setUser = useAuthStore((s) => s.setUser);
  const loading = useAuthStore((s) => s.loading);
  const setToken = useTokenStore((s) => s.setToken);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaResetCounter, setRecaptchaResetCounter] = useState(0);

  // NEW: Track if the password field is currently focused
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Status Modal State
  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  // Calculate strength dynamically
  const strength = getPasswordStrength(formData.password);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.gender ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !agreed
    ) {
      setStatus({
        show: true,
        type: "error",
        title: "Missing Information",
        message: "Please fill in all required fields and agree to the terms.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatus({
        show: true,
        type: "error",
        title: "Password Mismatch",
        message: "Your passwords do not match. Please try again.",
      });
      return;
    }

    try {
      const verifiedRecaptchaToken = requireRecaptchaToken(recaptchaToken);
      const response = await setRegister({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        suffix: formData.suffix,
        gender: formData.gender,
        email: formData.email,
        password: formData.password,
        recaptchaToken: verifiedRecaptchaToken,
      });

      // Check if registration was successful
      if (response && typeof response === "object" && response.success) {
        setStatus({
          show: true,
          type: "success",
          title: "Registration Successful!",
          message: "Please check your email for the verification code.",
        });

        // Navigate to OTP verification page with email
        setTimeout(() => {
          navigate("/auth/verify-registration", {
            state: { email: formData.email },
            replace: true,
          });
        }, 2000);
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      setStatus({
        show: true,
        type: "error",
        title: "Registration Failed",
        message: getErrorMessage(
          error,
          "Something went wrong. Please check your details and try again.",
        ),
      });
    } finally {
      setRecaptchaToken("");
      setRecaptchaResetCounter((value) => value + 1);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const verifiedRecaptchaToken = requireRecaptchaToken(recaptchaToken);
        const data = await loginWithGoogleApi(
          tokenResponse.access_token,
          verifiedRecaptchaToken,
        );
        if (setToken) setToken(data.token || data.accessToken);
        if (setUser) setUser(data.user);

        setStatus({
          show: true,
          type: "success",
          title: "Account Created!",
          message: "Welcome aboard! Redirecting you to home...",
        });

        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 2000);
      } catch (error) {
        console.error("Backend authentication failed:", error);
        setStatus({
          show: true,
          type: "error",
          title: "Google Sign-In Unavailable",
          message: getErrorMessage(
            error,
            "Failed to authenticate with Google. Please try again.",
          ),
        });
      } finally {
        setRecaptchaToken("");
        setRecaptchaResetCounter((value) => value + 1);
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      setStatus({
        show: true,
        type: "error",
        title: "Google Sign In Failed",
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const handleGoogleRegister = () => {
    loginWithGoogle();
  };

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.gender &&
    emailValid &&
    formData.password &&
    passwordsMatch &&
    agreed &&
    Boolean(recaptchaToken);

  // --- ANIMATION VARIANTS ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 120, damping: 10 },
    },
  };

  // Styles
  const labelStyle =
    "text-xs md:text-sm font-bold text-gray-400 mb-1.5 block uppercase tracking-wider";
  const baseInputStyle =
    "w-full py-3.5 rounded-2xl bg-[#F0F2F5] border-none text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 outline-none transition-all";
  const inputWithPrefix = `${baseInputStyle} pl-12 pr-5`;
  const inputWithBoth = `${baseInputStyle} pl-12 pr-12`;

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white px-4">
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

      <div className="relative z-10 w-full max-w-xl flex items-center justify-center h-full py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative overflow-hidden bg-white rounded-[35px] md:rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 w-full max-h-[90vh] flex flex-col py-6 md:py-10 pl-6 md:pl-10 pr-2"
        >
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              Create Account
            </h1>
            <p className="text-gray-500 text-sm font-semibold mt-1">
              Join us and start your journey
            </p>
          </motion.div>
          <div className="h-full w-full overflow-y-auto custom-scrollbar pr-4 md:pr-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants}>
                  <CustomInput
                    label="First Name"
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    labelClass={labelStyle}
                    inputClass={inputWithPrefix}
                    prefix={<FiUser className="text-gray-400" size={20} />}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CustomInput
                    label="Middle Name"
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    placeholder="Middle name(Optional)"
                    labelClass={labelStyle}
                    inputClass={inputWithPrefix}
                    prefix={<FiUser className="text-gray-400" size={20} />}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CustomInput
                    label="Last Name"
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    labelClass={labelStyle}
                    inputClass={inputWithPrefix}
                    prefix={<FiUser className="text-gray-400" size={20} />}
                  />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <CustomInput
                    label="Suffix"
                    type="text"
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    placeholder="Jr. (Optional)"
                    labelClass={labelStyle}
                    inputClass={inputWithPrefix}
                    prefix={<FiTag className="text-gray-400" size={20} />}
                  />
                </motion.div>
              </div>

              <motion.div variants={itemVariants}>
                <label className={labelStyle}>Gender</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                    <FiUsers size={20} />
                  </div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className={`${baseInputStyle} pl-12 pr-10 appearance-none cursor-pointer`}
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Prefer not to say</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <FiChevronDown size={20} />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <CustomInput
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="youremail@gmail.com"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="flex flex-col">
                  <CustomInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    placeholder="••••••••"
                    labelClass={labelStyle}
                    inputClass={inputWithBoth}
                    prefix={<FiLock className="text-gray-400" size={20} />}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        onMouseDown={(e) => e.preventDefault()} // Prevents the input from losing focus when clicking the eye icon
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    }
                  />

                  {/* VISUAL PASSWORD STRENGTH INDICATOR */}
                  <AnimatePresence>
                    {isPasswordFocused && formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 px-1 overflow-hidden"
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Strength
                          </span>
                          <span
                            className={`text-[10px] md:text-xs font-black uppercase tracking-wider transition-colors duration-300 ${strength.textColor}`}
                          >
                            {strength.label}
                          </span>
                        </div>
                        <div className="flex gap-1.5 h-1.5 w-full">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-full flex-1 rounded-full transition-all duration-500 ease-out ${
                                level <= strength.score
                                  ? strength.bgColor
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col">
                  <CustomInput
                    label="Confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    labelClass={labelStyle}
                    inputClass={inputWithBoth}
                    prefix={<FiLock className="text-gray-400" size={20} />}
                    suffix={
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    }
                  />
                  {/* PASSWORD MISMATCH ERROR */}
                  {formData.confirmPassword && !passwordsMatch && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-[10px] md:text-xs text-red-500 font-bold mt-2 ml-1 uppercase tracking-wider"
                    >
                      Passwords do not match
                    </motion.p>
                  )}
                </motion.div>
              </div>

              <motion.div
                variants={itemVariants}
                className="flex items-start pt-2"
              >
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-0 cursor-pointer"
                  />
                </div>
                <label
                  htmlFor="terms"
                  className="ml-3 text-sm font-medium text-gray-500"
                >
                  I Agree to the{" "}
                  <Link
                    to="/terms-and-conditions"
                    className="text-blue-500 font-bold hover:underline"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy-policy"
                    className="text-blue-500 font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <RecaptchaChallenge
                  onTokenChange={setRecaptchaToken}
                  resetSignal={recaptchaResetCounter}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  whileHover={isFormValid ? { scale: 1.02 } : {}}
                  whileTap={isFormValid ? { scale: 0.98 } : {}}
                  type="submit"
                  disabled={!isFormValid || loading || status?.show}
                  className="cursor-pointer w-full bg-[#F2C94C] hover:bg-[#e6bf43] disabled:bg-[#fcebb6] disabled:text-gray-400 disabled:cursor-not-allowed text-[#0F2942] font-black py-4 rounded-2xl shadow-lg transition-colors text-lg"
                >
                  {loading ? "Creating Account..." : "Register"}
                </motion.button>
              </motion.div>
            </form>

            <motion.div
              variants={itemVariants}
              className="relative py-6 flex items-center"
            >
              <div className="grow border-t border-gray-200"></div>
              <span className="shrink-0 mx-4 text-gray-400 text-sm font-bold">
                OR
              </span>
              <div className="grow border-t border-gray-200"></div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleRegister}
                disabled={googleLoading || status?.show || !recaptchaToken}
                type="button"
                className="google-auth-button no-login-theme cursor-pointer w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:border-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle size={24} />
                <span>
                  {googleLoading ? "Signing in..." : "Continue with Google"}
                </span>
              </motion.button>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center mt-8 pb-2"
            >
              <p className="text-gray-500 font-medium text-sm">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/auth/login")}
                  className="cursor-pointer text-blue-600 font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
