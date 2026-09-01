import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface Props {
  label: string;
  value: string | number;
  note: string;
  icon: ReactNode;
  accentColor: string;
  surfaceClass?: string;
  iconClass?: string;
}

export default function EvaluatorStatcard({
  label,
  value,
  note,
  icon,
  accentColor,
  surfaceClass = "bg-white",
  iconClass = "bg-white text-[#0F2942]",
}: Props) {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className={`relative overflow-hidden rounded-[24px] border border-[#DCE7F3] p-4 shadow-sm sm:rounded-[28px] sm:p-6 ${surfaceClass}`}
    >
      <div className={`absolute inset-x-0 top-0 h-1.5 ${accentColor}`} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5E6D7E]">
            {label}
          </span>
          <p className="mt-3 text-2xl font-black text-[#0F2942] sm:mt-4 sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 max-w-none text-sm font-medium leading-6 text-[#5E6D7E] sm:mt-3 sm:max-w-[18rem]">
            {note}
          </p>
        </div>

        <div
          className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/70 text-lg shadow-sm sm:h-14 sm:w-14 sm:text-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </motion.article>
  );
}
