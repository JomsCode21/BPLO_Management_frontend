import { motion } from "framer-motion";
import { FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

type LegalDocumentSection = {
  title: string;
  content: string[];
};

type LegalDocumentPageProps = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: LegalDocumentSection[];
};

export default function LegalDocumentPage({
  title,
  subtitle,
  lastUpdated,
  sections,
}: LegalDocumentPageProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-white px-4 py-8">
      <motion.div
        initial={{ y: "100%", scale: 1, borderRadius: "100%" }}
        animate={{ y: "0%", scale: 1, borderRadius: "100%" }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
          duration: 0.8,
        }}
        className="absolute bottom-[-15%] md:bottom-[-20%] left-[-10%] md:left-[-20%] w-[120%] md:w-[140%] h-[50%] md:h-[70%] bg-[#0F2942] z-0"
        style={{ transform: "rotate(-2deg)" }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-[35px] md:rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 p-6 md:p-10"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 text-[#0F2942] font-bold text-sm hover:opacity-80 transition-opacity"
            >
              <FiArrowLeft size={18} />
              Back to Register
            </Link>
            <p className="text-xs md:text-sm text-gray-500 font-semibold">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl md:text-[32px] font-black text-[#0F2942] leading-tight">
              {title}
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-semibold mt-2">
              {subtitle}
            </p>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
            {sections.map((section) => (
              <section key={section.title} className="space-y-2">
                <h2 className="text-lg md:text-xl font-black text-[#0F2942]">
                  {section.title}
                </h2>
                <div className="space-y-2">
                  {section.content.map((paragraph, index) => (
                    <p
                      key={`${section.title}-${index}`}
                      className="text-sm md:text-base text-gray-700 leading-relaxed"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
