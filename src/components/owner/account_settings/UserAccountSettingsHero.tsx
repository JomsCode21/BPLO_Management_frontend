import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

import type { ProfileChecklistItem } from "./shared";

type UserAccountSettingsHeroProps = {
  fullName: string;
  email: string;
  shouldShowProfileReadiness: boolean;
  readinessPercent: number;
  completedChecklistCount: number;
  profileChecklist: ProfileChecklistItem[];
};

export default function UserAccountSettingsHero({
  fullName,
  email,
  shouldShowProfileReadiness,
  readinessPercent,
  completedChecklistCount,
  profileChecklist,
}: UserAccountSettingsHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`mt-7 grid gap-4 ${
        shouldShowProfileReadiness
          ? "lg:grid-cols-[minmax(0,1.3fr),minmax(260px,0.7fr)]"
          : ""
      }`}
    >
      <div className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C94C]">
          Business Owner
        </p>
        <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl lg:text-[2.7rem]">
          Manage your account with confidence.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/78 sm:text-base">
          Keep your contact details current, update your profile photo, and
          secure access to your owner dashboard.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-[#14314B] px-4 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
              Account Name
            </p>
            <p className="mt-2 text-lg font-bold text-white">{fullName}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#14314B] px-4 py-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/50">
              Primary Email
            </p>
            <p className="mt-2 break-all text-sm font-medium text-white/88 sm:text-base">
              {email || "Add your email address"}
            </p>
          </div>
        </div>
      </div>

      {shouldShowProfileReadiness && (
        <div className="overflow-hidden rounded-4xl border border-white/10 bg-[#14314B] text-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-white/50">
                  Profile Readiness
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-5xl font-black text-[#F2C94C]">
                    {readinessPercent}%
                  </span>
                  <div className="pb-1">
                    <p className="text-sm font-semibold text-white">
                      {completedChecklistCount} of {profileChecklist.length} done
                    </p>
                    <p className="text-xs text-white/60">
                      A complete profile helps BPLO reach you faster.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#F2C94C]">
                <FiCheckCircle className="text-xl" />
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#F2C94C] transition-all duration-500"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            <div className="space-y-3">
              {profileChecklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-sm font-medium text-white/86">
                    {item.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${
                      item.complete
                        ? "bg-emerald-400/18 text-emerald-300"
                        : "bg-white/10 text-white/50"
                    }`}
                  >
                    <FiCheckCircle className="text-sm" />
                    {item.complete ? "Done" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-relaxed text-white/72">
              Complete the remaining profile items so notices, inspections, and
              permit updates reach you without delay.
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
