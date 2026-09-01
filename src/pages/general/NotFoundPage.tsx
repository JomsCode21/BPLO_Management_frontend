import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Scoop */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: "0%" }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          duration: 0.8,
        }}
        // CHANGED: 
        // 1. Pushed bottom further down: bottom-[-30%] (mobile) / bottom-[-40%] (desktop)
        // 2. Reduced height slightly: h-[45%] (mobile) / h-[55%] (desktop)
        className="absolute bottom-[-30%] md:bottom-[-40%] left-[-10%] md:left-[-20%] w-[120%] md:w-[140%] h-[45%] md:h-[55%] bg-[#0F2942] rounded-[100%]"
        style={{ transform: "rotate(-2deg)" }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Number */}
          <h1 className="text-[120px] md:text-[150px] font-black text-[#0F2942] leading-none mb-4">
            404
          </h1>

          {/* Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-[#0F2942] mb-4">
            Page Not Found
          </h2>

          <p className="text-gray-600 text-base md:text-lg mb-8 px-4 font-medium">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white border-2 border-[#0F2942] text-[#0F2942] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <FiArrowLeft size={20} />
              Go Back
            </motion.button>

          </div>
        </motion.div>

        {/* Decorative Elements (Circles) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }} // Reduced opacity slightly so it's subtle
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-75 h-75 md:w-125 md:h-125 border-20 border-[#0F2942] rounded-full -z-10"
        />
      </div>
    </div>
  );
}