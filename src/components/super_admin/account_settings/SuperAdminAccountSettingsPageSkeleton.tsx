import Skeleton from "@/components/ui/Skeleton";

type SuperAdminAccountSettingsPageSkeletonProps = {
  showBranding?: boolean;
  tourId?: string;
};

export default function SuperAdminAccountSettingsPageSkeleton({
  showBranding = false,
  tourId,
}: SuperAdminAccountSettingsPageSkeletonProps) {
  return (
    <div className="mx-auto min-h-full w-full max-w-7xl overflow-x-clip rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f7_42%,#f8f9fb_100%)] p-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] shadow-[0_35px_90px_-48px_rgba(15,41,66,0.45)] sm:p-6 sm:pb-24 md:p-8 md:pb-10 lg:rounded-[30px]">
      <div className="space-y-8">
        <section
          className="relative overflow-hidden rounded-[30px] border border-[#0F2942]/10 bg-[#0F2942] px-5 py-6 text-white shadow-[0_28px_70px_-45px_rgba(15,41,66,0.9)] sm:px-6 sm:py-6 lg:rounded-[32px] lg:px-8 lg:py-7"
          data-super-admin-tour={tourId}
          data-evaluator-tour={tourId}
          data-inspector-tour={tourId}
          data-bplo-admin-tour={tourId}
        >
          <Skeleton className="h-7 w-52 rounded-full bg-white/20" />
          <Skeleton className="mt-5 h-11 w-full max-w-3xl bg-white/20" />
          <Skeleton className="mt-3 h-4 w-full max-w-152 bg-white/15" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-1">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`account-hero-stat-skeleton-${index}`}
                className="rounded-[24px] border border-white/12 bg-white/10 p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl bg-white/20" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24 bg-white/20" />
                    <Skeleton className="h-5 w-20 bg-white/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_85px_-58px_rgba(15,41,66,0.42)] backdrop-blur-sm sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-36 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
            <Skeleton className="h-11 w-full sm:w-40" />
          </div>

          <div className="mt-6 grid gap-5 2xl:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.82fr)]">
            <div className="space-y-5">
              <div className="rounded-[28px] bg-[linear-gradient(135deg,#0F2942_0%,#143756_48%,#1A5375_100%)] p-5 sm:p-6">
                <div className="flex flex-col items-center gap-5 md:flex-row">
                  <Skeleton className="h-24 w-24 rounded-full bg-white/25 sm:h-28 sm:w-28" />
                  <div className="w-full space-y-3">
                    <Skeleton className="h-3 w-40 bg-white/30" />
                    <Skeleton className="h-9 w-full max-w-xs bg-white/30" />
                    <Skeleton className="h-4 w-full max-w-sm bg-white/25" />
                    <div className="flex flex-wrap gap-2">
                      <Skeleton className="h-7 w-24 rounded-full bg-white/20" />
                      <Skeleton className="h-7 w-36 rounded-full bg-white/20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#0F2942]/8 bg-[#F8FAFC]/95 p-5 sm:p-6">
                <Skeleton className="h-7 w-52" />
                <Skeleton className="mt-2 h-4 w-full max-w-md" />
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton
                      key={`account-form-skeleton-${index}`}
                      className={`h-12 w-full ${index === 4 ? "md:col-span-2" : ""}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid self-start gap-4 sm:gap-5">
              <div className="rounded-[26px] border border-[#0F2942]/10 bg-[#F7FAFC] p-5 sm:p-6">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-8 w-24" />
                <Skeleton className="mt-2 h-4 w-40" />
                <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
              </div>
              <div className="rounded-[26px] border border-[#0F2942]/10 bg-white p-5 shadow-sm sm:p-6">
                <Skeleton className="h-3 w-24" />
                <div className="mt-4 space-y-3">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          className={`grid gap-6 2xl:gap-8 ${
            showBranding
              ? "2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.88fr)]"
              : ""
          }`}
        >
          <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_85px_-58px_rgba(15,41,66,0.42)] sm:p-6 lg:p-7">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="mt-2 h-4 w-full max-w-136" />
            <div className="mt-6 rounded-[28px] border border-[#0F2942]/8 bg-[#F8FAFC]/95 p-5 sm:p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="mt-3 h-11 w-full sm:w-44" />
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
              <Skeleton className="mt-5 h-11 w-full sm:w-44" />
            </div>
          </section>

          {showBranding && (
            <section className="rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_85px_-58px_rgba(15,41,66,0.42)] sm:p-6 lg:p-7">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="mt-2 h-4 w-full max-w-sm" />
              <div className="mt-5 rounded-[28px] bg-[linear-gradient(145deg,#0F2942_0%,#143756_55%,#1F5673_100%)] p-5">
                <Skeleton className="h-36 w-full rounded-2xl bg-white/20" />
              </div>
              <Skeleton className="mt-5 h-12 w-full" />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
