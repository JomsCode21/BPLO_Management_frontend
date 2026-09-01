import Skeleton from "@/components/ui/Skeleton";

export function OwnerStatusListContentSkeleton() {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`owner-status-list-mobile-${index}`}
            className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <Skeleton className="h-6 w-44 max-w-full" />
            <Skeleton className="mt-3 h-4 w-24" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
            <Skeleton className="mt-4 h-4 w-36" />
            <Skeleton className="mt-4 h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:block">
        <div className="bg-[#0F2942] px-5 py-4">
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`owner-status-list-header-${index}`}
                className="h-3 w-full bg-white/20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 7 }).map((_, rowIndex) => (
            <div
              key={`owner-status-list-row-${rowIndex}`}
              className="grid grid-cols-6 gap-3"
            >
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-9 w-24 justify-self-end rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function OwnerApplicationStatusDetailContentSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-[#0F2942]/10 bg-[#F4F8FC] px-6 py-8 shadow-sm">
        <div className="flex items-start gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl bg-[#D9E6F2]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-56 max-w-full bg-[#D9E6F2]" />
            <Skeleton className="h-4 w-40 max-w-full bg-[#D9E6F2]" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-10/12" />
        <Skeleton className="mt-8 h-10 w-64 max-w-full rounded-xl" />
      </div>

      <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 sm:p-8">
        <Skeleton className="h-4 w-24 bg-amber-200/70" />
        <Skeleton className="mt-4 h-4 w-full bg-amber-200/70" />
        <Skeleton className="mt-2 h-4 w-4/5 bg-amber-200/70" />
      </div>
    </div>
  );
}

export function OwnerPaymentStatusDetailContentSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-[#0F2942]/10 bg-[#F4F8FC] px-6 py-8 shadow-sm">
        <div className="flex items-start gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl bg-[#D9E6F2]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-56 max-w-full bg-[#D9E6F2]" />
            <Skeleton className="h-4 w-40 max-w-full bg-[#D9E6F2]" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-4/5" />
        <Skeleton className="mt-8 h-10 w-64 max-w-full rounded-xl" />
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
        <Skeleton className="h-6 w-36" />

        <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <Skeleton className="h-4 w-40 bg-blue-100" />
                <Skeleton className="mt-3 h-4 w-full bg-blue-100" />
                <Skeleton className="mt-2 h-4 w-11/12 bg-blue-100" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-4 h-8 w-16" />
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-4 h-8 w-36" />
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
            </div>

            <div className="w-full max-w-sm shrink-0 rounded-3xl border border-blue-100 bg-white px-4 py-4">
              <Skeleton className="aspect-square w-full rounded-2xl border border-blue-100 bg-blue-50" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`owner-payment-assessment-${index}`}
              className="rounded-3xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5"
            >
              <Skeleton className="h-6 w-44 bg-blue-100" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-4 h-4 w-full" />
                  <Skeleton className="mt-3 h-4 w-2/3" />
                </div>
                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-4 h-8 w-28" />
                  <Skeleton className="mt-3 h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function OwnerInspectionStatusDetailContentSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-[#0F2942]/10 bg-[#F4F8FC] px-6 py-8 shadow-sm">
        <div className="flex items-start gap-5">
          <Skeleton className="h-16 w-16 rounded-2xl bg-[#D9E6F2]" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-56 max-w-full bg-[#D9E6F2]" />
            <Skeleton className="h-4 w-44 max-w-full bg-[#D9E6F2]" />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-11/12" />
        <Skeleton className="mt-2 h-4 w-10/12" />

        <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 sm:px-5 sm:py-5">
          <Skeleton className="h-4 w-24 bg-amber-200/70" />
          <Skeleton className="mt-3 h-4 w-full bg-amber-200/70" />
          <Skeleton className="mt-2 h-4 w-4/5 bg-amber-200/70" />
        </div>

        <Skeleton className="mt-8 h-10 w-64 max-w-full rounded-xl" />
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
        <Skeleton className="h-6 w-56" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`owner-inspection-step-${index}`}
              className="rounded-2xl border border-gray-100 px-4 py-4"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] sm:p-8">
        <Skeleton className="h-6 w-52" />
        <Skeleton className="mt-4 h-4 w-60" />
        <Skeleton className="mt-5 h-112 w-full rounded-2xl" />
      </div>
    </div>
  );
}
