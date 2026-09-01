// Libraries
import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
// Stores
import { useAuthStore } from "@/stores/auth/auth.store";
import { useTokenStore } from "@/stores/token/token.store";
// Components
import BploAdminSpotlightWalkthrough from "@/components/bplo_admin/onboarding/BploAdminSpotlightWalkthrough";
import EvaluatorSpotlightWalkthrough from "@/components/evaluator/onboarding/EvaluatorSpotlightWalkthrough";
import InspectorSpotlightWalkthrough from "@/components/inspector/onboarding/InspectorSpotlightWalkthrough";
import OwnerSidebar from "@/components/owner/OwnerSidebar";
import OwnerSpotlightWalkthrough from "@/components/owner/onboarding/OwnerSpotlightWalkthrough";
import Sidebar from "@/components/sidebar/Sidebar";
import SuperAdminSpotlightWalkthrough from "@/components/super_admin/onboarding/SuperAdminSpotlightWalkthrough";
import { HomeFallbackSkeleton as SharedHomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
  );
}

function EmployeeDashboardSkeleton() {
  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <SkeletonBlock className="h-8 w-56 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`employee-dashboard-card-${index}`}
              className="rounded-2xl border border-gray-100 bg-[#F7FAFC] p-4"
            >
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="mt-4 h-10 w-20" />
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`employee-dashboard-panel-${index}`}
              className="rounded-2xl border border-gray-100 bg-[#FCFDFE] p-4 md:p-5"
            >
              <SkeletonBlock className="h-5 w-44" />
              <SkeletonBlock className="mt-2 h-3 w-56 max-w-full" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <SkeletonBlock
                    key={`employee-dashboard-row-${index}-${rowIndex}`}
                    className="h-4 w-full"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeTableSkeleton() {
  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <SkeletonBlock className="h-8 w-52 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#0F2942] px-5 py-4">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock
                key={`employee-table-header-${index}`}
                className="h-3 w-full bg-white/20"
              />
            ))}
          </div>
        </div>

        <div className="space-y-3 px-5 py-5">
          {Array.from({ length: 8 }).map((_, rowIndex) => (
            <div
              key={`employee-table-row-${rowIndex}`}
              className="grid grid-cols-4 gap-3 rounded-lg border border-gray-100 px-3 py-3"
            >
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-8 w-24 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeFormSkeleton() {
  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <SkeletonBlock className="h-8 w-64 max-w-full" />
        <SkeletonBlock className="mt-3 h-4 w-lg max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <SkeletonBlock className="h-6 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock
                key={`employee-form-field-${index}`}
                className="h-11 w-full"
              />
            ))}
          </div>
          <SkeletonBlock className="h-28 w-full" />
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <SkeletonBlock className="h-6 w-40" />
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonBlock
              key={`employee-form-side-${index}`}
              className="h-10 w-full"
            />
          ))}
          <SkeletonBlock className="h-11 w-36" />
        </div>
      </div>
    </div>
  );
}

function EmployeeAccountSkeleton() {
  return (
    <div className="min-h-screen p-2 md:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <SkeletonBlock className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <SkeletonBlock className="h-6 w-44" />
              <SkeletonBlock className="h-4 w-64 max-w-full" />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock
                key={`employee-account-field-${index}`}
                className="h-11 w-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerDashboardSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div className="w-full rounded-b-[40px] bg-[#0F2942] px-3 pb-28 pt-8 sm:px-4 lg:px-6">
        <div className="mb-8 flex justify-end">
          <SkeletonBlock className="h-11 w-11 rounded-full bg-white/15" />
        </div>
        <SkeletonBlock className="h-10 w-52 max-w-full bg-white/20" />
        <SkeletonBlock className="mt-3 h-4 w-80 max-w-full bg-white/20" />
      </div>

      <div className="relative z-10 -mt-16 px-3 pb-12 sm:px-4 lg:px-6">
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`owner-dashboard-action-${index}`}
                className="flex flex-col items-center gap-3 py-2"
              >
                <SkeletonBlock className="h-14 w-14 rounded-full bg-gray-300" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            ))}
          </div>
        </section>

        <SkeletonBlock className="mb-4 h-6 w-36" />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`owner-dashboard-doc-${index}`}
              className="min-h-40 rounded-3xl bg-[#0F2942] p-6 sm:p-8"
            >
              <SkeletonBlock className="h-6 w-44 bg-white/20" />
              <SkeletonBlock className="mt-3 h-4 w-full bg-white/20" />
              <SkeletonBlock className="mt-2 h-4 w-11/12 bg-white/20" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function OwnerStatusListSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="w-full rounded-b-[40px] bg-[#0F2942] px-3 py-6 sm:px-4 lg:px-6">
        <div className="mx-auto w-full max-w-400">
          <div className="inline-flex items-center gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-full bg-white/15" />
            <SkeletonBlock className="h-6 w-52 max-w-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-460 px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-7">
        <div className="mb-4 flex justify-end">
          <SkeletonBlock className="h-4 w-28" />
        </div>
        <div className="hidden overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:block">
          <div className="bg-[#0F2942] px-5 py-4">
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBlock
                  key={`owner-status-header-${index}`}
                  className="h-3 w-full bg-white/20"
                />
              ))}
            </div>
          </div>

          <div className="space-y-3 px-5 py-4">
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <div
                key={`owner-status-row-${rowIndex}`}
                className="grid grid-cols-6 gap-3"
              >
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-5 w-full" />
                <SkeletonBlock className="h-9 w-24 justify-self-end" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`owner-status-mobile-${index}`}
              className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <SkeletonBlock className="h-6 w-44 max-w-full" />
              <SkeletonBlock className="mt-3 h-4 w-full" />
              <SkeletonBlock className="mt-2 h-4 w-4/5" />
              <SkeletonBlock className="mt-4 h-10 w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function OwnerStatusDetailSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header className="w-full rounded-b-[40px] bg-[#0F2942] px-3 py-6 sm:px-4 lg:px-6">
        <div className="mx-auto w-full max-w-400">
          <div className="inline-flex items-center gap-3">
            <SkeletonBlock className="h-11 w-11 rounded-full bg-white/15" />
            <SkeletonBlock className="h-6 w-52 max-w-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-460 px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-7">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-[#0F2942]/10 bg-[#F4F8FC] px-6 py-8 shadow-sm">
            <div className="flex items-start gap-5">
              <SkeletonBlock className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-8 w-56 max-w-full" />
                <SkeletonBlock className="h-4 w-40 max-w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <SkeletonBlock className="h-6 w-44" />
            <SkeletonBlock className="mt-4 h-4 w-full" />
            <SkeletonBlock className="mt-2 h-4 w-11/12" />
            <SkeletonBlock className="mt-2 h-4 w-10/12" />
            <SkeletonBlock className="mt-8 h-10 w-64 max-w-full" />
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <SkeletonBlock className="h-6 w-56" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonBlock
                  key={`owner-detail-step-${index}`}
                  className="h-4 w-full"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function OwnerApplicationRequestSkeleton() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 px-3 py-8 sm:px-4 lg:px-6">
      <div className="flex w-full grow flex-col overflow-hidden rounded-3xl border border-[#D9DEE6] bg-white shadow-sm">
        <header className="bg-[#0F2942] px-7 py-8 sm:px-8 sm:py-10">
          <SkeletonBlock className="h-4 w-36 bg-white/20" />
          <SkeletonBlock className="mt-5 h-9 w-64 max-w-full bg-white/20" />
          <SkeletonBlock className="mt-3 h-4 w-lg max-w-full bg-white/20" />
        </header>

        <section className="grow bg-white px-6 py-8 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`owner-request-card-${index}`}
                className="rounded-3xl border border-gray-100 p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between">
                  <SkeletonBlock className="h-14 w-14 rounded-2xl" />
                  <SkeletonBlock className="h-10 w-10 rounded-full" />
                </div>
                <SkeletonBlock className="h-6 w-40 max-w-full" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-5/6" />
                <SkeletonBlock className="mt-8 h-3 w-24" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function OwnerApplicationFormSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-50 px-3 py-8 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <SkeletonBlock className="h-8 w-72 max-w-full" />
          <SkeletonBlock className="mt-3 h-4 w-136 max-w-full" />
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBlock
                key={`owner-form-field-${index}`}
                className="h-11 w-full"
              />
            ))}
          </div>
          <SkeletonBlock className="mt-5 h-32 w-full" />
          <div className="mt-5 flex justify-end">
            <SkeletonBlock className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerAccountSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2E5C82_0%,#173753_26%,#0F2942_52%,#081522_100%)] px-3 py-8 sm:px-4 lg:px-6">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <SkeletonBlock className="h-20 w-20 rounded-full bg-white/20" />
            <div className="space-y-3">
              <SkeletonBlock className="h-7 w-48 bg-white/20" />
              <SkeletonBlock className="h-4 w-64 max-w-full bg-white/20" />
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 backdrop-blur-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBlock
                key={`owner-account-field-${index}`}
                className="h-12 w-full bg-white/20"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeFallbackSkeleton({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  const moduleName = segments[1] ?? "";
  const moduleRoute = segments[2] ?? "";

  if (moduleName === "user") {
    const isStatusDetail =
      (moduleRoute === "application-status" ||
        moduleRoute === "inspection-status" ||
        moduleRoute === "payment-status") &&
      segments.length > 3;

    if (moduleRoute === "dashboard" || segments.length <= 2) {
      return <OwnerDashboardSkeleton />;
    }

    if (moduleRoute === "account") {
      return <OwnerAccountSkeleton />;
    }

    if (moduleRoute === "application-request" && segments.length > 3) {
      return <OwnerApplicationFormSkeleton />;
    }

    if (moduleRoute === "application-request") {
      return <OwnerApplicationRequestSkeleton />;
    }

    if (isStatusDetail) {
      return <OwnerStatusDetailSkeleton />;
    }

    if (
      moduleRoute === "application-status" ||
      moduleRoute === "inspection-status" ||
      moduleRoute === "payment-status"
    ) {
      return <OwnerStatusListSkeleton />;
    }

    return <OwnerApplicationRequestSkeleton />;
  }

  if (!moduleName) {
    return <EmployeeDashboardSkeleton />;
  }

  const tableLikeRoutes = new Set([
    "officers",
    "permits",
    "process",
    "requests",
    "inspections",
    "inspection-requests",
    "schedule-inspection",
    "inspection-assessment",
    "permit-validity",
    "inspection-request",
    "permit-approval",
    "permit-release",
    "payers-pending",
    "payers-paid",
    "payment-list",
    "fee-assessment",
    "payments",
  ]);

  const formLikeRoutes = new Set(["scan-payment"]);

  if (moduleRoute === "dashboard" || segments.length <= 2) {
    return <EmployeeDashboardSkeleton />;
  }

  if (moduleRoute === "account") {
    return <EmployeeAccountSkeleton />;
  }

  if (
    moduleName === "super_admin" &&
    moduleRoute === "permits" &&
    segments.length > 3
  ) {
    return <EmployeeFormSkeleton />;
  }

  if (formLikeRoutes.has(moduleRoute)) {
    return <EmployeeFormSkeleton />;
  }

  if (tableLikeRoutes.has(moduleRoute)) {
    return <EmployeeTableSkeleton />;
  }

  return <EmployeeTableSkeleton />;
}

export default function HomeLayout() {
  const accessToken = useTokenStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const isHomeRoot = location.pathname === "/home";
  const isBusinessOwnerRoute = location.pathname.startsWith("/home/user");
  const isEvaluatorRoute = location.pathname.startsWith("/home/evaluator");
  const isInspectorRoute = location.pathname.startsWith("/home/inspector");
  const isSuperAdminRoute = location.pathname.startsWith("/home/super_admin");
  const isBploAdminRoute = location.pathname.startsWith("/home/bplo_admin");
  const isOfficerRoute = location.pathname === "/home/super_admin/officers";
  const isBploPermitValidityRoute =
    location.pathname === "/home/bplo_admin/permit-validity";
  const isBploFeeAssessmentRoute =
    location.pathname === "/home/bplo_admin/fee-assessment";
  const isBploInspectionRequestRoute =
    location.pathname === "/home/bplo_admin/inspection-request";
  const isBploPermitApprovalRoute =
    location.pathname === "/home/bplo_admin/permit-approval";
  const isBploPermitReleaseRoute =
    location.pathname === "/home/bplo_admin/permit-release";
  const isInspectorPermitReleaseRoute =
    location.pathname === "/home/inspector/permit-release";
  const isMainTreasurerDashboardRoute =
    location.pathname === "/home/main_treasurer/dashboard";
  const isMainTreasurerPaymentsRoute =
    location.pathname === "/home/main_treasurer/payments";
  const isMainTreasurerAuditHistoryRoute =
    location.pathname === "/home/main_treasurer/audit-history";
  const usesFixedWorkspace =
    isOfficerRoute ||
    isBploPermitValidityRoute ||
    isBploFeeAssessmentRoute ||
    isBploInspectionRequestRoute ||
    isBploPermitApprovalRoute ||
    isBploPermitReleaseRoute ||
    isInspectorPermitReleaseRoute ||
    isMainTreasurerDashboardRoute ||
    isMainTreasurerPaymentsRoute ||
    isMainTreasurerAuditHistoryRoute;

  if (!accessToken) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  const normalizedRole = user?.role?.toUpperCase();
  const isBusinessOwner =
    normalizedRole === "BUSINESS_OWNER" && isBusinessOwnerRoute;
  const ownerWalkthroughAccountIdentifier = String(
    user?._id ?? user?.email ?? "",
  ).trim();
  const isSuperAdmin = normalizedRole === "SUPER_ADMIN" && isSuperAdminRoute;
  const superAdminWalkthroughAccountIdentifier = String(
    user?._id ?? user?.email ?? "",
  ).trim();
  const isInspector = normalizedRole === "INSPECTOR" && isInspectorRoute;
  const inspectorWalkthroughAccountIdentifier = String(
    user?._id ?? user?.email ?? "",
  ).trim();
  const isBploAdmin = normalizedRole === "BPLO_ADMIN" && isBploAdminRoute;
  const bploAdminWalkthroughAccountIdentifier = String(
    user?._id ?? user?.email ?? "",
  ).trim();
  const isEvaluator = normalizedRole === "EVALUATOR" && isEvaluatorRoute;
  const evaluatorWalkthroughAccountIdentifier = String(
    user?._id ?? user?.email ?? "",
  ).trim();
  const isEmployee = Boolean(
    normalizedRole &&
    [
      "EVALUATOR",
      "INSPECTOR",
      "SUPER_ADMIN",
      "BPLO_ADMIN",
      "DEPARTMENT_TREASURER",
      "MAIN_TREASURER",
    ].includes(normalizedRole),
  );

  return (
    // Outer wrapper uses your cool slate background for any non-dashboard loading pages
    <div className="h-dvh w-full bg-white md:bg-linear-to-br md:from-slate-900 md:via-slate-800 md:to-slate-900 flex flex-row overflow-hidden">
      {/* 1. Sidebar on the left */}
      {isEmployee && <Sidebar />}
      {isBusinessOwner && <OwnerSidebar />}

      {/* 2. Main content area on the right (bg-white makes the active tab seamless!) */}
      <main
        className={`flex-1 min-w-0 h-full bg-white ${
          usesFixedWorkspace
            ? "overflow-y-auto p-4 sm:p-6 md:overflow-hidden md:p-8"
            : isBusinessOwnerRoute
              ? "overflow-x-hidden overflow-y-auto pb-24 sm:pb-28 lg:pb-0"
              : "overflow-x-auto overflow-y-auto"
        } ${
          isHomeRoot || isBusinessOwnerRoute || usesFixedWorkspace
            ? ""
            : "p-4 pb-24 sm:p-6 sm:pb-28 md:p-8"
        } ${isBusinessOwnerRoute ? "hide-scrollbar-mobile" : ""}`}
      >
        <Suspense
          fallback={<SharedHomeFallbackSkeleton pathname={location.pathname} />}
        >
          <Outlet />
        </Suspense>

        <OwnerSpotlightWalkthrough
          accountIdentifier={ownerWalkthroughAccountIdentifier}
          isBusinessOwner={isBusinessOwner}
          isBusinessOwnerRoute={isBusinessOwnerRoute}
        />
        <EvaluatorSpotlightWalkthrough
          accountIdentifier={evaluatorWalkthroughAccountIdentifier}
          isEvaluator={isEvaluator}
          isEvaluatorRoute={isEvaluatorRoute}
        />
        <InspectorSpotlightWalkthrough
          accountIdentifier={inspectorWalkthroughAccountIdentifier}
          isInspector={isInspector}
          isInspectorRoute={isInspectorRoute}
        />
        <BploAdminSpotlightWalkthrough
          accountIdentifier={bploAdminWalkthroughAccountIdentifier}
          isBploAdmin={isBploAdmin}
          isBploAdminRoute={isBploAdminRoute}
        />
        <SuperAdminSpotlightWalkthrough
          accountIdentifier={superAdminWalkthroughAccountIdentifier}
          isSuperAdmin={isSuperAdmin}
          isSuperAdminRoute={isSuperAdminRoute}
        />
      </main>
    </div>
  );
}
