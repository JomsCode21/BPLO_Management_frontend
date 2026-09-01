import { BploAdminQueueResultsSkeleton } from "@/components/bplo_admin/BploAdminLoading";
import SuperAdminAccountSettingsPageSkeleton from "@/components/super_admin/account_settings/SuperAdminAccountSettingsPageSkeleton";
import Skeleton from "@/components/ui/Skeleton";

function EmployeeDashboardSkeleton({ tourId }: { tourId?: string }) {
  return (
    <div className="min-h-screen space-y-6 p-2 md:p-6">
      <div
        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
        data-super-admin-tour={tourId}
        data-evaluator-tour={tourId}
        data-inspector-tour={tourId}
        data-bplo-admin-tour={tourId}
      >
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`employee-dashboard-card-${index}`}
              className="rounded-2xl border border-gray-100 bg-[#F7FAFC] p-4"
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-20" />
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`employee-dashboard-panel-${index}`}
              className="rounded-2xl border border-gray-100 bg-[#FCFDFE] p-4 md:p-5"
            >
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-3 w-56 max-w-full" />
              <div className="mt-5 space-y-3">
                {Array.from({ length: 4 }).map((__, rowIndex) => (
                  <Skeleton
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

function EmployeeTableSkeleton({ tourId }: { tourId?: string }) {
  return (
    <div className="min-h-screen space-y-6 p-2 md:p-6">
      <div
        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
        data-super-admin-tour={tourId}
        data-evaluator-tour={tourId}
        data-inspector-tour={tourId}
        data-bplo-admin-tour={tourId}
      >
        <Skeleton className="h-8 w-52 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="bg-[#0F2942] px-5 py-4">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
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
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24 justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmployeeFormSkeleton() {
  return (
    <div className="min-h-screen space-y-6 p-2 md:p-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-lg max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={`employee-form-field-${index}`}
                className="h-11 w-full"
              />
            ))}
          </div>
          <Skeleton className="h-28 w-full" />
        </div>

        <div className="space-y-4 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <Skeleton className="h-6 w-40" />
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
              key={`employee-form-side-${index}`}
              className="h-10 w-full"
            />
          ))}
          <Skeleton className="h-11 w-36" />
        </div>
      </div>
    </div>
  );
}

function EmployeeAccountSkeleton({ tourId }: { tourId?: string }) {
  return <SuperAdminAccountSettingsPageSkeleton tourId={tourId} />;
}

function SuperAdminAccountSkeleton({ tourId }: { tourId?: string }) {
  return <SuperAdminAccountSettingsPageSkeleton showBranding tourId={tourId} />;
}

function OwnerDashboardSkeleton() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <div
        data-owner-tour="dashboard-hero"
        className="w-full rounded-b-[40px] bg-[#0F2942] px-3 pb-28 pt-8 sm:px-4 lg:px-6"
      >
        <div className="mb-8 flex justify-end">
          <Skeleton className="h-11 w-11 rounded-full bg-white/15" />
        </div>
        <Skeleton className="h-10 w-52 max-w-full bg-white/20" />
        <Skeleton className="mt-3 h-4 w-80 max-w-full bg-white/20" />
      </div>

      <div className="relative z-10 -mt-16 px-3 pb-12 sm:px-4 lg:px-6">
        <section className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`owner-dashboard-action-${index}`}
                className="flex flex-col items-center gap-3 py-2"
              >
                <Skeleton className="h-14 w-14 rounded-full bg-gray-300" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </section>

        <Skeleton className="mb-4 h-6 w-36" />

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`owner-dashboard-doc-${index}`}
              className="min-h-40 rounded-3xl bg-[#0F2942] p-6 sm:p-8"
            >
              <Skeleton className="h-6 w-44 bg-white/20" />
              <Skeleton className="mt-3 h-4 w-full bg-white/20" />
              <Skeleton className="mt-2 h-4 w-11/12 bg-white/20" />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

function OwnerStatusListSkeleton({ tourId }: { tourId?: string }) {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <header
        data-owner-tour={tourId}
        className="w-full rounded-b-[40px] bg-[#0F2942] px-3 py-6 sm:px-4 lg:px-6"
      >
        <div className="mx-auto w-full max-w-400">
          <div className="inline-flex items-center gap-3">
            <Skeleton className="h-11 w-11 rounded-full bg-white/15" />
            <Skeleton className="h-6 w-52 max-w-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-460 px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-7">
        <div className="mb-4 flex justify-end">
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="hidden overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:block">
          <div className="bg-[#0F2942] px-5 py-4">
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
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
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-9 w-24 justify-self-end" />
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
              <Skeleton className="h-6 w-44 max-w-full" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-4/5" />
              <Skeleton className="mt-4 h-10 w-full" />
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
            <Skeleton className="h-11 w-11 rounded-full bg-white/15" />
            <Skeleton className="h-6 w-52 max-w-full bg-white/20" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-460 px-3 py-5 sm:px-4 sm:py-6 lg:px-6 lg:py-7">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-3xl border border-[#0F2942]/10 bg-[#F4F8FC] px-6 py-8 shadow-sm">
            <div className="flex items-start gap-5">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-56 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-10/12" />
            <Skeleton className="mt-8 h-10 w-64 max-w-full" />
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
            <Skeleton className="h-6 w-56" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton
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
        <header
          data-owner-tour="application-request-header"
          className="bg-[#0F2942] px-7 py-8 sm:px-8 sm:py-10"
        >
          <Skeleton className="h-4 w-36 bg-white/20" />
          <Skeleton className="mt-5 h-9 w-64 max-w-full bg-white/20" />
          <Skeleton className="mt-3 h-4 w-lg max-w-full bg-white/20" />
        </header>

        <section className="grow bg-white px-6 py-8 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`owner-request-card-${index}`}
                className="rounded-3xl border border-gray-100 p-6 shadow-sm sm:p-8"
              >
                <div className="mb-6 flex items-start justify-between">
                  <Skeleton className="h-14 w-14 rounded-2xl" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <Skeleton className="h-6 w-40 max-w-full" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-8 h-3 w-24" />
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
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="mt-3 h-4 w-136 max-w-full" />
        </div>

        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton
                key={`owner-form-field-${index}`}
                className="h-11 w-full"
              />
            ))}
          </div>
          <Skeleton className="mt-5 h-32 w-full" />
          <div className="mt-5 flex justify-end">
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

function OwnerAccountSkeleton() {
  return (
    <div
      data-owner-tour="account-settings-shell"
      className="min-h-screen bg-[radial-gradient(circle_at_top,#2E5C82_0%,#173753_26%,#0F2942_52%,#081522_100%)] px-3 py-8 sm:px-4 lg:px-6"
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full bg-white/20" />
            <div className="space-y-3">
              <Skeleton className="h-7 w-48 bg-white/20" />
              <Skeleton className="h-4 w-64 max-w-full bg-white/20" />
            </div>
          </div>
        </div>

        <div className="rounded-4xl border border-white/10 bg-white/6 p-6 backdrop-blur-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
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

export function BploAdminPermitApprovalSkeleton() {
  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 pb-24 sm:gap-6 md:h-full md:min-h-0 md:overflow-hidden md:pb-0">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="flex min-h-96 w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:min-h-0 md:flex-1">
        <div className="md:min-h-0 md:flex-1">
          <BploAdminQueueResultsSkeleton />
        </div>
      </div>
    </div>
  );
}

export function MainTreasurerScanPaymentSkeleton() {
  return (
    <div className="min-h-screen space-y-6 p-2 md:p-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="mt-3 h-4 w-full max-w-120" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full max-w-120" />
              <Skeleton className="h-4 w-full max-w-80" />
            </div>

            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-11 w-36 rounded-2xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-dashed border-[#0F2942]/15 bg-[#F4F8FC] p-4">
            <Skeleton className="aspect-4/3 w-full rounded-2xl bg-[#D9E6F2]" />
          </div>

          <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-36 w-full rounded-2xl bg-white" />
            <div className="mt-3 flex justify-end">
              <Skeleton className="h-10 w-32 rounded-xl" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
          <Skeleton className="h-6 w-40" />

          <div className="mt-5 space-y-5">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24 bg-blue-100" />
                  <Skeleton className="h-8 w-56 max-w-full bg-white" />
                  <Skeleton className="h-4 w-48 max-w-full bg-white" />
                </div>

                <Skeleton className="h-7 w-24 rounded-full bg-blue-100" />
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div
                    key={`main-treasurer-scan-summary-${index}`}
                    className="rounded-2xl border border-blue-100 bg-white px-4 py-4"
                  >
                    <Skeleton className="h-4 w-24 bg-blue-100" />
                    <Skeleton className="mt-3 h-6 w-36 max-w-full" />
                    <Skeleton className="mt-3 h-4 w-28 max-w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <Skeleton className="h-4 w-40" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`main-treasurer-scan-department-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-36 max-w-full" />
                      <Skeleton className="h-3 w-28 max-w-full" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-3 h-11 w-full rounded-2xl" />

              <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-28" />
                </div>
                <Skeleton className="mt-3 h-4 w-40" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Skeleton className="h-12 w-40 rounded-xl" />
                <Skeleton className="h-12 w-36 rounded-xl" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const employeeTableLikeRoutes = new Set([
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

const employeeFormLikeRoutes = new Set(["scan-payment"]);

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
      const statusTourId =
        moduleRoute === "application-status"
          ? "status-application-header"
          : moduleRoute === "inspection-status"
            ? "status-inspection-header"
            : "status-payment-header";

      return <OwnerStatusListSkeleton tourId={statusTourId} />;
    }

    return <OwnerApplicationRequestSkeleton />;
  }

  if (!moduleName) {
    return <EmployeeDashboardSkeleton />;
  }

  const superAdminTourIdByRoute: Record<string, string> = {
    dashboard: "dashboard-hero",
    officers: "officers-header",
    permits: "permits-header",
    "permit-templates": "permit-templates-header",
    process: "process-header",
    "audit-history": "audit-history-header",
    account: "account-settings-shell",
  };
  const inspectorTourIdByRoute: Record<string, string> = {
    dashboard: "dashboard-hero",
    "inspection-requests": "inspection-requests-header",
    "schedule-inspection": "schedule-inspection-header",
    "inspection-assessment": "inspection-assessment-header",
    certificates: "certificates-header",
    "permit-release": "permit-release-header",
    "audit-history": "audit-history-header",
    account: "account-settings-shell",
  };
  const evaluatorTourIdByRoute: Record<string, string> = {
    dashboard: "dashboard-hero",
    requests: "requests-header",
    inspections: "inspections-header",
    "audit-history": "audit-history-header",
    account: "account-settings-shell",
  };
  const employeeTourId =
    moduleName === "super_admin"
      ? (superAdminTourIdByRoute[moduleRoute] ?? "")
      : moduleName === "evaluator"
        ? (evaluatorTourIdByRoute[moduleRoute] ?? "")
        : moduleName === "inspector"
          ? (inspectorTourIdByRoute[moduleRoute] ?? "")
          : "";

  if (moduleName === "bplo_admin" && moduleRoute === "permit-approval") {
    return <BploAdminPermitApprovalSkeleton />;
  }

  if (moduleName === "main_treasurer" && moduleRoute === "scan-payment") {
    return <MainTreasurerScanPaymentSkeleton />;
  }

  if (moduleRoute === "dashboard" || segments.length <= 2) {
    return <EmployeeDashboardSkeleton tourId={employeeTourId || undefined} />;
  }

  if (moduleRoute === "account") {
    if (moduleName === "super_admin") {
      return <SuperAdminAccountSkeleton tourId={employeeTourId || undefined} />;
    }

    return <EmployeeAccountSkeleton tourId={employeeTourId || undefined} />;
  }

  if (
    moduleName === "super_admin" &&
    moduleRoute === "permits" &&
    segments.length > 3
  ) {
    return <EmployeeFormSkeleton />;
  }

  if (employeeFormLikeRoutes.has(moduleRoute)) {
    return <EmployeeFormSkeleton />;
  }

  if (employeeTableLikeRoutes.has(moduleRoute)) {
    return <EmployeeTableSkeleton tourId={employeeTourId || undefined} />;
  }

  return <EmployeeTableSkeleton tourId={employeeTourId || undefined} />;
}
