import { getBploDashboardAnalyticsApi } from "@/api/bplo_admin/bplo_admin.api";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  ADMIN_DASHBOARD_ANALYTICS_EVENT,
  createBploAdminSocket,
} from "@/socket/bplo_admin.socket";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useBploAdminWalkthroughStore } from "@/stores/bplo_admin/bplo-admin-walkthrough.store";
import type { BploDashboardAnalyticsType } from "@/types/bplo_admin/bplo_admin.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiCheckSquare,
  FiClipboard,
  FiShield,
  FiTrendingUp,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardChartDatum = {
  key: string;
  label: string;
  shortLabel: string;
  count: number;
  fill: string;
};

const initialDashboardAnalytics: BploDashboardAnalyticsType = {
  summary: {
    validityRecords: 0,
    pendingInspectionRequests: 0,
    permitApprovalQueue: 0,
    totalQueueItems: 0,
    permitTypesInView: 0,
  },
  validityStatusBreakdown: [
    { key: "active", label: "Active", count: 0 },
    { key: "for_renewal", label: "For Renewal", count: 0 },
    { key: "inactive", label: "Inactive", count: 0 },
    { key: "delinquent", label: "Delinquent", count: 0 },
  ],
  permitTypeBreakdown: [],
  queueBreakdown: [
    { key: "inspection_requests", label: "Inspection Requests", count: 0 },
    { key: "permit_approval", label: "Permit Approval Queue", count: 0 },
  ],
  insights: {
    dominantValidityStatus: null,
    leadingPermitType: null,
  },
  generatedAt: "",
};

const formatNumber = (value: number) =>
  Number(value ?? 0).toLocaleString("en-PH");

const truncateLabel = (value: string, maxLength = 16) =>
  value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;

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

const chartTooltipStyle = {
  borderRadius: 16,
  border: "1px solid #DCE7F3",
  boxShadow: "0 18px 38px rgba(15, 41, 66, 0.12)",
  backgroundColor: "#FFFFFF",
};

const validityColorMap = {
  active: "#22C55E",
  for_renewal: "#F59E0B",
  inactive: "#F43F5E",
  delinquent: "#F97316",
} as const;

const normalizeDashboardAnalytics = (
  analytics?: Partial<BploDashboardAnalyticsType> | null,
): BploDashboardAnalyticsType => ({
  ...initialDashboardAnalytics,
  ...analytics,
  summary: {
    ...initialDashboardAnalytics.summary,
    ...(analytics?.summary ?? {}),
  },
  validityStatusBreakdown: Array.isArray(analytics?.validityStatusBreakdown)
    ? analytics.validityStatusBreakdown
    : initialDashboardAnalytics.validityStatusBreakdown,
  permitTypeBreakdown: Array.isArray(analytics?.permitTypeBreakdown)
    ? analytics.permitTypeBreakdown
    : initialDashboardAnalytics.permitTypeBreakdown,
  queueBreakdown: Array.isArray(analytics?.queueBreakdown)
    ? analytics.queueBreakdown
    : initialDashboardAnalytics.queueBreakdown,
  insights: {
    ...initialDashboardAnalytics.insights,
    ...(analytics?.insights ?? {}),
  },
  generatedAt: String(analytics?.generatedAt ?? initialDashboardAnalytics.generatedAt),
});

export default function BploAdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const requestWalkthroughStart = useBploAdminWalkthroughStore(
    (state) => state.requestStart,
  );
  const [dashboard, setDashboard] = useState<BploDashboardAnalyticsType>(
    initialDashboardAnalytics,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  const loadDashboard = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getBploDashboardAnalyticsApi();
      // Normalize partial payloads so cards/charts can render without null checks everywhere.
      setDashboard(normalizeDashboardAnalytics(response.data));
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard.";
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(apiError?.response?.data?.message ?? errorMessage);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    const socket = createBploAdminSocket();

    const handleAnalyticsUpdate = (nextAnalytics: BploDashboardAnalyticsType) => {
      // Live updates replace dashboard state and clear transient load/error states.
      setDashboard(normalizeDashboardAnalytics(nextAnalytics));
      setError(null);
      setIsLoading(false);
    };

    socket.on(ADMIN_DASHBOARD_ANALYTICS_EVENT, handleAnalyticsUpdate);

    return () => {
      socket.off(ADMIN_DASHBOARD_ANALYTICS_EVENT, handleAnalyticsUpdate);
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

  const firstName = String(user?.firstName ?? "").trim() || "BPLO Admin";
  const isCompactLayout = viewportWidth !== null && viewportWidth < 640;
  const isTabletLayout = viewportWidth !== null && viewportWidth < 1024;

  const validityRecords = Number(dashboard.summary.validityRecords ?? 0);
  const pendingInspectionRequests = Number(
    dashboard.summary.pendingInspectionRequests ?? 0,
  );
  const permitApprovalQueue = Number(dashboard.summary.permitApprovalQueue ?? 0);
  const totalQueueItems = Number(dashboard.summary.totalQueueItems ?? 0);
  const permitTypesInView = Number(dashboard.summary.permitTypesInView ?? 0);

  const statusChartData: DashboardChartDatum[] =
    dashboard.validityStatusBreakdown.map((item) => ({
      key: item.key,
      label: item.label,
      shortLabel:
        item.key === "for_renewal"
          ? isCompactLayout
            ? "Renew."
            : "Renewal"
          : item.key === "delinquent"
            ? isCompactLayout
              ? "Delinq."
              : "Delinquent"
            : item.label,
      count: Number(item.count ?? 0),
      fill: validityColorMap[item.key],
    }));
  const hasStatusChartData = statusChartData.some((item) => item.count > 0);
  const statusChartMax = getChartUpperBound(
    Math.max(...statusChartData.map((item) => item.count), 0),
  );

  const permitTypePalette = [
    "#0F2942",
    "#1D4ED8",
    "#0EA5E9",
    "#14B8A6",
    "#F59E0B",
    "#EF4444",
  ];
  const permitTypeChartData: DashboardChartDatum[] =
    dashboard.permitTypeBreakdown.slice(0, 5).map((item, index) => ({
      key: item.permitType.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      label: item.permitType,
      shortLabel: truncateLabel(
        item.permitType,
        isCompactLayout ? 12 : isTabletLayout ? 14 : 18,
      ),
      count: Number(item.count ?? 0),
      fill: permitTypePalette[index % permitTypePalette.length],
    }));
  const leadingPermitType =
    (dashboard.insights.leadingPermitType
      ? permitTypeChartData.find(
          (item) => item.label === dashboard.insights.leadingPermitType,
        )
      : null) ??
    permitTypeChartData[0] ??
    null;
  const permitTypeChartMax = getChartUpperBound(
    Math.max(...permitTypeChartData.map((item) => item.count), 0),
  );

  const statusChartMargin = isCompactLayout
    ? { top: 10, right: 0, left: -22, bottom: 0 }
    : isTabletLayout
      ? { top: 10, right: 8, left: -16, bottom: 0 }
      : { top: 10, right: 12, left: -12, bottom: 0 };
  const permitTypeChartMargin = isCompactLayout
    ? { top: 8, right: 6, left: -8, bottom: 0 }
    : isTabletLayout
      ? { top: 10, right: 10, left: 0, bottom: 0 }
      : { top: 10, right: 16, left: 10, bottom: 0 };
  const chartPanelHeight = isCompactLayout ? 224 : isTabletLayout ? 256 : 288;
  const responsiveChartInitialDimension = {
    width: isCompactLayout ? 320 : isTabletLayout ? 420 : 560,
    height: chartPanelHeight,
  };
  const permitTypeLabelWidth = isCompactLayout ? 82 : isTabletLayout ? 96 : 110;
  const sharedTooltipStyle = {
    ...chartTooltipStyle,
    borderRadius: isCompactLayout ? 14 : 16,
    padding: isCompactLayout ? "8px 10px" : "10px 12px",
  };

  const dominantValiditySegment =
    (dashboard.insights.dominantValidityStatus
      ? dashboard.validityStatusBreakdown.find(
          (item) => item.key === dashboard.insights.dominantValidityStatus,
        )
      : null) ?? null;

  const heroSummary =
    totalQueueItems > 0 || validityRecords > 0
      ? `You currently have ${formatNumber(pendingInspectionRequests)} inspection request${pendingInspectionRequests === 1 ? "" : "s"} waiting for BPLO action, ${formatNumber(permitApprovalQueue)} application${permitApprovalQueue === 1 ? "" : "s"} in the final permit approval queue, and ${formatNumber(validityRecords)} released permit${validityRecords === 1 ? "" : "s"} being monitored for validity.`
      : "There are no routed applications or released permits in the BPLO view yet. Counts will populate automatically as applications move through inspection, approval, and release.";

  const heroStatCards = [
    {
      label: "Validity Records",
      value: validityRecords,
      note: "Tracked released permits",
      icon: FiShield,
      surfaceClass: "bg-[#F4F8FC]",
      iconClass: "bg-white text-[#0F2942]",
    },
    {
      label: "Inspection Requests",
      value: pendingInspectionRequests,
      note: "Pending BPLO review",
      icon: FiClipboard,
      surfaceClass: "bg-emerald-50",
      iconClass: "bg-white text-emerald-700",
    },
    {
      label: "Permit Approvals",
      value: permitApprovalQueue,
      note: "Applications in queue",
      icon: FiCheckSquare,
      surfaceClass: "bg-amber-50",
      iconClass: "bg-white text-amber-700",
    },
    {
      label: "Permit Types",
      value: permitTypesInView,
      note: "Visible across BPLO data",
      icon: FiBarChart2,
      surfaceClass: "bg-sky-50",
      iconClass: "bg-white text-sky-700",
    },
  ];

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 md:gap-4">
      <section
        className="rounded-3xl border border-gray-100 bg-white p-3.5 shadow-sm sm:p-4 md:p-5"
        data-bplo-admin-tour="dashboard-hero"
      >
        <div className="rounded-[28px] border border-[#DCE7F3] bg-[radial-gradient(circle_at_top_left,rgba(160,210,255,0.22),transparent_45%),linear-gradient(135deg,#FFFFFF,#F7FBFF)] p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-[1.5rem] font-black leading-tight text-[#0F2942] sm:text-[1.85rem] md:text-[2.15rem]">
                BPLO Admin Dashboard
              </h1>
              <p className="mt-2 text-base font-semibold text-[#0F2942] sm:text-[1.05rem]">
                Welcome back, {firstName}.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-[0.95rem]">
                {heroSummary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <button
                type="button"
                onClick={requestWalkthroughStart}
                className="inline-flex items-center gap-2 rounded-xl border border-[#0F2942]/10 bg-[#0F2942] px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#173654] sm:text-[11px]"
              >
                Replay BPLO Admin Walkthrough
              </button>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">
                <FiCheckSquare />
                {formatNumber(totalQueueItems)} queue item
                {totalQueueItems === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
                <FiBarChart2 />
                {permitTypesInView} permit type
                {permitTypesInView === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {heroStatCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className={`min-h-34 rounded-3xl border border-gray-100 p-4 shadow-sm sm:min-h-36 md:p-5 ${card.surfaceClass}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-[1.7rem] font-black leading-none text-[#0F2942] sm:text-[1.85rem]">
                    {formatNumber(card.value)}
                  </p>
                </div>

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl shadow-sm ${card.iconClass}`}
                >
                  <Icon className="text-lg" />
                </div>
              </div>

              <p className="mt-3 text-sm font-medium text-gray-500">
                {card.note}
              </p>
            </article>
          );
        })}
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch">
          <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-[#0F2942]">
                  Permit Validity Status Mix
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Current released permits grouped by their BPLO validity
                  status.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
                <FiTrendingUp />
                {dominantValiditySegment
                  ? `${dominantValiditySegment.label} leads`
                  : "No validity data yet"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {statusChartData.map((item) => (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-gray-600"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.label}
                </span>
              ))}
            </div>

            <div
              className="mt-4 w-full min-w-0"
              style={{ height: chartPanelHeight }}
            >
              {!hasStatusChartData ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FBFDFF] px-6 text-center">
                  <div>
                    <p className="text-base font-black text-[#0F2942]">
                      No permit validity records yet
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                      Once permits reach the released registry, their active,
                      renewal, inactive, and delinquent totals will appear here
                      automatically.
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  initialDimension={responsiveChartInitialDimension}
                >
                  <BarChart
                    data={statusChartData}
                    margin={statusChartMargin}
                    barCategoryGap={isCompactLayout ? "18%" : "24%"}
                  >
                    <CartesianGrid
                      vertical={false}
                      stroke="#E7EEF6"
                      strokeDasharray="0"
                    />
                    <XAxis
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      tick={{
                        fill: "#64748B",
                        fontSize: isCompactLayout ? 10 : 12,
                        fontWeight: 700,
                      }}
                    />
                    <YAxis
                      allowDecimals={false}
                      domain={[0, statusChartMax]}
                      tickLine={false}
                      axisLine={false}
                      width={isCompactLayout ? 28 : 34}
                      tickFormatter={(value) => formatNumber(Number(value))}
                      tick={{
                        fill: "#64748B",
                        fontSize: isCompactLayout ? 10 : 12,
                        fontWeight: 700,
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15, 41, 66, 0.04)" }}
                      contentStyle={sharedTooltipStyle}
                      formatter={(value) => [
                        `${formatNumber(Number(value))} permit${Number(value) === 1 ? "" : "s"}`,
                        "Count",
                      ]}
                    />
                    <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                      {statusChartData.map((item) => (
                        <Cell key={item.key} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>

          <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-black text-[#0F2942]">
                  Permit Type Distribution
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  Current volume by permit type across BPLO validity,
                  inspection, and approval views.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                <FiBarChart2 />
                {leadingPermitType
                  ? `${leadingPermitType.shortLabel} leads`
                  : "Awaiting permit data"}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {permitTypeChartData.map((item) => (
                <span
                  key={item.key}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-gray-600"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  {item.shortLabel}
                </span>
              ))}
            </div>

            <div
              className="mt-4 w-full min-w-0"
              style={{ height: chartPanelHeight }}
            >
              {permitTypeChartData.length === 0 ? (
                <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FBFDFF] px-6 text-center">
                  <div>
                    <p className="text-base font-black text-[#0F2942]">
                      No permit types to chart yet
                    </p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                      Permit type distribution will appear here as routed and
                      released applications enter the BPLO workspace.
                    </p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  initialDimension={responsiveChartInitialDimension}
                >
                  <BarChart
                    data={permitTypeChartData}
                    layout="vertical"
                    margin={permitTypeChartMargin}
                    barCategoryGap={isCompactLayout ? "16%" : "22%"}
                  >
                    <CartesianGrid
                      horizontal={false}
                      stroke="#E7EEF6"
                      strokeDasharray="0"
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      domain={[0, permitTypeChartMax]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(Number(value))}
                      tick={{
                        fill: "#64748B",
                        fontSize: isCompactLayout ? 10 : 12,
                        fontWeight: 700,
                      }}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      tickLine={false}
                      axisLine={false}
                      width={permitTypeLabelWidth}
                      tick={{
                        fill: "#64748B",
                        fontSize: isCompactLayout ? 10 : 12,
                        fontWeight: 700,
                      }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(15, 41, 66, 0.04)" }}
                      contentStyle={sharedTooltipStyle}
                      labelFormatter={(_, payload) =>
                        String(payload?.[0]?.payload?.label ?? "")
                      }
                      formatter={(value) => [
                        `${formatNumber(Number(value))} item${Number(value) === 1 ? "" : "s"}`,
                        "Count",
                      ]}
                    />
                    <Bar dataKey="count" radius={[0, 12, 12, 0]}>
                      {permitTypeChartData.map((item) => (
                        <Cell key={item.key} fill={item.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
      </section>
    </div>
  );
}
