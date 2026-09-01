import DefaultBploLogo from "@/assets/BPLOLogo.png";
import type { ChangeEventHandler, RefObject } from "react";
import { FiImage, FiLoader, FiMonitor, FiZap } from "react-icons/fi";

type SuperAdminAccountSettingsBrandingSectionProps = {
  brandingLogoUrl: string;
  isUploadingBrandingLogo: boolean;
  brandingLogoInputRef: RefObject<HTMLInputElement | null>;
  onOpenBrandingLogoPicker: () => void;
  onBrandingLogoSelected: ChangeEventHandler<HTMLInputElement>;
};

export default function SuperAdminAccountSettingsBrandingSection({
  brandingLogoUrl,
  isUploadingBrandingLogo,
  brandingLogoInputRef,
  onOpenBrandingLogoPicker,
  onBrandingLogoSelected,
}: SuperAdminAccountSettingsBrandingSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_85px_-58px_rgba(15,41,66,0.42)] backdrop-blur-sm sm:p-6 lg:p-7 2xl:sticky 2xl:top-6">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#66D2E2]/12 blur-3xl" />

      <div className="relative space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0F2942]/10 bg-[#F4F8FC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0F2942]">
            <FiImage className="text-sm" />
            Branding Control
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-[-0.04em] text-[#10273F]">
              Keep the BPLO logo polished across every touchpoint
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
              Uploading a new logo updates the landing page, splash screen, and
              app pages as soon as the save finishes.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#0F2942_0%,#143756_55%,#1F5673_100%)] p-5 shadow-[0_28px_55px_-40px_rgba(15,41,66,0.88)]">
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#BEEBF1]">
                  Live preview
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  Current BPLO identity
                </p>
              </div>
              <div className="rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/90">
                Active
              </div>
            </div>

            <div className="mt-5 rounded-[22px] border border-dashed border-white/18 bg-white px-4 py-6">
              <img
                src={brandingLogoUrl || DefaultBploLogo}
                alt="BPLO branding logo"
                className="mx-auto h-auto max-h-28 w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
          <div className="rounded-[22px] border border-[#0F2942]/10 bg-[#F7FAFC] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0F2942] shadow-sm">
                <FiMonitor className="text-base" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                  Coverage
                </p>
                <p className="mt-1 text-sm font-semibold text-[#10273F]">
                  Landing page, splash screen, and in-app pages update together.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-[#0F2942]/10 bg-[#F7FAFC] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#0F2942] shadow-sm">
                <FiZap className="text-base" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                  Publishing
                </p>
                <p className="mt-1 text-sm font-semibold text-[#10273F]">
                  Replacement is automatic and goes live after the upload completes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenBrandingLogoPicker}
          disabled={isUploadingBrandingLogo}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#0F2942] bg-[#0F2942] px-5 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(15,41,66,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#143756] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploadingBrandingLogo ? (
            <span className="inline-flex items-center gap-2">
              <FiLoader className="animate-spin text-base" />
              Uploading...
            </span>
          ) : (
            "Upload New Logo"
          )}
        </button>

        <input
          ref={brandingLogoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onBrandingLogoSelected}
        />
      </div>
    </section>
  );
}
