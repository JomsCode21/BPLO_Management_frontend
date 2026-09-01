import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

type SuperAdminAccountSettingsProfilePreviewModalProps = {
  isOpen: boolean;
  imageUrl: string;
  fullName: string;
  onClose: () => void;
};

export default function SuperAdminAccountSettingsProfilePreviewModal({
  isOpen,
  imageUrl,
  fullName,
  onClose,
}: SuperAdminAccountSettingsProfilePreviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <div className="fixed inset-0 z-120 flex items-center justify-center px-4 py-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative z-10 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/20 bg-white p-3 shadow-2xl sm:p-4"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:opacity-90 sm:right-4 sm:top-4 sm:h-10 sm:w-10"
              aria-label="Close profile preview"
            >
              <FiX className="text-lg" />
            </button>

            <div className="overflow-hidden rounded-2xl bg-slate-100">
              <img
                src={imageUrl}
                alt={`${fullName} profile preview`}
                className="max-h-[calc(100vh-7rem)] w-full object-contain sm:max-h-[75vh]"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
