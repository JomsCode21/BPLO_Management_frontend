import {
  getSuperAdminDashboardStatsApi,
  type SuperAdminDashboardRoleKey,
  type SuperAdminDashboardStats,
} from "@/api/super_admin/super_admin.api";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createSuperAdminSocket,
  DASHBOARD_STATS_EVENT,
} from "@/socket/super_admin.socket";
import { useSuperAdminWalkthroughStore } from "@/stores/super_admin/super-admin-walkthrough.store";
import { useAuthStore } from "@/stores/auth/auth.store";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  FiActivity,
  FiBarChart2,
  FiCheckCircle,
  FiClipboard,
  FiCreditCard,
  FiShield,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const initialStats: SuperAdminDashboardStats = {
  admins: 0,
  inspectors: 0,
  evaluators: 0,
  departmentTreasurers: 0,
  mainTreasurers: 0,
  analytics: {
    totalOfficers: 0,
    activeRoles: 0,
    treasuryCoverage: 0,
    coreOperations: 0,
    dominantRole: null,
    leanestActiveRole: null,
  },
  workflow: {
    totalApplications: 0,
    activeApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingEvaluation: 0,
    pendingInspectionReview: 0,
    activeInspections: 0,
    awaitingPermitApproval: 0,
    readyForRelease: 0,
    applicationsWithPayments: 0,
    awaitingPayment: 0,
    fullyPaidApplications: 0,
  },
};

type RoleCard = {
  key: SuperAdminDashboardRoleKey;
  label: string;
  shortLabel: string;
  value: number;
  note: string;
  icon: ComponentType<{ className?: string }>;
  surfaceClass: string;
  iconClass: string;
  chartColor: string;
  chartFill: string;
};

type WorkflowCard = {
  key: string;
  label: string;
  value: number;
  note: string;
  icon: ComponentType<{ className?: string }>;
  surfaceClass: string;
  iconClass: string;
};

const normalizeStats = (
  stats?: Partial<SuperAdminDashboardStats> | null,
): SuperAdminDashboardStats => ({
  ...initialStats,
  ...stats,
  analytics: {
    ...initialStats.analytics,
    ...(stats?.analytics ?? {}),
  },
  workflow: {
    ...initialStats.workflow,
    ...(stats?.workflow ?? {}),
  },
});

const formatNumber = (value: number) =>
  Number(value ?? 0).toLocaleString("en-PH");

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

export default function SuperAdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const requestWalkthroughStart = useSuperAdminWalkthroughStore(
    (state) => state.requestStart,
  );
  const [stats, setStats] = useState<SuperAdminDashboardStats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const requestVersionRef = useRef(0);
  const isMountedRef = useRef(true);

  const loadDashboardStats = async () => {
    const requestVersion = ++requestVersionRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const response = await getSuperAdminDashboardStatsApi();
      if (
        !isMountedRef.current ||
        requestVersion !== requestVersionRef.current
      ) {
        return;
      }

      setStats(normalizeStats(response.data));
      setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        setError(null);
        return;
      }

      console.error("Failed to fetch super admin dashboard stats:", err);

      if (
        !isMountedRef.current ||
        requestVersion !== requestVersionRef.current
      ) {
        return;
      }

      setError("Failed to load dashboard data.");
    } finally {
      if (
        isMountedRef.current &&
        requestVersion === requestVersionRef.current
      ) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void loadDashboardStats();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const socket = createSuperAdminSocket();

    const handleStatsUpdate = (nextStats: SuperAdminDashboardStats) => {
      // Bump request version so late HTTP responses cannot overwrite live socket data.
      requestVersionRef.current += 1;

      if (!isMountedRef.current) return;

      setStats(normalizeStats(nextStats));
      setError(null);
      setIsLoading(false);
    };

    socket.on(DASHBOARD_STATS_EVENT, handleStatsUpdate);

    return () => {
      socket.off(DASHBOARD_STATS_EVENT, handleStatsUpdate);
      socket.disconnect();
    };
  }, []);

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

  const firstName = String(user?.firstName ?? "").trim() || "Super Admin";

  const roleCards = useMemo<RoleCard[]>(
    () => [
      {
        key: "admins",
        label: "Admins",
        shortLabel: "Admins",
        value: stats.admins,
        note: "Permit approvals and administrative control",
        icon: FiShield,
        surfaceClass: "bg-[#F4F8FC]",
        iconClass: "bg-white text-[#0F2942]",
        chartColor: "#0F2942",
        chartFill: "#0F2942",
      },
      {
        key: "inspectors",
        label: "Inspectors",
        shortLabel: "Inspectors",
        value: stats.inspectors,
        note: "Field inspections and scheduling workload",
        icon: FiUserCheck,
        surfaceClass: "bg-emerald-50",
        iconClass: "bg-white text-emerald-700",
        chartColor: "#22C55E",
        chartFill: "#22C55E",
      },
      {
        key: "evaluators",
        label: "Evaluators",
        shortLabel: "Evaluators",
        value: stats.evaluators,
        note: "Application review and compliance checks",
        icon: FiActivity,
        surfaceClass: "bg-sky-50",
        iconClass: "bg-white text-sky-700",
        chartColor: "#0EA5E9",
        chartFill: "#0EA5E9",
      },
      {
        key: "departmentTreasurers",
        label: "Dept Treasurers",
        shortLabel: "Dept Treas.",
        value: stats.departmentTreasurers,
        note: "Department-level fee assessment coverage",
        icon: FiClipboard,
        surfaceClass: "bg-amber-50",
        iconClass: "bg-white text-amber-700",
        chartColor: "#F59E0B",
        chartFill: "#F59E0B",
      },
      {
        key: "mainTreasurers",
        label: "Main Treasurers",
        shortLabel: "Main Treas.",
        value: stats.mainTreasurers,
        note: "Central payment confirmation and release",
        icon: FiCreditCard,
        surfaceClass: "bg-rose-50",
        iconClass: "bg-white text-rose-700",
        chartColor: "#F43F5E",
        chartFill: "#F43F5E",
      },
    ],
    [stats],
  );

  const totalOfficers = stats.analytics.totalOfficers;
  const activeRoles = stats.analytics.activeRoles;
  const dominantRole = stats.analytics.dominantRole;
  const workflowCards: WorkflowCard[] = [
    {
      key: "totalApplications",
      label: "Applications in System",
      value: stats.workflow.totalApplications,
      note: "All submitted permit applications across the live workflow.",
      icon: FiClipboard,
      surfaceClass: "bg-[#F4F8FC]",
      iconClass: "bg-white text-[#0F2942]",
    },
    {
      key: "activeApplications",
      label: "Active Pipeline",
      value: stats.workflow.activeApplications,
      note:
        stats.workflow.pendingEvaluation > 0
          ? `${formatNumber(stats.workflow.pendingEvaluation)} awaiting evaluator review.`
          : "No applications are waiting on evaluator intake right now.",
      icon: FiActivity,
      surfaceClass: "bg-emerald-50",
      iconClass: "bg-white text-emerald-700",
    },
    {
      key: "awaitingPayment",
      label: "Awaiting Payment",
      value: stats.workflow.awaitingPayment,
      note:
        stats.workflow.applicationsWithPayments > 0
          ? `${formatNumber(stats.workflow.applicationsWithPayments)} applications already have generated payment assessments.`
          : "No payment assessments have been generated yet.",
      icon: FiCreditCard,
      surfaceClass: "bg-amber-50",
      iconClass: "bg-white text-amber-700",
    },
    {
      key: "readyForRelease",
      label: "Ready for Release",
      value: stats.workflow.readyForRelease,
      note:
        stats.workflow.approvedApplications > 0
          ? `${formatNumber(stats.workflow.approvedApplications)} approved applications are in validity processing.`
          : "No approved applications are waiting in permit validity.",
      icon: FiCheckCircle,
      surfaceClass: "bg-sky-50",
      iconClass: "bg-white text-sky-700",
    },
  ];

  const chartData = [...roleCards].sort((a, b) => {
    if (b.value !== a.value) return b.value - a.value;
    return a.label.localeCompare(b.label);
  });
  const chartMax = getChartUpperBound(
    Math.max(1, ...chartData.map((item) => item.value)),
  );
  const chartTicks = Array.from({ length: 5 }, (_, index) => {
    const step = chartMax / 4;
    return step * index;
  });
  const isCompactLayout = viewportWidth !== null && viewportWidth < 640;
  const isTabletLayout = viewportWidth !== null && viewportWidth < 1024;
  const chartMargin = isCompactLayout
    ? { top: 8, right: 8, left: -18, bottom: 0 }
    : isTabletLayout
      ? { top: 8, right: 16, left: -6, bottom: 4 }
      : { top: 8, right: 28, left: 8, bottom: 8 };
  const chartTooltipStyle = {
    borderRadius: isCompactLayout ? "14px" : "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 18px 40px rgba(15, 41, 66, 0.12)",
    padding: isCompactLayout ? "8px 10px" : "10px 12px",
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  const displayValue = (value: number) => formatNumber(value);

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-3 md:gap-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section
        className="rounded-3xl border border-gray-100 bg-white p-3.5 shadow-sm sm:p-4 md:p-5"
        data-super-admin-tour="dashboard-hero"
      >
        <div className="rounded-[28px] border border-[#DCE7F3] bg-[radial-gradient(circle_at_top_left,rgba(160,210,255,0.22),transparent_45%),linear-gradient(135deg,#FFFFFF,#F7FBFF)] p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live officer overview
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              5 staffing roles tracked
            </span>
          </div>

          <h1 className="mt-3 text-[1.7rem] font-black leading-tight text-[#0F2942] sm:text-[2.2rem]">
            Super Admin Dashboard
          </h1>
          <p className="mt-1.5 text-[0.98rem] font-semibold text-[#0F2942] sm:text-[1.05rem]">
            Welcome back, {firstName}.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
            This control center keeps a live view of staffing coverage across
            the core permit workflow teams, from evaluation and inspection to
            treasury release.
          </p>

          <button
            type="button"
            onClick={requestWalkthroughStart}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#0F2942]/10 bg-[#0F2942] px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#173654] sm:text-[11px]"
          >
            Replay Super Admin Walkthrough
          </button>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1.5 text-xs font-black text-[#0F2942] sm:text-sm">
              <FiUsers />
              {displayValue(totalOfficers)} officer accounts
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-700 sm:text-sm">
              <FiBarChart2 />
              {`${activeRoles}/5 roles currently staffed`}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-black text-sky-700 sm:text-sm">
              <FiTrendingUp />
              {dominantRole
                ? `${dominantRole.label} lead the current mix`
                : "Awaiting officer data"}
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 md:gap-4">
        {roleCards.map((card) => {
          const Icon = card.icon;
          const share =
            totalOfficers > 0 ? Math.round((card.value / totalOfficers) * 100) : 0;

          return (
            <article
              key={card.key}
              className={`min-h-38 rounded-[26px] border border-gray-100 p-4 shadow-sm sm:min-h-42 md:p-5 ${card.surfaceClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-[1.75rem] font-black leading-none text-[#0F2942] sm:text-[1.9rem]">
                    {displayValue(card.value)}
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
              <p className="mt-3 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400 sm:text-xs">
                {totalOfficers > 0
                  ? `${share}% of tracked officer accounts`
                  : "Waiting for first account"}
              </p>
            </article>
          );
        })}
      </section>

      <section>
        <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#0F2942]">
                Officer Distribution
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Current staffing totals by operational role.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
              <FiTrendingUp />
              {dominantRole && dominantRole.count > 0
                ? `${dominantRole.label} lead`
                : "No staffing yet"}
            </span>
          </div>

          <div className="mt-4 h-64 min-h-64 w-full sm:h-72 lg:h-80">
            {totalOfficers === 0 ? (
              <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FBFDFF] px-6 text-center">
                <div>
                  <p className="text-base font-black text-[#0F2942]">
                    No officer accounts to chart yet
                  </p>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                    Once staffing accounts are added, the live role
                    distribution will appear here automatically.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={chartMargin}
                  barCategoryGap={isCompactLayout ? "18%" : "22%"}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="#E7EEF6"
                    strokeDasharray="0"
                  />
                  <XAxis
                    type="number"
                    domain={[0, chartMax]}
                    ticks={chartTicks}
                    allowDecimals={false}
                    tickFormatter={(value) => formatNumber(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    tick={{
                      fill: "#94A3B8",
                      fontSize: isCompactLayout ? 10 : 11,
                      fontWeight: 700,
                    }}
                    tickMargin={isCompactLayout ? 6 : 10}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortLabel"
                    tickLine={false}
                    axisLine={false}
                    width={isCompactLayout ? 82 : isTabletLayout ? 96 : 110}
                    tick={{
                      fill: "#0F2942",
                      fontSize: isCompactLayout ? 10 : 12,
                      fontWeight: 800,
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(15, 41, 66, 0.04)" }}
                    contentStyle={chartTooltipStyle}
                    formatter={(value) => [
                      `${formatNumber(Number(value))} officers`,
                      "Active accounts",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 16, 16, 0]}
                    maxBarSize={isCompactLayout ? 22 : 28}
                  >
                    {chartData.map((item) => (
                      <Cell key={item.key} fill={item.chartFill} />
                    ))}
                    {!isCompactLayout && (
                      <LabelList
                        dataKey="value"
                        position="right"
                        offset={10}
                        formatter={(value) => formatNumber(Number(value ?? 0))}
                        fill="#0F2942"
                        fontSize={12}
                        fontWeight={800}
                      />
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 grid gap-2 text-xs font-semibold text-gray-600 sm:flex sm:flex-wrap sm:text-sm">
            <span className="rounded-full bg-[#F4F8FC] px-3 py-2 text-[#0F2942] sm:px-3.5">
              {displayValue(totalOfficers)} tracked officer accounts
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 sm:px-3.5">
              {displayValue(activeRoles)} active roles with assigned staff
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700 sm:px-3.5">
              {displayValue(stats.analytics.treasuryCoverage)} treasury seats staffed
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 sm:px-3.5">
              {displayValue(stats.analytics.coreOperations)} core workflow seats active
            </span>
          </div>
        </article>
      </section>

      <section>
        <article className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-black text-[#0F2942]">
                Workflow Snapshot
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Live permit movement across evaluation, inspection, payment,
                and release.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
              <FiBarChart2 />
              {`${displayValue(stats.workflow.activeApplications)} applications in motion`}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {workflowCards.map((card) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.key}
                  className={`min-h-37 rounded-3xl border border-gray-100 p-4 sm:min-h-40 ${card.surfaceClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                        {card.label}
                      </p>
                      <p className="mt-3 text-[1.65rem] font-black leading-none text-[#0F2942] sm:text-[1.85rem]">
                        {displayValue(card.value)}
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
          </div>

          <div className="mt-4 grid gap-2 text-xs font-semibold text-gray-600 sm:flex sm:flex-wrap sm:text-sm">
            <span className="rounded-full bg-[#F4F8FC] px-3 py-2 text-[#0F2942] sm:px-3.5">
              Evaluator queue: {displayValue(stats.workflow.pendingEvaluation)}
            </span>
            <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700 sm:px-3.5">
              Inspection review: {displayValue(stats.workflow.pendingInspectionReview)}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 sm:px-3.5">
              Field inspection: {displayValue(stats.workflow.activeInspections)}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 sm:px-3.5">
              Permit approval: {displayValue(stats.workflow.awaitingPermitApproval)}
            </span>
            <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700 sm:px-3.5">
              Fully paid: {displayValue(stats.workflow.fullyPaidApplications)}
            </span>
          </div>
        </article>
      </section>

    </div>
  );
}
