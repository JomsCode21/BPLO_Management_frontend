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
  formatNumber,
  shouldRenderTrendLabel,
  type TimeWindow,
  type TrendPoint,
} from "./shared";

type MainTreasurerTrendCardProps = {
  hasRecords: boolean;
  timeWindow: TimeWindow;
  onTimeWindowChange: (value: TimeWindow) => void;
  trendSeries: TrendPoint[];
  trendChartMax: number;
  trendChartTicks: number[];
  totalRecordedInWindow: number;
};

export default function MainTreasurerTrendCard({
  hasRecords,
  timeWindow,
  onTimeWindowChange,
  trendSeries,
  trendChartMax,
  trendChartTicks,
  totalRecordedInWindow,
}: MainTreasurerTrendCardProps) {
  return (
    <section className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-[#FCFDFE] p-4 md:min-h-0 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0F2942]">
            Payments Recorded Over Time
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Full applications that became paid during the selected period.
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
                className={`no-login-theme flex-1 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] transition-all sm:flex-none sm:text-xs ${
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
        <div className="mt-4 flex min-h-55 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm font-semibold text-gray-500 sm:min-h-47.5 md:flex-1">
          No fully paid application records were found in the last {timeWindow}{" "}
          days.
        </div>
      ) : (
        <div className="mt-4 flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 md:min-h-0 md:flex-1">
          <div className="h-56 min-h-56 w-full sm:h-64 lg:h-72">
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
                  domain={[0, trendChartMax]}
                  ticks={trendChartTicks}
                  allowDecimals={false}
                  tickFormatter={(value) => formatNumber(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fill: "#94A3B8",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                  tickMargin={10}
                  width={52}
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
                    `${formatNumber(Number(value))} paid applications`,
                    "Recorded",
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
              {formatNumber(totalRecordedInWindow)} paid in the last {timeWindow}{" "}
              days
            </span>
            {totalRecordedInWindow === 0 ? (
              <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 sm:px-3.5">
                No fully paid application records were found in this period
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 sm:px-3.5">
                Based on the latest payment update per fully paid application
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
