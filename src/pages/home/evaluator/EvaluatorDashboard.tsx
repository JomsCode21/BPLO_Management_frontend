import { getEvaluatorDashboardApi } from "@/api/evaluator/evaluator.api";
import EvaluatorStatcard from "@/components/dashboard/EvaluatorStatcard";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createEvaluatorSocket,
  EVALUATOR_DASHBOARD_ANALYTICS_EVENT,
} from "@/socket/evaluator.socket";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useEvaluatorWalkthroughStore } from "@/stores/evaluator/evaluator-walkthrough.store";
import type { EvaluatorDashboardType } from "@/types/evaluator/evaluator.type";
import { useEffect, useMemo, useState } from "react";
import { FiCheckCircle, FiClipboard, FiClock, FiMail } from "react-icons/fi";

const initialDashboard: EvaluatorDashboardType = {
  applicationRequests: 0,
  ongoingInspections: 0,
  completeInspections: 0,
  departmentInspectionQueue: [],
  requestBreakdown: {
    forReview: 0,
    reSubmission: 0,
  },
  inspectionBreakdown: {
    waitingInspectionRouting: 0,
    underDepartmentInspection: 0,
    waitingForPayment: 0,
    readyForEvaluatorSubmission: 0,
    forAdminApproval: 0,
    forReinspection: 0,
  },
  analytics: {
    totalInspectionFlow: 0,
    totalQueueItems: 0,
    overdueQueueItems: 0,
    departmentsInQueue: 0,
    departmentsWithOverdueQueue: 0,
    configuredDepartments: 0,
    busiestDepartment: null,
    oldestQueueAgeDays: null,
    averageQueueAgeDays: null,
    queueHealth: "clear",
    workflowPressure: "light",
  },
  generatedAt: "",
};

const formatNumber = (value: number) =>
  Number(value ?? 0).toLocaleString("en-PH");

const pluralize = (value: number, singular: string, plural = `${singular}s`) =>
  `${formatNumber(value)} ${value === 1 ? singular : plural}`;

const normalizeDashboard = (
  payload?: Partial<EvaluatorDashboardType> | null,
): EvaluatorDashboardType => ({
  ...initialDashboard,
  ...payload,
  departmentInspectionQueue: Array.isArray(payload?.departmentInspectionQueue)
    ? payload.departmentInspectionQueue
    : initialDashboard.departmentInspectionQueue,
  requestBreakdown: {
    ...initialDashboard.requestBreakdown,
    ...(payload?.requestBreakdown ?? {}),
  },
  inspectionBreakdown: {
    ...initialDashboard.inspectionBreakdown,
    ...(payload?.inspectionBreakdown ?? {}),
  },
  analytics: {
    ...initialDashboard.analytics,
    ...(payload?.analytics ?? {}),
  },
  generatedAt: String(payload?.generatedAt ?? initialDashboard.generatedAt),
});

export default function EvaluatorDashboard() {
  const user = useAuthStore((state) => state.user);
  const requestWalkthroughStart = useEvaluatorWalkthroughStore(
    (state) => state.requestStart,
  );
  const [dashboard, setDashboard] =
    useState<EvaluatorDashboardType>(initialDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getEvaluatorDashboardApi();
      setDashboard(normalizeDashboard(response.data));
      if (isSilent) setError(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      if (!isSilent) {
        setError(
          error?.response?.data?.message ??
            "Failed to load evaluator dashboard.",
        );
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void loadDashboard({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = createEvaluatorSocket();

    const handleDashboardUpdate = (incoming: EvaluatorDashboardType) => {
      setDashboard(normalizeDashboard(incoming));
      setError(null);
      setIsLoading(false);
    };

    socket.on(EVALUATOR_DASHBOARD_ANALYTICS_EVENT, handleDashboardUpdate);

    return () => {
      socket.off(EVALUATOR_DASHBOARD_ANALYTICS_EVENT, handleDashboardUpdate);
      socket.disconnect();
    };
  }, []);

  const firstName = String(user?.firstName ?? "").trim() || "Evaluator";
  const applicationRequests = Number(dashboard.applicationRequests ?? 0);
  const ongoingInspections = Number(dashboard.ongoingInspections ?? 0);
  const completeInspections = Number(dashboard.completeInspections ?? 0);
  const reSubmissionRequests = Number(
    dashboard.requestBreakdown.reSubmission ?? 0,
  );
  const readyForEvaluatorSubmission = Number(
    dashboard.inspectionBreakdown.readyForEvaluatorSubmission ?? 0,
  );
  const waitingForPayment = Number(
    dashboard.inspectionBreakdown.waitingForPayment ?? 0,
  );
  const forAdminApproval = Number(
    dashboard.inspectionBreakdown.forAdminApproval ?? 0,
  );
  const totalInspectionFlow = Number(
    dashboard.analytics.totalInspectionFlow ?? 0,
  );
  const overdueQueueItems = Number(dashboard.analytics.overdueQueueItems ?? 0);
  const busiestDepartment = dashboard.analytics.busiestDepartment;

  const { liveQueueData, maxQueue } = useMemo(() => {
    const queueData = dashboard.departmentInspectionQueue ?? [];
    const activeQueues = queueData.filter(
      (item) => Number(item.queue ?? 0) > 0,
    );
    const nextMaxQueue = Math.max(
      ...activeQueues.map((item) => Number(item.queue ?? 0)),
      1,
    );

    return {
      liveQueueData: activeQueues,
      maxQueue: nextMaxQueue,
    };
  }, [dashboard.departmentInspectionQueue]);

  const heroSummary = isLoading
    ? "Pulling evaluator requests, inspection flow progress, and department queue data."
    : applicationRequests > 0 || totalInspectionFlow > 0
      ? `${firstName}, you currently have ${pluralize(applicationRequests, "application request")} waiting for evaluator review, ${pluralize(ongoingInspections, "inspection flow")} still moving across departments, and ${pluralize(completeInspections, "completed inspection flow")} with finished department steps.${reSubmissionRequests > 0 ? ` ${pluralize(reSubmissionRequests, "request")} are resubmissions back for another evaluator check.` : ""}${waitingForPayment > 0 ? ` ${pluralize(waitingForPayment, "inspection flow")} are waiting for owner payment.` : ""}${readyForEvaluatorSubmission > 0 ? ` ${pluralize(readyForEvaluatorSubmission, "inspection flow")} are ready for evaluator submission.` : ""}${forAdminApproval > 0 ? ` ${pluralize(forAdminApproval, "inspection flow")} already sit in BPLO admin approval.` : ""}`
      : "No evaluator requests or inspection flow items are waiting right now. The dashboard will populate automatically as new submissions arrive and inspection-routed applications move through department review.";

  const statCards = [
    {
      label: "Application Requests",
      value: isLoading ? "..." : formatNumber(applicationRequests),
      note: "Waiting for evaluator review.",
      icon: <FiMail size={22} />,
      accentColor: "bg-amber-400",
      surfaceClass: "bg-[#FFF8E8]",
      iconClass: "bg-white text-amber-700",
    },
    {
      label: "Ongoing Inspections",
      value: isLoading ? "..." : formatNumber(ongoingInspections),
      note: "Still moving through department steps.",
      icon: <FiClipboard size={22} />,
      accentColor: "bg-sky-500",
      surfaceClass: "bg-[#EFF7FF]",
      iconClass: "bg-white text-sky-700",
    },
    {
      label: "Completed Inspection Flow",
      value: isLoading ? "..." : formatNumber(completeInspections),
      note: "All department steps are already done.",
      icon: <FiCheckCircle size={22} />,
      accentColor: "bg-emerald-500",
      surfaceClass: "bg-[#EEFBF3]",
      iconClass: "bg-white text-emerald-700",
    },
    {
      label: "Overdue Queue Items",
      value: isLoading ? "..." : formatNumber(overdueQueueItems),
      note: "Queued for 7 days or longer.",
      icon: <FiClock size={22} />,
      accentColor: "bg-rose-500",
      surfaceClass: "bg-[#FFF1F2]",
      iconClass: "bg-white text-rose-700",
    },
  ];

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <section
        className="overflow-hidden rounded-[28px] border border-[#DCE7F3] bg-linear-to-br from-[#F7FBFF] via-[#EEF5FF] to-[#FEF7E8] p-4 shadow-sm sm:rounded-4xl sm:p-6 lg:p-8"
        data-evaluator-tour="dashboard-hero"
      >
        <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#5E6D7E] shadow-sm">
          Evaluator Workspace
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0F2942] sm:text-4xl lg:text-5xl">
          Evaluator Dashboard
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-[#5E6D7E] sm:text-base">
          {heroSummary}
        </p>
        <button
          type="button"
          onClick={requestWalkthroughStart}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#0F2942]/10 bg-[#0F2942] px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#173654] sm:text-[11px]"
        >
          Replay Evaluator Walkthrough
        </button>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <EvaluatorStatcard
            key={card.label}
            label={card.label}
            value={card.value}
            note={card.note}
            icon={card.icon}
            accentColor={card.accentColor}
            surfaceClass={card.surfaceClass}
            iconClass={card.iconClass}
          />
        ))}
      </div>

      <section className="rounded-[28px] border border-gray-100 bg-white p-4 shadow-sm sm:rounded-4xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#5E6D7E]">
              Department Routing
            </p>
            <h2 className="mt-3 text-2xl font-black text-[#0F2942] sm:text-3xl">
              Department Inspection Queue
            </h2>
            <p className="mt-3 text-sm font-medium leading-7 text-[#5E6D7E]">
              Each bar shows live inspection work sitting on the current
              department step. Red segments mark queue items that have been
              waiting at least 7 days.
            </p>
          </div>

          <div className="w-full rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 sm:w-auto sm:px-5 lg:shrink-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7A8A9A]">
              Highest Queue
            </p>
            <p className="mt-2 text-lg font-black text-[#0F2942]">
              {busiestDepartment?.departmentName ?? "All clear"}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#5E6D7E]">
              {busiestDepartment
                ? `${pluralize(busiestDepartment.queue, "application")} at this stage`
                : "No live department queue"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-[#5E6D7E]">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#0F2942]" />
            Under 7 days in queue
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EF4444]" />7 days or
            more in queue
          </span>
        </div>

        {liveQueueData.length === 0 ? (
          <div className="mt-6 rounded-[28px] border border-dashed border-[#D8E2EE] bg-[#F8FAFC] px-4 py-12 text-center text-sm font-semibold text-[#5E6D7E]">
            No department inspection queue right now.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {liveQueueData.map((item) => {
              const queue = Number(item.queue ?? 0);
              const overdueQueue = Math.min(
                Number(item.overdueQueue ?? 0),
                queue,
              );
              const normalQueue = Math.max(queue - overdueQueue, 0);
              const rowWidth =
                queue > 0 ? Math.max((queue / maxQueue) * 100, 10) : 0;
              const normalPercent = queue > 0 ? (normalQueue / queue) * 100 : 0;
              const overduePercent =
                queue > 0 ? (overdueQueue / queue) * 100 : 0;
              const hasOverdue = overdueQueue > 0;

              return (
                <div
                  key={item.departmentId}
                  className="rounded-3xl border border-[#E7EDF6] bg-[#FAFCFF] p-4 shadow-sm sm:rounded-[26px] sm:p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="wrap-break-word text-base font-black text-[#0F2942] sm:text-lg">
                        {item.departmentName}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            hasOverdue
                              ? "bg-rose-100 text-rose-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {hasOverdue
                            ? `${formatNumber(overdueQueue)} overdue`
                            : "On track"}
                        </span>

                        {normalQueue > 0 && (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-[#0F2942]">
                            {formatNumber(normalQueue)} active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7A8A9A]">
                        Queue
                      </p>
                      <p className="mt-1 text-2xl font-black leading-none text-[#0F2942] sm:text-4xl">
                        {formatNumber(queue)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[#DFE8F3]">
                    <div
                      className="flex h-full overflow-hidden rounded-full"
                      style={{ width: `${rowWidth}%` }}
                    >
                      {normalQueue > 0 && (
                        <div
                          className="h-full bg-[#0F2942]"
                          style={{ width: `${normalPercent}%` }}
                        />
                      )}
                      {overdueQueue > 0 && (
                        <div
                          className="h-full bg-[#EF4444]"
                          style={{ width: `${overduePercent}%` }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
