import type { ReactNode } from "react";

import Skeleton from "@/components/ui/Skeleton";

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-white px-4 py-8">
      <div
        className="absolute bottom-[-15%] left-[-10%] h-[50%] w-[120%] rotate-[-2deg] rounded-full bg-[#0F2942] md:bottom-[-20%] md:left-[-20%] md:h-[70%] md:w-[140%]"
        aria-hidden="true"
      />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}

function AuthLandingSkeleton() {
  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-105 rounded-[35px] border border-gray-50 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:rounded-[45px] md:p-10">
        <div className="mb-8 flex justify-center">
          <Skeleton className="h-28 w-52 rounded-[28px] bg-slate-100" />
        </div>

        <div className="mb-8 space-y-3 text-center">
          <Skeleton className="mx-auto h-8 w-60 max-w-full bg-slate-200" />
          <Skeleton className="mx-auto h-4 w-48 max-w-full bg-slate-200" />
        </div>

        <div className="mb-8 space-y-3">
          <Skeleton className="mx-auto h-4 w-full max-w-md bg-slate-200" />
          <Skeleton className="mx-auto h-4 w-11/12 max-w-sm bg-slate-200" />
          <Skeleton className="mx-auto h-4 w-10/12 max-w-xs bg-slate-200" />
        </div>

        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-2xl bg-[#F2C94C]/55" />
          <Skeleton className="h-14 w-full rounded-2xl bg-[#0F2942]/18" />
        </div>
      </div>
    </AuthShell>
  );
}

function AuthFormSkeleton({ long = false }: { long?: boolean }) {
  return (
    <AuthShell>
      <div
        className={`mx-auto w-full rounded-[35px] border border-gray-50 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:rounded-[45px] ${
          long ? "max-w-xl p-6 md:p-10" : "max-w-105 p-6 md:p-10"
        }`}
      >
        <div className="mb-8 space-y-3 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-3xl bg-slate-100" />
          <Skeleton className="mx-auto h-8 w-60 max-w-full bg-slate-200" />
          <Skeleton className="mx-auto h-4 w-56 max-w-full bg-slate-200" />
        </div>

        <div className="space-y-5">
          {long ? (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
              </div>
              <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
                <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
              </div>
              <Skeleton className="h-24 w-full rounded-2xl bg-slate-100" />
            </>
          ) : (
            <>
              <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
              <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-28 bg-slate-200" />
                <Skeleton className="h-4 w-32 bg-slate-200" />
              </div>
            </>
          )}

          <Skeleton className="h-14 w-full rounded-2xl bg-[#F2C94C]/55" />
          <div className="flex items-center gap-4 py-1">
            <Skeleton className="h-px flex-1 rounded-full bg-slate-200" />
            <Skeleton className="h-4 w-10 bg-slate-200" />
            <Skeleton className="h-px flex-1 rounded-full bg-slate-200" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl bg-slate-100" />
          <Skeleton className="mx-auto h-4 w-44 max-w-full bg-slate-200" />
        </div>
      </div>
    </AuthShell>
  );
}

function AuthLegalSkeleton() {
  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-4xl rounded-[35px] border border-gray-50 bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15)] md:rounded-[45px] md:p-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-5 w-36 bg-slate-200" />
          <Skeleton className="h-4 w-28 bg-slate-200" />
        </div>

        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-72 max-w-full bg-slate-200" />
          <Skeleton className="h-4 w-full max-w-2xl bg-slate-200" />
        </div>

        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`legal-section-${index}`} className="space-y-3">
              <Skeleton className="h-6 w-52 max-w-full bg-slate-200" />
              <Skeleton className="h-4 w-full bg-slate-100" />
              <Skeleton className="h-4 w-11/12 bg-slate-100" />
              <Skeleton className="h-4 w-10/12 bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}

export function AuthFallbackSkeleton({ pathname }: { pathname: string }) {
  if (
    pathname === "/" ||
    pathname === ""
  ) {
    return <AuthLandingSkeleton />;
  }

  if (
    pathname.includes("/terms-and-conditions") ||
    pathname.includes("/privacy-policy")
  ) {
    return <AuthLegalSkeleton />;
  }

  if (pathname.includes("/auth/register")) {
    return <AuthFormSkeleton long />;
  }

  return <AuthFormSkeleton />;
}
