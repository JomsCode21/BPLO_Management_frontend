import Skeleton from "@/components/ui/Skeleton";

function PaginationSkeleton() {
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
      <Skeleton className="h-5 w-44" />
      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <div className="flex flex-wrap items-center justify-center gap-1">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`pagination-skeleton-${index}`}
              className="h-8 w-8 rounded-lg"
            />
          ))}
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function BploAdminQueueResultsSkeleton() {
  return (
    <>
      <div className="divide-y divide-gray-100 md:hidden">
        {Array.from({ length: 4 }).map((_, index) => (
          <article
            key={`bplo-admin-queue-mobile-${index}`}
            className="p-4 sm:p-5"
          >
            <Skeleton className="h-6 w-44 max-w-full" />
            <Skeleton className="mt-3 h-4 w-32" />
            <Skeleton className="mt-4 h-6 w-24 rounded-full" />
            <Skeleton className="mt-4 h-11 w-full rounded-xl" />
          </article>
        ))}
      </div>

      <div className="hidden md:block md:h-full">
        <div className="bg-[#0F2942] px-5 py-4">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={`bplo-admin-queue-header-${index}`}
                className="h-3 w-full bg-white/20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div
              key={`bplo-admin-queue-row-${rowIndex}`}
              className="grid grid-cols-4 gap-3 rounded-lg border border-gray-100 px-3 py-3"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-9 w-20 justify-self-start rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <PaginationSkeleton />
    </>
  );
}

export function BploAdminPermitValidityTabsSkeleton() {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
      <div className="hidden gap-2 sm:flex sm:flex-wrap">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton
            key={`permit-validity-tab-${index}`}
            className="h-10 w-32 rounded-xl"
          />
        ))}
      </div>

      <div className="sm:hidden">
        <Skeleton className="mb-2 h-4 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function BploAdminPermitValidityResultsSkeleton() {
  return (
    <>
      <div className="divide-y divide-gray-100 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <article
            key={`permit-validity-mobile-${index}`}
            className="p-4 sm:p-5"
          >
            <Skeleton className="h-6 w-44 max-w-full" />
            <Skeleton className="mt-3 h-4 w-32" />
            <Skeleton className="mt-4 h-6 w-24 rounded-full" />

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-4 w-24" />
              </div>
              <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-3 h-4 w-24" />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {Array.from({ length: 2 }).map((__, fieldIndex) => (
                <div
                  key={`permit-validity-field-${index}-${fieldIndex}`}
                  className="rounded-xl border border-[#E8ECF3] bg-[#FCFDFF] px-4 py-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-4 w-3/4" />
                </div>
              ))}
            </div>

            <Skeleton className="mt-4 h-11 w-full rounded-xl" />
          </article>
        ))}
      </div>

      <div className="hidden md:block md:h-full">
        <div className="bg-[#0F2942] px-5 py-4">
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`permit-validity-header-${index}`}
                className="h-3 w-full bg-white/20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div
              key={`permit-validity-row-${rowIndex}`}
              className="grid grid-cols-6 gap-3 rounded-lg border border-gray-100 px-3 py-3"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-9 w-20 justify-self-start rounded-xl" />
            </div>
          ))}
        </div>
      </div>

      <PaginationSkeleton />
    </>
  );
}
