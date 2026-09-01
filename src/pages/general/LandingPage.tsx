import bploLogo from "@/assets/BPLOLogo.png";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useBrandingStore } from "@/stores/branding/branding.store";
import { useTokenStore } from "@/stores/token/token.store";

export default function LandingPage() {
  // Check if the user is already logged in
  const accessToken = useTokenStore((s) => s.accessToken);
  const logoUrl = useBrandingStore((s) => s.logoUrl);
  const fetchLogo = useBrandingStore((s) => s.fetchLogo);

  useEffect(() => {
    void fetchLogo();
  }, [fetchLogo]);

  const activeLogo = logoUrl || bploLogo;

  // If logged in, redirect to home immediately
  if (accessToken) {
    return <Navigate to="/home" replace />;
  }

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

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white px-4">
      {/* Decorative Blob */}
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
          {/* Logo Section */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <img
              src={activeLogo}
              alt="BPLO Logo"
              className="w-full max-w-xs h-auto object-contain"
            />
          </motion.div>

          {/* Text Content */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              Welcome to BPLO
            </h1>
            <p className="text-gray-500 text-sm font-semibold mt-2">
              Online Business Permit System
            </p>
          </motion.div>

          {/* Description */}
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              We're excited to launch our new online platform for business
              permit applications and renewals. Complete applications, upload
              documents, and make payments online—saving you time and reducing
              paperwork.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="space-y-3">
            <Link to="/auth/login" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cursor-pointer w-full bg-[#F2C94C] hover:bg-[#e6bf43] text-[#0F2942] font-black py-4 rounded-2xl shadow-lg transition-colors text-lg"
              >
                Sign In
              </motion.button>
            </Link>

            <Link to="/auth/register" className="block">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="no-login-theme cursor-pointer w-full bg-[#0F2942] hover:bg-[#143955] text-white font-black py-4 rounded-2xl shadow-[0_16px_32px_rgba(15,41,66,0.22)] transition-colors text-lg"
              >
                Create Account
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
