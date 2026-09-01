import { getMainTreasurerPaymentsApi } from "@/api/treasurer/treasurer.api";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  formatNumber,
  type StatusChartDatum,
  type TimeWindow,
  type TrendPoint,
} from "@/components/main_treasurer/dashboard/shared";
import {
  createTreasurerSocket,
  MAIN_TREASURER_PAYMENT_EVENT,
} from "@/socket/treasurer.socket";
import type { MainTreasurerPaymentType } from "@/types/treasurer/treasurer.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiLoader,
  FiTrendingUp,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const MainTreasurerPaymentStatusCard = lazy(
  () =>
    import(
      "@/components/main_treasurer/dashboard/MainTreasurerPaymentStatusCard"
    ),
);
const MainTreasurerTrendCard = lazy(
  () =>
    import("@/components/main_treasurer/dashboard/MainTreasurerTrendCard"),
);

type DashboardApplicationPaymentType = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  permitType: string;
  totalAmount: number;
  collectedAmount: number;
  amountDue: number;
  paymentStatus: "pending" | "paid";
  assessmentCount: number;
  paidCount: number;
  latestGeneratedAt?: string | null;
  lastPaymentUpdateAt?: string | null;
  lastPaymentUpdatedBy?: string;
};

const formatCurrency = (value: number) =>
  `PHP ${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const addDays = (value: Date, days: number) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);

const getDateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate(),
  ).padStart(2, "0")}`;

const buildDashboardApplications = (records: MainTreasurerPaymentType[]) =>
  Array.from(
    records
      .reduce<Map<string, DashboardApplicationPaymentType>>(
        (groups, record) => {
          const existing = groups.get(record.applicationId);
          const totalAmount = Number(record.totalAmount ?? 0);
          const generatedAtTime = new Date(record.generatedAt ?? "").getTime();
          const updatedAtTime = new Date(
            record.statusUpdatedAt ?? "",
          ).getTime();

          if (!existing) {
            const paidCount = record.paymentStatus === "paid" ? 1 : 0;
            const collectedAmount =
              record.paymentStatus === "paid" ? totalAmount : 0;

            groups.set(record.applicationId, {
              applicationId: record.applicationId,
              applicantName: record.applicantName,
              applicantEmail: record.applicantEmail,
              permitType: record.permitType,
              totalAmount,
              collectedAmount,
              amountDue: Math.max(0, totalAmount - collectedAmount),
              paymentStatus:
                record.paymentStatus === "paid" ? "paid" : "pending",
              assessmentCount: 1,
              paidCount,
              latestGeneratedAt: record.generatedAt ?? null,
              lastPaymentUpdateAt: record.statusUpdatedAt ?? null,
              lastPaymentUpdatedBy: record.statusUpdatedByName,
            });
            return groups;
          }

          const existingGeneratedAtTime = new Date(
            existing.latestGeneratedAt ?? "",
          ).getTime();
          const existingUpdatedAtTime = new Date(
            existing.lastPaymentUpdateAt ?? "",
          ).getTime();

          existing.totalAmount += totalAmount;
          existing.assessmentCount += 1;

          if (record.paymentStatus === "paid") {
            existing.paidCount += 1;
            existing.collectedAmount += totalAmount;
          }

          if (generatedAtTime > existingGeneratedAtTime) {
            existing.latestGeneratedAt = record.generatedAt ?? null;
          }

          if (updatedAtTime > existingUpdatedAtTime) {
            existing.lastPaymentUpdateAt = record.statusUpdatedAt ?? null;
            existing.lastPaymentUpdatedBy = record.statusUpdatedByName;
          }

          existing.paymentStatus =
            existing.paidCount === existing.assessmentCount &&
            existing.assessmentCount > 0
              ? "paid"
              : "pending";
          existing.amountDue = Math.max(
            0,
            existing.totalAmount - existing.collectedAmount,
          );

          return groups;
        },
        new Map<string, DashboardApplicationPaymentType>(),
      )
      .values(),
  ).sort((a, b) => {
    const aTime = new Date(
      a.lastPaymentUpdateAt ?? a.latestGeneratedAt ?? "",
    ).getTime();
    const bTime = new Date(
      b.lastPaymentUpdateAt ?? b.latestGeneratedAt ?? "",
    ).getTime();

    return bTime - aTime;
  });

const buildTrendSeries = (
  applications: DashboardApplicationPaymentType[],
  timeWindow: TimeWindow,
) => {
  const today = startOfDay(new Date());
  const startDate = addDays(today, -(timeWindow - 1));

  const buckets: TrendPoint[] = Array.from(
    { length: timeWindow },
    (_, index) => {
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
    },
  );

  const bucketIndex = new Map(
    buckets.map((bucket, index) => [bucket.key, index] as const),
  );

  applications.forEach((application) => {
    if (
      application.paymentStatus !== "paid" ||
      !application.lastPaymentUpdateAt
    ) {
      return;
    }

    const paidDate = new Date(application.lastPaymentUpdateAt);
    if (Number.isNaN(paidDate.getTime())) return;

    const normalizedDate = startOfDay(paidDate);
    if (normalizedDate < startDate || normalizedDate > today) return;

    const targetIndex = bucketIndex.get(getDateKey(normalizedDate));
    if (targetIndex === undefined) return;

    buckets[targetIndex].count += 1;
  });

  return buckets;
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

const chartCardFallback = (
  <div className="flex min-h-105 min-w-0 flex-col rounded-3xl border border-gray-100 bg-[#FCFDFE] p-5">
    <div className="flex items-center gap-3 text-sm font-bold text-[#0F2942]">
      <FiLoader className="animate-spin text-lg" />
      Loading dashboard chart...
    </div>
  </div>
);

export default function MainTreasurerDashboard() {
  const [records, setRecords] = useState<MainTreasurerPaymentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(7);
  const liveUpdateVersionRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    const requestVersion = liveUpdateVersionRef.current;

    const loadRecords = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMainTreasurerPaymentsApi();

        if (!isMounted || requestVersion !== liveUpdateVersionRef.current) {
          return;
        }

        setRecords(response.data ?? []);
      } catch (err: unknown) {
        if (!isMounted || requestVersion !== liveUpdateVersionRef.current) {
          return;
        }

        if (isNotModifiedHttpError(err)) {
          setError(null);
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : ((err as { response?: { data?: { message?: string } } })?.response
                ?.data?.message ?? "Failed to load main treasurer dashboard.");
        setError(errorMessage);
      } finally {
        if (isMounted && requestVersion === liveUpdateVersionRef.current) {
          setIsLoading(false);
        }
      }
    };

    void loadRecords();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = createTreasurerSocket();
    const handlePaymentUpdate = (nextRecords?: MainTreasurerPaymentType[]) => {
      // Realtime payload replaces local records so dashboard cards/charts stay in sync.
      liveUpdateVersionRef.current += 1;
      setRecords(Array.isArray(nextRecords) ? nextRecords : []);
      setError(null);
      setIsLoading(false);
    };

    socket.on(MAIN_TREASURER_PAYMENT_EVENT, handlePaymentUpdate);

    return () => {
      socket.off(MAIN_TREASURER_PAYMENT_EVENT, handlePaymentUpdate);
      socket.disconnect();
    };
  }, []);

  const applications = useMemo(
    () => buildDashboardApplications(records),
    [records],
  );
  const paidApplications = applications.filter(
    (application) => application.paymentStatus === "paid",
  ).length;
  const pendingApplications = applications.length - paidApplications;
  const totalAmountDue = applications.reduce(
    (sum, application) => sum + application.amountDue,
    0,
  );
  const paidRate =
    applications.length === 0
      ? 0
      : Math.round((paidApplications / applications.length) * 100);

  const statusBars = [
    {
      label: "Paid",
      applications: paidApplications,
      fill: "url(#mainTreasurerPaidBar)",
      legendColor: "#73D2D3",
      badgeFill: "#E8FAF8",
      badgeTextColor: "#237E84",
    },
    {
      label: "Pending",
      applications: pendingApplications,
      fill: "url(#mainTreasurerPendingBar)",
      legendColor: "#F494AE",
      badgeFill: "#FFF0F4",
      badgeTextColor: "#CC5C7C",
    },
  ] satisfies StatusChartDatum[];
  const maxStatusBarValue = Math.max(
    1,
    ...statusBars.map((item) => item.applications),
  );
  const statusChartMax = getChartUpperBound(maxStatusBarValue);
  const statusChartTicks = Array.from({ length: 5 }, (_, index) => {
    const step = statusChartMax / 4;
    return statusChartMax - step * index;
  });

  const trendSeries = useMemo(
    () => buildTrendSeries(applications, timeWindow),
    [applications, timeWindow],
  );
  const trendChartMax = getChartUpperBound(
    Math.max(1, ...trendSeries.map((point) => point.count)),
  );
  const trendChartTicks = Array.from({ length: 5 }, (_, index) => {
    const step = trendChartMax / 4;
    return trendChartMax - step * index;
  });
  const totalRecordedInWindow = trendSeries.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  const summaryCards = [
    {
      label: "Total Applications",
      value: formatNumber(applications.length),
      note: "System-wide owner payment records",
      icon: FiCreditCard,
      surfaceClass: "bg-[#F4F8FC]",
      iconClass: "bg-white text-[#0F2942]",
    },
    {
      label: "Pending Applications",
      value: formatNumber(pendingApplications),
      note: "Still waiting for full payment",
      icon: FiClock,
      surfaceClass: "bg-amber-50",
      iconClass: "bg-white text-amber-600",
    },
    {
      label: "Paid Applications",
      value: formatNumber(paidApplications),
      note: "Already settled in one payment flow",
      icon: FiCheckCircle,
      surfaceClass: "bg-emerald-50",
      iconClass: "bg-white text-emerald-600",
    },
    {
      label: "Amount Due",
      value: formatCurrency(totalAmountDue),
      note: "Outstanding balance still to collect",
      icon: FiTrendingUp,
      surfaceClass: "bg-[#F9FAFB]",
      iconClass: "bg-white text-[#0F2942]",
    },
  ];

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-4">
      <div className="shrink-0 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-[1.65rem] font-black text-[#0F2942] sm:text-2xl md:text-[2.1rem]">
              Main Treasurer Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Application-level payment monitoring across all departments.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
            <Link
              to="/home/main_treasurer/scan-payment"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-transparent bg-[#F2C94C] px-4 py-2.5 text-sm font-bold text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.28)] transition-all duration-200 hover:bg-[#e6bf43] sm:w-auto"
            >
              <FiCreditCard />
              Scan Owner QR
            </Link>
            <Link
              to="/home/main_treasurer/payments"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#0F2942] bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] transition-all duration-200 hover:bg-[#0F2942] hover:text-white sm:w-auto"
            >
              View Payments
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 md:min-h-0 md:flex-1">
        <>
          <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <article
                    key={card.label}
                    className={`min-h-30 rounded-3xl border border-gray-100 p-4 shadow-sm sm:min-h-33 md:p-5 ${card.surfaceClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-500">
                          {card.label}
                        </p>
                        <p className="mt-3 wrap-break-words text-[1.55rem] font-black leading-none text-[#0F2942] sm:text-[1.8rem]">
                          {card.value}
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

            <div className="mt-4 grid gap-4 md:min-h-0 md:flex-1 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:items-stretch">
              <Suspense fallback={chartCardFallback}>
                <MainTreasurerPaymentStatusCard
                  hasRecords={applications.length > 0}
                  applicationsCount={applications.length}
                  paidRate={paidRate}
                  statusBars={statusBars}
                  statusChartMax={statusChartMax}
                  statusChartTicks={statusChartTicks}
                />
              </Suspense>

              <Suspense fallback={chartCardFallback}>
                <MainTreasurerTrendCard
                  hasRecords={applications.length > 0}
                  timeWindow={timeWindow}
                  onTimeWindowChange={setTimeWindow}
                  trendSeries={trendSeries}
                  trendChartMax={trendChartMax}
                  trendChartTicks={trendChartTicks}
                  totalRecordedInWindow={totalRecordedInWindow}
                />
              </Suspense>
            </div>
        </>
      </div>
    </div>
  );
}
