import { getInspectorDashboardApi } from "@/api/inspector/inspector.api";
import {
  formatNumber,
  type InspectorResultChartDatum,
} from "@/components/inspector/dashboard/shared";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createInspectorSocket,
  INSPECTOR_INSPECTION_REQUEST_EVENT,
  INSPECTOR_SCHEDULE_EVENT,
} from "@/socket/inspector.socket";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useInspectorWalkthroughStore } from "@/stores/inspector/inspector-walkthrough.store";
import type { InspectorDashboardType } from "@/types/inspector/inspector.type";
import {
  hasUnseenInspectorRequests,
  INSPECTOR_REQUEST_NOTIFICATION_SYNC_EVENT,
  markInspectorRequestsSeen,
  markInspectorRequestsUpdated,
} from "@/utils/inspector/inspector-request-notification.util";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  FiActivity,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiLoader,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const InspectorOutcomeMixCard = lazy(
  () => import("@/components/inspector/dashboard/InspectorOutcomeMixCard"),
);
const InspectorMonthlyActivityCard = lazy(
  () => import("@/components/inspector/dashboard/InspectorMonthlyActivityCard"),
);

const initialDashboard: InspectorDashboardType = {
  pendingRequests: 0,
  todayInspections: 0,
  upcomingInspections: 0,
  resultBreakdown: {
    passed: 0,
    forCompletion: 0,
    failed: 0,
  },
  monthlyInspections: [],
  peakMonth: null,
  analytics: {
    activeSchedules: 0,
    readyAssessments: 0,
    overdueInspections: 0,
    rescheduledInspections: 0,
    averageMonthlyInspections: 0,
    averageTurnaroundDays: null,
    nextInspectionAt: null,
    busiestWeekday: null,
  },
};

const renderChartCardFallback = (title: string, description: string) => (
  <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
    <div className="min-w-0">
      <h2 className="text-lg font-black text-[#0F2942]">{title}</h2>
      <p className="mt-1 text-sm font-medium text-gray-500">{description}</p>
    </div>

    <div className="mt-4 flex min-h-56 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FCFDFE] p-6 text-center text-sm font-semibold text-[#0F2942] sm:min-h-72">
      <FiLoader className="mr-2 animate-spin" />
      Loading chart...
    </div>
  </article>
);

const normalizeInspectorDashboard = (
  dashboard?: Partial<InspectorDashboardType> | null,
): InspectorDashboardType => ({
  ...initialDashboard,
  ...dashboard,
  resultBreakdown: {
    ...initialDashboard.resultBreakdown,
    ...(dashboard?.resultBreakdown ?? {}),
  },
  monthlyInspections:
    dashboard?.monthlyInspections ?? initialDashboard.monthlyInspections,
  peakMonth: dashboard?.peakMonth ?? initialDashboard.peakMonth,
  analytics: {
    ...initialDashboard.analytics,
    ...(dashboard?.analytics ?? {}),
  },
});

type StatCard = {
  label: string;
  value: number;
  note: string;
  icon: ComponentType<{ className?: string }>;
  surfaceClass: string;
  iconClass: string;
  isUnread?: boolean;
  path?: string;
};

const formatMetricValue = (value: number, maximumFractionDigits = 1) =>
  Number(value ?? 0).toLocaleString("en-PH", {
    maximumFractionDigits,
  });

const formatScheduleDateTime = (value?: string | null) => {
  if (!value) return "No future visit";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No future visit";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getChartUpperBound = (maxValue: number) => {
  if (maxValue <= 0) return 4;

  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(roughStep)));
  const normalizedStep = roughStep / magnitude;
  const niceStep =
    normalizedStep <= 1
      ? 1
      : normalizedStep <= 2
        ? 2
        : normalizedStep <= 5
          ? 5
          : 10;

  return niceStep * magnitude * 4;
};

const getStatusCode = (err: unknown): number | null => {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "status" in err.response &&
    typeof err.response.status === "number"
  ) {
    return err.response.status;
  }

  return null;
};

export default function InspectorDashboard() {
  const navigate = useNavigate();
  const requestWalkthroughStart = useInspectorWalkthroughStore(
    (state) => state.requestStart,
  );
  const user = useAuthStore((state) => state.user);
  const inspectorId = String(user?._id ?? "").trim();
  const [dashboard, setDashboard] =
    useState<InspectorDashboardType>(initialDashboard);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const [hasNewInspectionRequest, setHasNewInspectionRequest] = useState(false);
  const requestVersionRef = useRef(0);
  const isMountedRef = useRef(true);
  const pendingRequestCountRef = useRef(0);

  const loadDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      const isSilent = options?.silent ?? false;
      const requestVersion = ++requestVersionRef.current;

      if (!isSilent) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await getInspectorDashboardApi();

        if (
          !isMountedRef.current ||
          requestVersion !== requestVersionRef.current
        ) {
          return;
        }

        const nextDashboard = normalizeInspectorDashboard(response.data);
        // Notification badge is derived from persisted "seen" marker vs latest count.
        setDashboard(nextDashboard);
        setHasNewInspectionRequest(
          hasUnseenInspectorRequests(
            inspectorId,
            nextDashboard.pendingRequests,
          ),
        );
        setError(null);
      } catch (err: unknown) {
        if (
          !isMountedRef.current ||
          requestVersion !== requestVersionRef.current
        ) {
          return;
        }

        if (getStatusCode(err) === 304) {
          // "Not Modified" is not a failure. Keep the current dashboard data.
          setError(null);
          return;
        }

        if (!isSilent) {
          const errorMessage =
            (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? "Failed to load inspector dashboard.";
          setError(errorMessage);
        }
      } finally {
        if (
          isMountedRef.current &&
          requestVersion === requestVersionRef.current &&
          !isSilent
        ) {
          setIsLoading(false);
        }
      }
    },
    [inspectorId],
  );

  useEffect(() => {
    pendingRequestCountRef.current = dashboard.pendingRequests;
  }, [dashboard.pendingRequests]);

  useEffect(() => {
    isMountedRef.current = true;
    void loadDashboard();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadDashboard]);

  useEffect(() => {
    const socket = createInspectorSocket();
    const refresh = () => {
      void loadDashboard({ silent: true });
    };
    const handleInspectionRequestRefresh = (payload?: {
      updatedAt?: string | null;
    }) => {
      // Update request marker first so dashboard card badge syncs across tabs.
      markInspectorRequestsUpdated(
        inspectorId,
        payload?.updatedAt ?? undefined,
      );
      void loadDashboard({ silent: true });
    };
    const handleSync = () => {
      setHasNewInspectionRequest(
        hasUnseenInspectorRequests(inspectorId, pendingRequestCountRef.current),
      );
    };

    socket.on(
      INSPECTOR_INSPECTION_REQUEST_EVENT,
      handleInspectionRequestRefresh,
    );
    socket.on(INSPECTOR_SCHEDULE_EVENT, refresh);
    window.addEventListener(
      INSPECTOR_REQUEST_NOTIFICATION_SYNC_EVENT,
      handleSync,
    );

    return () => {
      socket.off(
        INSPECTOR_INSPECTION_REQUEST_EVENT,
        handleInspectionRequestRefresh,
      );
      socket.off(INSPECTOR_SCHEDULE_EVENT, refresh);
      socket.disconnect();
      window.removeEventListener(
        INSPECTOR_REQUEST_NOTIFICATION_SYNC_EVENT,
        handleSync,
      );
    };
  }, [inspectorId, loadDashboard]);

  useEffect(() => {
    const updateViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);

    return () => {
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  const completedInspections =
    dashboard.resultBreakdown.passed +
    dashboard.resultBreakdown.forCompletion +
    dashboard.resultBreakdown.failed;
  const scheduledLoad = dashboard.analytics.activeSchedules;
  const monthlyTotal = dashboard.monthlyInspections.reduce(
    (sum, month) => sum + month.count,
    0,
  );

  const workloadTone =
    dashboard.analytics.overdueInspections > 0
      ? "Needs attention"
      : dashboard.pendingRequests === 0 && scheduledLoad === 0
        ? "Queue is clear"
        : dashboard.pendingRequests <= 3
          ? "Queue is manageable"
          : "Queue is building";

  const statCards: StatCard[] = [
    {
      label: "Pending Requests",
      value: dashboard.pendingRequests,
      note: "Waiting for inspection scheduling",
      icon: FiClipboard,
      surfaceClass: "bg-[#F4F8FC]",
      iconClass: "bg-white text-[#0F2942]",
      isUnread: hasNewInspectionRequest,
      path: "/home/inspector/inspection-requests",
    },
    {
      label: "Today's Inspections",
      value: dashboard.todayInspections,
      note: "Scheduled for today",
      icon: FiClock,
      surfaceClass: "bg-amber-50",
      iconClass: "bg-white text-amber-600",
    },
    {
      label: "Upcoming Inspections",
      value: dashboard.upcomingInspections,
      note: "Scheduled after today",
      icon: FiCalendar,
      surfaceClass: "bg-sky-50",
      iconClass: "bg-white text-sky-700",
    },
    {
      label: "Resolved Results",
      value: completedInspections,
      note: "Passed, for completion, and failed combined",
      icon: FiActivity,
      surfaceClass: "bg-emerald-50",
      iconClass: "bg-white text-emerald-700",
    },
  ];

  const resultChartData = useMemo(
    () =>
      [
        {
          label: "Passed",
          value: dashboard.resultBreakdown.passed,
          fill: "url(#inspectorPassedBar)",
          legendColor: "#22C55E",
          badgeFill: "#ECFDF3",
          badgeTextColor: "#15803D",
          note: "Applications cleared after inspection",
        },
        {
          label: "For Completion",
          value: dashboard.resultBreakdown.forCompletion,
          fill: "url(#inspectorCompletionBar)",
          legendColor: "#F59E0B",
          badgeFill: "#FFF7E8",
          badgeTextColor: "#B45309",
          note: "Requires owner follow-up work",
        },
        {
          label: "Failed",
          value: dashboard.resultBreakdown.failed,
          fill: "url(#inspectorFailedBar)",
          legendColor: "#F43F5E",
          badgeFill: "#FFF1F2",
          badgeTextColor: "#BE123C",
          note: "Did not pass inspection review",
        },
      ] satisfies InspectorResultChartDatum[],
    [dashboard.resultBreakdown],
  );

  const topOutcome = resultChartData.reduce<InspectorResultChartDatum | null>(
    (top, item) => {
      if (!top) return item;
      return item.value > top.value ? item : top;
    },
    null,
  );

  const resultChartMax = getChartUpperBound(
    Math.max(1, ...resultChartData.map((item) => item.value)),
  );
  const resultChartTicks = Array.from({ length: 5 }, (_, index) => {
    const step = resultChartMax / 4;
    return resultChartMax - step * index;
  });

  const monthlyChartMax = getChartUpperBound(
    Math.max(1, ...dashboard.monthlyInspections.map((item) => item.count)),
  );
  const monthlyChartTicks = Array.from({ length: 5 }, (_, index) => {
    const step = monthlyChartMax / 4;
    return monthlyChartMax - step * index;
  });
  const firstName = String(user?.firstName ?? "").trim() || "Inspector";
  const departmentLabel = String(user?.departmentName ?? "").trim();
  const performanceCards = [
    {
      label: "Scheduling Pressure",
      value: formatNumber(scheduledLoad),
      note:
        dashboard.analytics.rescheduledInspections > 0
          ? `${formatNumber(dashboard.analytics.rescheduledInspections)} currently rescheduled and still active.`
          : "All active schedules are on their latest booking.",
      accentClass: "bg-[#FCFDFE]",
    },
    {
      label: "Ready Assessments",
      value: formatNumber(dashboard.analytics.readyAssessments),
      note:
        dashboard.analytics.readyAssessments > 0
          ? "Scheduled visits have reached assessment time and can be submitted."
          : "No schedules have reached assessment time yet.",
      accentClass: "bg-amber-50",
    },
    {
      label: "Average Turnaround",
      value:
        dashboard.analytics.averageTurnaroundDays === null
          ? "No data yet"
          : `${formatMetricValue(dashboard.analytics.averageTurnaroundDays)} days`,
      note:
        dashboard.analytics.averageTurnaroundDays === null
          ? "This appears after completed inspection results are submitted."
          : "Average time from assignment to submitted result.",
      accentClass: "bg-sky-50",
    },
    {
      label: "Next Inspection",
      value: formatScheduleDateTime(dashboard.analytics.nextInspectionAt),
      note: dashboard.analytics.nextInspectionAt
        ? "Nearest future visit currently on your calendar."
        : "No future inspection is booked right now.",
      accentClass: "bg-emerald-50",
    },
  ];
  const isCompactLayout = viewportWidth !== null && viewportWidth < 640;
  const averageMonthlyInspectionsLabel = formatMetricValue(
    dashboard.analytics.averageMonthlyInspections,
  );

  const handleStatCardClick = (card: StatCard) => {
    if (!card.path) return;
    if (card.label === "Pending Requests") {
      markInspectorRequestsSeen(inspectorId);
      setHasNewInspectionRequest(false);
    }
    navigate(card.path);
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-3 md:gap-4">
      <section
        className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 md:p-6"
        data-inspector-tour="dashboard-hero"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {departmentLabel && (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
                {departmentLabel}
              </span>
            )}

            <h1 className="mt-3 text-[1.55rem] font-black leading-tight text-[#0F2942] sm:text-[2.1rem]">
              Inspector Dashboard
            </h1>
            <p className="mt-2 text-base font-semibold text-[#0F2942] sm:text-lg">
              Welcome back, {firstName}.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 sm:text-[0.95rem]">
              You currently have {formatNumber(dashboard.pendingRequests)}{" "}
              pending request{dashboard.pendingRequests === 1 ? "" : "s"},{" "}
              {formatNumber(scheduledLoad)} scheduled inspection
              {scheduledLoad === 1 ? "" : "s"}, and{" "}
              {formatNumber(completedInspections)} completed result
              {completedInspections === 1 ? "" : "s"} in this dashboard view.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={requestWalkthroughStart}
              className="inline-flex items-center gap-2 rounded-xl border border-[#0F2942]/10 bg-[#0F2942] px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#173654] sm:text-[11px]"
            >
              Replay Inspector Walkthrough
            </button>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              {workloadTone}
            </span>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <>
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 md:gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                onClick={() => handleStatCardClick(card)}
                className={`min-h-31 rounded-3xl border border-gray-100 p-4 shadow-sm sm:min-h-33 md:p-5 ${card.surfaceClass} ${
                  card.path
                    ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-[#EAF2FB]"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                        {card.label}
                      </p>
                      {card.isUnread && (
                        <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-[11px] font-black text-white">
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[1.75rem] font-black leading-none text-[#0F2942] sm:text-[2rem]">
                      {formatNumber(card.value)}
                    </p>
                  </div>

                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm ${card.iconClass}`}
                  >
                    <Icon className="text-lg" />
                  </div>
                </div>

                <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">
                  {card.note}
                </p>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch">
          <Suspense
            fallback={renderChartCardFallback(
              "Inspection Outcome Mix",
              "A quick look at how your completed inspections are ending.",
            )}
          >
            <InspectorOutcomeMixCard
              isCompactLayout={isCompactLayout}
              resultChartData={resultChartData}
              topOutcome={topOutcome}
              resultChartMax={resultChartMax}
              resultChartTicks={resultChartTicks}
            />
          </Suspense>

          <Suspense
            fallback={renderChartCardFallback(
              "Monthly Inspection Activity",
              "Completed inspection volume across the last 12 months.",
            )}
          >
            <InspectorMonthlyActivityCard
              isCompactLayout={isCompactLayout}
              monthlyInspections={dashboard.monthlyInspections}
              peakMonth={dashboard.peakMonth}
              monthlyTotal={monthlyTotal}
              averageMonthlyInspectionsLabel={averageMonthlyInspectionsLabel}
              busiestWeekday={dashboard.analytics.busiestWeekday}
              monthlyChartMax={monthlyChartMax}
              monthlyChartTicks={monthlyChartTicks}
            />
          </Suspense>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {performanceCards.map((card) => (
            <article
              key={card.label}
              className={`rounded-2xl border border-gray-100 p-4 shadow-sm ${card.accentClass}`}
            >
              <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
                {card.label}
              </p>
              <p className="mt-2 text-lg font-black leading-tight text-[#0F2942]">
                {card.value}
              </p>
              <p className="mt-1 text-sm font-medium leading-relaxed text-gray-500">
                {card.note}
              </p>
            </article>
          ))}
        </section>
      </>
    </div>
  );
}
