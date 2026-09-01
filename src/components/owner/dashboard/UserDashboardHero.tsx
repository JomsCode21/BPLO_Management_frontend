import LogoutBtn from "@/components/logout/LogoutBtn";
import type { OwnerApplicationStatusType } from "@/types/owner/owner.type";
import {
  formatOwnerStatusLabel,
  getOwnerStatusContextLabel,
} from "@/utils/owner/owner-status-presenter.util";
import { FiMenu, FiSettings, FiX } from "react-icons/fi";

import {
  formatDashboardTimestamp,
  getApplicationTimestamp,
  getDashboardStatusMessage,
} from "./shared";

type UserDashboardHeroProps = {
  displayName: string;
  heroSummary: string;
  focusApplication: OwnerApplicationStatusType | null;
  isMobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onOpenWalkthrough: () => void;
  onOpenAccountSettings: () => void;
  onCloseMobileMenu: () => void;
};

export default function UserDashboardHero({
  displayName,
  heroSummary,
  focusApplication,
  isMobileMenuOpen,
  onToggleMobileMenu,
  onOpenWalkthrough,
  onOpenAccountSettings,
  onCloseMobileMenu,
}: UserDashboardHeroProps) {
  return (
    <header
      data-owner-tour="dashboard-hero"
      className="overflow-hidden rounded-b-[2.5rem] bg-[radial-gradient(circle_at_top_left,rgba(68,145,255,0.22),transparent_32%),linear-gradient(135deg,#0F2942,#173A58)] px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pb-26"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-5 flex justify-end lg:hidden">
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-label="Open account menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white transition-colors hover:bg-white/15"
            >
              {isMobileMenuOpen ? (
                <FiX className="text-lg" />
              ) : (
                <FiMenu className="text-lg" />
              )}
            </button>

            {isMobileMenuOpen && (
              <div className="absolute right-0 top-14 z-20 w-[min(18rem,calc(100vw-1rem))] rounded-3xl border border-white/10 bg-[#173654] p-3 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur">
                <button
                  type="button"
                  onClick={onOpenAccountSettings}
                  className="mb-2 inline-flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  <FiSettings className="text-base" />
                  <span>Account Settings</span>
                </button>

                <LogoutBtn
                  onLoggedOut={onCloseMobileMenu}
                  iconSize={18}
                  className="w-full rounded-2xl px-4 py-3 text-sm"
                  labelClassName="text-sm font-bold tracking-widest uppercase text-[#0F2942]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-white/85">
              <span className="h-2 w-2 rounded-full bg-[#F2C94C]" />
              Owner Workspace
            </span>

            <h1 className="mt-4 text-[2rem] font-black leading-tight text-white sm:text-[2.45rem]">
              Hi {displayName},
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/74 sm:text-base">
              {heroSummary}
            </p>

            <button
              type="button"
              onPointerDown={onOpenWalkthrough}
              onClick={onOpenWalkthrough}
              className="relative z-[130] mt-5 inline-flex cursor-pointer pointer-events-auto items-center gap-2 rounded-xl border border-white/16 bg-white/10 px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/16 sm:text-[11px]"
            >
              Replay Owner Walkthrough
            </button>
          </div>

          <div className="rounded-[1.9rem] border border-white/10 bg-white/10 p-4 shadow-[0_22px_50px_rgba(0,0,0,0.16)] backdrop-blur-md sm:p-5">
            {focusApplication ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
                      Current Focus
                    </p>
                    <h2 className="mt-2 text-xl font-black leading-tight text-white">
                      {focusApplication.permitType}
                    </h2>
                  </div>

                  <span className="inline-flex shrink-0 rounded-full border border-[#F2C94C]/16 bg-[#F2C94C]/12 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#F2C94C]">
                    {getOwnerStatusContextLabel(focusApplication.status)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/8 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      Status
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {formatOwnerStatusLabel(focusApplication.status)}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/8 px-3 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                      Last Update
                    </p>
                    <p className="mt-1 text-sm font-bold text-white">
                      {formatDashboardTimestamp(
                        getApplicationTimestamp(focusApplication),
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-[#0B2134]/34 px-3.5 py-3">
                  <p className="text-sm font-semibold leading-6 text-white/80">
                    {getDashboardStatusMessage(focusApplication.status)}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/12 bg-white/5 px-4 py-5">
                <p className="text-base font-black text-white">
                  No active permit yet
                </p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  Submit your first request and this space will immediately
                  start tracking every milestone for you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
