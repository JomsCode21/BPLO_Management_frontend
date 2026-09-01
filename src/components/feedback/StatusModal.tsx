import error from "@/assets/Error.lottie?url";
import success from "@/assets/Success.lottie?url";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

interface StatusModalProps {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose?: () => void;
  successAnimationSrc?: string;
  errorAnimationSrc?: string;
  autoCloseMs?: number;
  showErrorAction?: boolean;
}

export default function StatusModal({
  isOpen,
  type,
  title,
  message,
  onClose,
  successAnimationSrc,
  errorAnimationSrc,
  autoCloseMs,
  showErrorAction = true,
}: StatusModalProps) {
  const successAnimation = successAnimationSrc ?? success;
  const errorAnimation = errorAnimationSrc ?? error;

  useEffect(() => {
    if (!isOpen || !onClose || !autoCloseMs || autoCloseMs <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, autoCloseMs]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-120 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-[35px] shadow-2xl p-8 w-full max-w-sm text-center border border-gray-100"
          >
            {/* Animation Container */}
            <div className="w-32 h-32 mx-auto mb-4">
              <DotLottieReact
                src={type === "success" ? successAnimation : errorAnimation}
                loop={type === "error"} // Loop on error, play once on success
                autoplay
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <h2
              className={`text-2xl font-black mb-2 ${type === "success" ? "text-green-600" : "text-red-500"}`}
            >
              {title}
            </h2>

            <p className="text-gray-500 font-medium mb-6">{message}</p>

            {/* Close Button (Only for errors) */}
            {type === "error" && showErrorAction && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="cursor-pointer w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-colors"
              >
                Try Again
              </motion.button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
