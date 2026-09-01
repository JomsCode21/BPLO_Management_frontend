import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatDateTime,
  formatNumber,
  shouldRenderTrendLabel,
  type TimeWindow,
  type TrendPoint,
} from "./shared";

type Props = {
  hasRecords: boolean;
  timeWindow: TimeWindow;
  onTimeWindowChange: (value: TimeWindow) => void;
  trendSeries: TrendPoint[];
  trendChartMax: number;
  totalGeneratedInWindow: number;
  latestAssessmentAt?: string | null;
};

export default function DepartmentTreasurerTrendCard({
  hasRecords,
  timeWindow,
  onTimeWindowChange,
  trendSeries,
  trendChartMax,
  totalGeneratedInWindow,
  latestAssessmentAt,
}: Props) {
  return (
    <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0F2942]">
            Assessments Generated Over Time
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Assessment volume in your department based on generation date.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white p-1 sm:w-auto">
          {([7, 30] as TimeWindow[]).map((option) => {
            const isActive = option === timeWindow;

            return (
              <button
                key={option}
                type="button"
                aria-pressed={isActive}
                onClick={() => onTimeWindowChange(option)}
                className={`flex-1 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all sm:flex-none sm:text-xs ${
                  isActive
                    ? "bg-[#0F2942] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-[#0F2942]"
                }`}
              >
                {option} Days
              </button>
            );
          })}
        </div>
      </div>

      {!hasRecords ? (
        <div className="mt-4 flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FBFDFF] px-6 text-center">
          <div>
            <p className="text-base font-black text-[#0F2942]">
              No assessment history yet
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
              This trend chart will populate as payment assessments are
              generated for your department.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendSeries}
                margin={{ top: 12, right: 12, left: 10, bottom: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="#EEF2F7"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                  tickMargin={8}
                  minTickGap={16}
                  tickFormatter={(value, index) =>
                    shouldRenderTrendLabel(index, trendSeries.length)
                      ? String(value)
                      : ""
                  }
                />
                <YAxis
                  allowDecimals={false}
                  domain={[0, trendChartMax]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(Number(value))}
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                  tickMargin={10}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: "#CBD5E1", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 18px 40px rgba(15, 41, 66, 0.12)",
                    padding: "10px 12px",
                  }}
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.fullLabel ?? "")
                  }
                  formatter={(value) => [
                    `${formatNumber(Number(value))} generated assessment${Number(value) === 1 ? "" : "s"}`,
                    "Generated",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0F2942"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    strokeWidth: 2,
                    stroke: "#FFFFFF",
                    fill: "#0F2942",
                  }}
                  activeDot={{
                    r: 5,
                    strokeWidth: 3,
                    stroke: "#FFFFFF",
                    fill: "#0F2942",
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600 sm:text-sm">
            <span className="rounded-full bg-[#F4F8FC] px-3 py-2 text-[#0F2942] sm:px-3.5">
              {formatNumber(totalGeneratedInWindow)} generated in the last{" "}
              {timeWindow} days
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 sm:px-3.5">
              Latest assessment: {formatDateTime(latestAssessmentAt)}
            </span>
          </div>
        </>
      )}
    </article>
  );
}
