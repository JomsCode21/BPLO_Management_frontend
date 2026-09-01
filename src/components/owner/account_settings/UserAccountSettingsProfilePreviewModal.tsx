import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";

type UserAccountSettingsProfilePreviewModalProps = {
  isOpen: boolean;
  imageUrl: string;
  fullName: string;
  onClose: () => void;
};

export default function UserAccountSettingsProfilePreviewModal({
  isOpen,
  imageUrl,
  fullName,
  onClose,
}: UserAccountSettingsProfilePreviewModalProps) {
  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <div className="fixed inset-0 z-120 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="relative z-10 w-full max-w-2xl rounded-4xl border border-white/10 bg-[#102A42] p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/75 text-white transition-opacity hover:opacity-90"
              aria-label="Close profile preview"
            >
              <FiX className="text-lg" />
            </button>

            <div className="overflow-hidden rounded-3xl bg-[#0A1A29]">
              <img
                src={imageUrl}
                alt={`${fullName} profile preview`}
                className="max-h-[75vh] w-full object-contain"
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
