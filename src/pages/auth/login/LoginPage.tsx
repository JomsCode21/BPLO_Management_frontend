import StatusModal from "@/components/feedback/StatusModal";
import RecaptchaChallenge from "@/components/auth/RecaptchaChallenge";
import CustomInput from "@/components/input/CustomInput";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useTokenStore } from "@/stores/token/token.store";
import { getErrorMessage } from "@/utils/error/error.util";
import { requireRecaptchaToken } from "@/utils/recaptcha/recaptcha.util";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { FiCheck, FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

// Import the Google hook and your API function
import { loginWithGoogleApi } from "@/api/auth/auth.api";
import { useGoogleLogin } from "@react-oauth/google";

// Define the expected shape of your backend error
interface AuthError {
  response?: {
    data?: {
      isVerified?: boolean;
      email?: string;
      message?: string;
    };
  };
}

const REMEMBERED_EMAIL_KEY = "bplo_remembered_email";
const REMEMBER_EMAIL_KEY = "bplo_remember_email";
const LEGACY_REMEMBER_ME_KEY = "bplo_remember_me";

const clearRememberedEmail = () => {
  localStorage.removeItem(REMEMBERED_EMAIL_KEY);
  localStorage.removeItem(REMEMBER_EMAIL_KEY);
  localStorage.removeItem(LEGACY_REMEMBER_ME_KEY);
};

const saveRememberedEmail = (email: string) => {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) {
    clearRememberedEmail();
    return;
  }

  localStorage.setItem(REMEMBERED_EMAIL_KEY, normalizedEmail);
  localStorage.setItem(REMEMBER_EMAIL_KEY, "true");
  localStorage.removeItem(LEGACY_REMEMBER_ME_KEY);
};

const shouldResetRecaptchaFromMessage = (message: string) => {
  const normalizedMessage = message.toLowerCase();
  return (
    normalizedMessage.includes("recaptcha") ||
    normalizedMessage.includes("captcha") ||
    normalizedMessage.includes("security verification")
  );
};

export default function LoginPage() {
  const navigate = useNavigate();
  const setLogin = useAuthStore((s) => s.setLogin);
  const setUser = useAuthStore((s) => s.setUser);
  const loading = useAuthStore((s) => s.loading);
  const setToken = useTokenStore((s) => s.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaResetCounter, setRecaptchaResetCounter] = useState(0);

  const [status, setStatus] = useState<{
    show: boolean;
    type: "success" | "error";
    title: string;
    message: string;
    showErrorAction?: boolean;
  } | null>(null);

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    const wasRemembered =
      localStorage.getItem(REMEMBER_EMAIL_KEY) === "true" ||
      localStorage.getItem(LEGACY_REMEMBER_ME_KEY) === "true";

    if (savedEmail && wasRemembered) {
      setEmail(savedEmail);
      setRememberEmail(true);
    }
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    let shouldResetRecaptcha = false;

    try {
      const verifiedRecaptchaToken = requireRecaptchaToken(recaptchaToken);
      const accessToken = await setLogin({
        email,
        password,
        recaptchaToken: verifiedRecaptchaToken,
      });

      if (typeof accessToken === "string") {
        if (rememberEmail) {
          saveRememberedEmail(email);
        } else {
          clearRememberedEmail();
        }

        setStatus({
          show: true,
          type: "success",
          title: "Welcome Back!",
          message: "Logging you in securely...",
        });

        setTimeout(() => {
          setToken(accessToken);
          navigate("/home", { replace: true });
        }, 2000);
      } else {
        throw new Error("Login failed");
      }
    } catch (err: unknown) {
      // 2. Change 'any' to 'unknown' and safely cast it
      const error = err as AuthError;

      // Check if the error is due to unverified account
      if (
        error?.response?.data?.isVerified === false &&
        error?.response?.data?.email
      ) {
        setStatus({
          show: true,
          type: "error",
          title: "Account Not Verified",
          message:
            "Account is not verified. Redirecting to email verification page...",
          showErrorAction: false,
        });

        // Redirect to OTP verification page after 2 seconds
        setTimeout(() => {
          navigate("/auth/verify-registration", {
            state: { email: error.response?.data?.email }, // Safe access via optional chaining
          });
        }, 2000);
      } else {
        const message = getErrorMessage(
          err,
          "Security verification failed. Please try again.",
        );
        const normalizedMessage = message.toLowerCase();
        const isGoogleOnlyAccount = message
          .toLowerCase()
          .includes("google sign-in");
        const isSecurityError =
          normalizedMessage.includes("recaptcha") ||
          normalizedMessage.includes("security verification") ||
          normalizedMessage.includes("captcha");
        shouldResetRecaptcha = isSecurityError;

        setStatus({
          show: true,
          type: "error",
          title: isGoogleOnlyAccount
            ? "Use Google Sign-In"
            : isSecurityError
              ? "Security Check Failed"
              : "Access Denied",
          message: isGoogleOnlyAccount
            ? message
            : isSecurityError
              ? message
              : "The email or password you entered is incorrect.",
        });
      }
    } finally {
      if (shouldResetRecaptcha) {
        setRecaptchaToken("");
        setRecaptchaResetCounter((value) => value + 1);
      }
    }
  };

  // --- GOOGLE LOGIN LOGIC ---
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      let shouldResetRecaptcha = false;
      try {
        setStatus({
          show: true,
          type: "success",
          title: "Authenticating",
          message: "Verifying securely with Google...",
        });

        const verifiedRecaptchaToken = requireRecaptchaToken(recaptchaToken);
        const data = await loginWithGoogleApi(
          tokenResponse.access_token,
          verifiedRecaptchaToken,
        );
        const tokenToSave = data.token || data.accessToken;

        if (tokenToSave) {
          setStatus({
            show: true,
            type: "success",
            title: "Welcome Back!",
            message: "Google sign-in successful.",
          });

          setTimeout(() => {
            setToken(tokenToSave);
            if (setUser && data.user) setUser(data.user);
            navigate("/home", { replace: true });
          }, 2000);
        } else {
          throw new Error("No token returned from backend");
        }
      } catch (error) {
        shouldResetRecaptcha = shouldResetRecaptchaFromMessage(
          getErrorMessage(error, ""),
        );
        setStatus({
          show: true,
          type: "error",
          title: "Google Sign-In Unavailable",
          message: getErrorMessage(
            error,
            "Could not connect to the BPLO server. Please try again.",
          ),
        });
      } finally {
        if (shouldResetRecaptcha) {
          setRecaptchaToken("");
          setRecaptchaResetCounter((value) => value + 1);
        }
      }
    },
    onError: () => {
      setStatus({
        show: true,
        type: "error",
        title: "Sign In Cancelled",
        message: "The Google sign-in window was closed or failed.",
      });
    },
  });

  // ... Variants & Styles ...
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
        showErrorAction={status?.showErrorAction ?? true}
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
          className="relative overflow-hidden bg-white rounded-[35px] md:rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 md:p-10 border border-gray-50"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              Welcome Back!
            </h1>
            <p className="text-gray-500 text-sm font-semibold mt-1">
              Sign in to your account
            </p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
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
              <CustomInput
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••"
                labelClass={labelStyle}
                inputClass={inputWithBoth}
                prefix={<FiLock className="text-gray-400" size={20} />}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                }
              />
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="rememberEmail"
                  checked={rememberEmail}
                  onChange={(e) => {
                    setRememberEmail(e.target.checked);
                    if (!e.target.checked) {
                      clearRememberedEmail();
                    }
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-0 cursor-pointer"
                />
                <label
                  htmlFor="rememberEmail"
                  className="text-sm font-bold text-gray-600 cursor-pointer select-none"
                >
                  Remember Email
                </label>
              </div>
              <button
                type="button"
                className="cursor-pointer text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
                onClick={() => navigate("/auth/forgot-password")}
              >
                Forgot Password?
              </button>
            </motion.div>

            <motion.div variants={itemVariants}>
              <RecaptchaChallenge
                onTokenChange={setRecaptchaToken}
                resetSignal={recaptchaResetCounter}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || status?.show || !recaptchaToken}
                className="cursor-pointer w-full bg-[#F2C94C] hover:bg-[#e6bf43] disabled:bg-[#fcebb6] disabled:text-gray-400 disabled:cursor-not-allowed text-[#0F2942] font-black py-4 rounded-2xl shadow-lg transition-colors text-lg"
              >
                {loading ? "Signing In..." : "Sign In"}
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

          <motion.div variants={itemVariants} className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => loginWithGoogle()}
              type="button"
              disabled={status?.show || !recaptchaToken}
              className="google-auth-button no-login-theme cursor-pointer w-full bg-white border-2 border-gray-100 text-gray-700 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-3 hover:border-gray-200 transition-all shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="text-center mt-8">
            <p className="text-gray-500 font-medium text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/auth/register")}
                className="cursor-pointer text-blue-600 font-bold hover:underline"
              >
                Register Now
              </button>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
