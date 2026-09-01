import UserAccountSettingsGeneratedDocumentsSection from "@/components/owner/account_settings/UserAccountSettingsGeneratedDocumentsSection";
import { motion } from "framer-motion";

export default function UserGeneratedPermitsPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2E5C82_0%,#173753_26%,#0F2942_52%,#081522_100%)]">
      <div className="relative overflow-hidden bg-transparent">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-[#1F4A6B]/70 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#285C84]/55 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[#163854]/70 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-3 pb-24 pt-5 sm:px-4 sm:pt-6 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
          >
            <UserAccountSettingsGeneratedDocumentsSection />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
