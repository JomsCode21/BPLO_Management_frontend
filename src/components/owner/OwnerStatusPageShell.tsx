import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

type OwnerStatusPageShellProps = {
  title: string;
  backPath: string;
  children: ReactNode;
  wideDesktop?: boolean;
  tourId?: string;
};

export default function OwnerStatusPageShell({
  title,
  backPath,
  children,
  wideDesktop = false,
  tourId,
}: OwnerStatusPageShellProps) {
  const navigate = useNavigate();
  const contentWidthClass = wideDesktop
    ? "max-w-[1600px] xl:max-w-[1840px]"
    : "max-w-[1600px]";

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header
        data-owner-tour={tourId}
        className="sticky top-0 z-40 w-full rounded-b-4xl bg-[#0F2942] px-3 py-4 shadow-[0_10px_30px_rgba(15,41,66,0.18)] sm:px-4 sm:py-5 md:rounded-b-[40px] md:px-4 md:py-7 md:shadow-none lg:px-6 lg:py-8"
      >
        <div
          className={`mx-auto w-full ${contentWidthClass} pt-[env(safe-area-inset-top)]`}
        >
          <button
            type="button"
            onClick={() => navigate(backPath)}
            className="inline-flex max-w-full items-center gap-3 text-white cursor-pointer"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 sm:h-11 sm:w-11">
              <FiArrowLeft className="text-base sm:text-lg" />
            </span>
            <h1 className="min-w-0 truncate text-lg font-black uppercase tracking-wide sm:text-2xl">
              {title}
            </h1>
          </button>
        </div>
      </header>

      <main
        className={`mx-auto w-full ${contentWidthClass} px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-7`}
      >
        {children}
      </main>
    </div>
  );
}
