import {
  getDepartmentFeeAssessmentTemplateApi,
  getDepartmentTreasurerDashboardApi,
  getDepartmentTreasurerPayersApi,
} from "@/api/treasurer/treasurer.api";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createTreasurerSocket,
  DEPARTMENT_TREASURER_PAYMENT_EVENT,
} from "@/socket/treasurer.socket";
import { useAuthStore } from "@/stores/auth/auth.store";
import DepartmentTreasurerPaymentStatusCard from "@/components/department_treasurer/dashboard/DepartmentTreasurerPaymentStatusCard";
import DepartmentTreasurerRecentPendingActivityCard from "@/components/department_treasurer/dashboard/DepartmentTreasurerRecentPendingActivityCard";
import DepartmentTreasurerSummaryCards, {
  type DepartmentTreasurerSummaryCard,
} from "@/components/department_treasurer/dashboard/DepartmentTreasurerSummaryCards";
import DepartmentTreasurerTrendCard from "@/components/department_treasurer/dashboard/DepartmentTreasurerTrendCard";
import type {
  DepartmentFeeAssessmentTemplateType,
  DepartmentPayerType,
  TreasurerDashboardType,
} from "@/types/treasurer/treasurer.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useMemo, useState } from "react";
import {
  formatCurrency,
  formatNumber,
  type StatusChartDatum,
  type TimeWindow,
  type TrendPoint,
} from "@/components/department_treasurer/dashboard/shared";
import {
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiTrendingUp,
} from "react-icons/fi";

const initialStats: TreasurerDashboardType = {
  totalAssessments: 0,
  totalPending: 0,
  totalPaid: 0,
  totalAmountDue: 0,
};

const normalizePaymentStatus = (value?: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase() === "pending"
    ? "pending"
    : "paid";

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const addDays = (value: Date, days: number) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);

const getDateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;

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

const buildTrendSeries = (
  records: DepartmentPayerType[],
  timeWindow: TimeWindow,
) => {
  const today = startOfDay(new Date());
  const startDate = addDays(today, -(timeWindow - 1));

  const buckets: TrendPoint[] = Array.from({ length: timeWindow }, (_, index) => {
    const day = addDays(startDate, index);

    return {
      key: getDateKey(day),
      label: new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
      }).format(day),
      fullLabel: new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(day),
      count: 0,
    };
  });

  const bucketIndex = new Map(
    buckets.map((bucket, index) => [bucket.key, index] as const),
  );

  records.forEach((record) => {
    if (!record.generatedAt) return;

    const generatedAt = new Date(record.generatedAt);
    if (Number.isNaN(generatedAt.getTime())) return;

    const normalizedDate = startOfDay(generatedAt);
    if (normalizedDate < startDate || normalizedDate > today) return;

    const targetIndex = bucketIndex.get(getDateKey(normalizedDate));
    if (targetIndex === undefined) return;

    buckets[targetIndex].count += 1;
  });

  return buckets;
};

export default function DepartmentTreasurerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<TreasurerDashboardType>(initialStats);
  const [records, setRecords] = useState<DepartmentPayerType[]>([]);
  const [template, setTemplate] =
    useState<DepartmentFeeAssessmentTemplateType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(7);

  const loadDashboard = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;

    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const [statsResponse, payersResponse, templateResponse] =
        await Promise.all([
          // Pull summary, payer feed, and department template together so cards
          // and labels are always aligned to the same refresh cycle.
          getDepartmentTreasurerDashboardApi(),
          getDepartmentTreasurerPayersApi(),
          getDepartmentFeeAssessmentTemplateApi(),
        ]);

      setStats(statsResponse.data ?? initialStats);
      setRecords(payersResponse.data ?? []);
      setTemplate(templateResponse.data ?? null);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load department treasurer dashboard.",
        );
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  useEffect(() => {
    const socket = createTreasurerSocket();
    socket.on(DEPARTMENT_TREASURER_PAYMENT_EVENT, () => {
      // Silent refresh keeps dashboard current when payment status changes.
      void loadDashboard({ silent: true });
    });

    return () => {
      socket.off(DEPARTMENT_TREASURER_PAYMENT_EVENT);
      socket.disconnect();
    };
  }, []);

  const sortedRecords = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          new Date(b.generatedAt ?? "").getTime() -
          new Date(a.generatedAt ?? "").getTime(),
      ),
    [records],
  );

  const pendingRecords = useMemo(
    () =>
      sortedRecords.filter(
        (record) => normalizePaymentStatus(record.paymentStatus) === "pending",
      ),
    [sortedRecords],
  );

  const paidRecords = useMemo(
    () =>
      sortedRecords.filter(
        (record) => normalizePaymentStatus(record.paymentStatus) === "paid",
      ),
    [sortedRecords],
  );

  const settledRate =
    stats.totalAssessments === 0
      ? 0
      : Math.round((stats.totalPaid / stats.totalAssessments) * 100);

  const collectedAmount = paidRecords.reduce(
    (sum, record) => sum + Number(record.totalAmount ?? 0),
    0,
  );

  const latestAssessmentAt = sortedRecords[0]?.generatedAt ?? null;
  const departmentName =
    String(template?.departmentName ?? user?.departmentName ?? "").trim() ||
    "Your Department";

  const statusChartData: StatusChartDatum[] = [
    {
      label: "Paid",
      value: Number(stats.totalPaid ?? 0),
      fill: "url(#departmentTreasurerPaidBar)",
    },
    {
      label: "Pending",
      value: Number(stats.totalPending ?? 0),
      fill: "url(#departmentTreasurerPendingBar)",
    },
  ];

  const statusChartMax = getChartUpperBound(
    Math.max(...statusChartData.map((item) => item.value), 0),
  );

  const trendSeries = useMemo(
    () => buildTrendSeries(sortedRecords, timeWindow),
    [sortedRecords, timeWindow],
  );

  const trendChartMax = getChartUpperBound(
    Math.max(...trendSeries.map((point) => point.count), 0),
  );

  const totalGeneratedInWindow = trendSeries.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  const heroSummary = isLoading
    ? "Loading department payment assessments, pending balances, and fee configuration."
    : stats.totalAssessments > 0
      ? `${departmentName} currently has ${formatNumber(stats.totalAssessments)} generated assessment${stats.totalAssessments === 1 ? "" : "s"}, ${formatNumber(stats.totalPending)} still waiting for payment, and ${formatNumber(stats.totalPaid)} already marked paid.`
      : `${departmentName} does not have any generated payment assessments yet. Totals and charts will fill in automatically as department assessments are created.`;

  const summaryCards: DepartmentTreasurerSummaryCard[] = [
    {
      label: "Assessments",
      value: formatNumber(stats.totalAssessments),
      note: "Generated in your department",
      icon: FiCreditCard,
      surfaceClass: "bg-[#F4F8FC]",
      iconClass: "bg-white text-[#0F2942]",
    },
    {
      label: "Pending",
      value: formatNumber(stats.totalPending),
      note: "Still waiting for payment",
      icon: FiClock,
      surfaceClass: "bg-amber-50",
      iconClass: "bg-white text-amber-700",
    },
    {
      label: "Paid",
      value: formatNumber(stats.totalPaid),
      note: "Already settled by the owner",
      icon: FiCheckCircle,
      surfaceClass: "bg-emerald-50",
      iconClass: "bg-white text-emerald-700",
    },
    {
      label: "Outstanding",
      value: formatCurrency(stats.totalAmountDue),
      note: "Current unpaid department balance",
      icon: FiTrendingUp,
      surfaceClass: "bg-sky-50",
      iconClass: "bg-white text-sky-700",
    },
  ];

  const recentPendingRecords = pendingRecords.slice(0, 3);

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-4">
      <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="rounded-[28px] border border-[#DCE7F3] bg-[radial-gradient(circle_at_top_left,rgba(242,201,76,0.18),transparent_40%),linear-gradient(135deg,#FFFFFF,#F7FBFF)] p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full border border-white/70 bg-white/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#5E6D7E] shadow-sm">
                Department Treasurer Workspace
              </span>
              <h1 className="mt-4 text-[1.65rem] font-black leading-tight text-[#0F2942] sm:text-3xl md:text-[2.2rem]">
                Department Treasurer Dashboard
              </h1>
              <p className="mt-2 text-base font-semibold text-[#0F2942]">
                Monitoring payment activity for {departmentName}.
              </p>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-[0.95rem]">
                {heroSummary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <DepartmentTreasurerSummaryCards items={summaryCards} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch">
        <DepartmentTreasurerPaymentStatusCard
          totalAssessments={stats.totalAssessments}
          settledRate={settledRate}
          statusChartData={statusChartData}
          statusChartMax={statusChartMax}
          collectedAmount={collectedAmount}
          outstandingAmount={stats.totalAmountDue}
        />
        <DepartmentTreasurerTrendCard
          hasRecords={sortedRecords.length > 0}
          timeWindow={timeWindow}
          onTimeWindowChange={setTimeWindow}
          trendSeries={trendSeries}
          trendChartMax={trendChartMax}
          totalGeneratedInWindow={totalGeneratedInWindow}
          latestAssessmentAt={latestAssessmentAt}
        />
      </section>

      <DepartmentTreasurerRecentPendingActivityCard
        pendingCount={pendingRecords.length}
        recentPendingRecords={recentPendingRecords}
      />
    </div>
  );
}
