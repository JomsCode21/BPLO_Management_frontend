import type { CSSProperties } from "react";
import { FiActivity } from "react-icons/fi";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  formatNumber,
  shouldRenderMonthLabel,
  type InspectorBusiestWeekday,
  type InspectorMonthlyInspectionDatum,
  type InspectorPeakMonth,
} from "./shared";

type InspectorMonthlyActivityCardProps = {
  isCompactLayout: boolean;
  monthlyInspections: InspectorMonthlyInspectionDatum[];
  peakMonth: InspectorPeakMonth;
  monthlyTotal: number;
  averageMonthlyInspectionsLabel: string;
  busiestWeekday: InspectorBusiestWeekday;
  monthlyChartMax: number;
  monthlyChartTicks: number[];
};

export default function InspectorMonthlyActivityCard({
  isCompactLayout,
  monthlyInspections,
  peakMonth,
  monthlyTotal,
  averageMonthlyInspectionsLabel,
  busiestWeekday,
  monthlyChartMax,
  monthlyChartTicks,
}: InspectorMonthlyActivityCardProps) {
  const monthlyChartMargin = isCompactLayout
    ? { top: 10, right: 4, left: 0, bottom: 2 }
    : { top: 12, right: 12, left: 10, bottom: 10 };
  const tooltipStyle: CSSProperties = {
    borderRadius: isCompactLayout ? "14px" : "16px",
    border: "1px solid #E5E7EB",
    boxShadow: "0 18px 40px rgba(15, 41, 66, 0.12)",
    padding: isCompactLayout ? "8px 10px" : "10px 12px",
  };

  return (
    <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0F2942]">
            Monthly Inspection Activity
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Completed inspection volume across the last 12 months.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
          <FiActivity />
          {peakMonth?.count ? `Peak: ${peakMonth.label}` : "12-month view"}
        </span>
      </div>

      <div className="mt-4 h-56 min-h-56 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyInspections} margin={monthlyChartMargin}>
            <defs>
              <linearGradient
                id="inspectorMonthlyArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#0F2942" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#0F2942" stopOpacity={0.02} />
              </linearGradient>
            </defs>

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
                fontSize: isCompactLayout ? 9 : 10,
                fontWeight: 700,
              }}
              tickMargin={isCompactLayout ? 6 : 8}
              minTickGap={isCompactLayout ? 10 : 16}
              height={isCompactLayout ? 34 : 30}
              tickFormatter={(value, index) =>
                shouldRenderMonthLabel(
                  index,
                  monthlyInspections.length,
                  isCompactLayout,
                )
                  ? String(value)
                  : ""
              }
            />
            <YAxis
              domain={[0, monthlyChartMax]}
              ticks={monthlyChartTicks}
              allowDecimals={false}
              tickFormatter={(value) => formatNumber(Number(value))}
              tickLine={false}
              axisLine={false}
              tick={{
                fill: "#94A3B8",
                fontSize: isCompactLayout ? 10 : 11,
                fontWeight: 700,
              }}
              tickMargin={isCompactLayout ? 8 : 10}
              width={isCompactLayout ? 42 : 52}
            />
            <Tooltip
              cursor={{ stroke: "#CBD5E1", strokeWidth: 1 }}
              contentStyle={tooltipStyle}
              labelFormatter={(_, payload) =>
                String(payload?.[0]?.payload?.label ?? "")
              }
              formatter={(value) => [
                `${formatNumber(Number(value))} inspections`,
                "Completed",
              ]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#0F2942"
              strokeWidth={isCompactLayout ? 2.5 : 3}
              fill="url(#inspectorMonthlyArea)"
              dot={{
                r: isCompactLayout ? 3 : 4,
                strokeWidth: 2,
                stroke: "#FFFFFF",
                fill: "#0F2942",
              }}
              activeDot={{
                r: isCompactLayout ? 4 : 5,
                strokeWidth: 3,
                stroke: "#FFFFFF",
                fill: "#0F2942",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-xs font-semibold text-gray-600 sm:flex-row sm:flex-wrap sm:text-sm">
        <span className="rounded-full bg-[#F4F8FC] px-3 py-2 text-[#0F2942] sm:px-3.5">
          {formatNumber(monthlyTotal)} inspections in the last 12 months
        </span>
        {peakMonth?.count ? (
          <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 sm:px-3.5">
            Peak month: {peakMonth.label} ({formatNumber(peakMonth.count)})
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 sm:px-3.5">
            No completed inspection activity recorded yet
          </span>
        )}
        <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700 sm:px-3.5">
          Average: {averageMonthlyInspectionsLabel} per month
        </span>
        {busiestWeekday?.count ? (
          <span className="rounded-full bg-rose-50 px-3 py-2 text-rose-700 sm:px-3.5">
            Busiest day: {busiestWeekday.label} (
            {formatNumber(busiestWeekday.count)})
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600 sm:px-3.5">
            Busiest day trend will appear after more completed visits
          </span>
        )}
      </div>
    </article>
  );
}
