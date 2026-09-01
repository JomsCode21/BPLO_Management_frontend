import type { CSSProperties } from "react";
import { FiTrendingUp } from "react-icons/fi";
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
import {
  formatNumber,
  type InspectorResultChartDatum,
} from "./shared";

type LabelProps = {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  value?: string | number;
};

const renderResultValueLabel = (rawProps: unknown) => {
  const props =
    (rawProps ?? {}) as LabelProps & { payload?: InspectorResultChartDatum };
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const value = Number(props.value ?? 0);
  const payload = props.payload;
  const formattedValue = formatNumber(value);
  const badgeWidth = Math.max(36, formattedValue.length * 8 + 18);
  const badgeX = x + width / 2 - badgeWidth / 2;
  const badgeY = y - 34;

  return (
    <g>
      <rect
        x={badgeX}
        y={badgeY}
        width={badgeWidth}
        height={26}
        rx={13}
        fill={payload?.badgeFill ?? "#F4F8FC"}
      />
      <text
        x={x + width / 2}
        y={badgeY + 17}
        textAnchor="middle"
        fill={payload?.badgeTextColor ?? "#0F2942"}
        fontSize="12"
        fontWeight="800"
      >
        {formattedValue}
      </text>
    </g>
  );
};

type InspectorOutcomeMixCardProps = {
  isCompactLayout: boolean;
  resultChartData: InspectorResultChartDatum[];
  topOutcome: InspectorResultChartDatum | null;
  resultChartMax: number;
  resultChartTicks: number[];
};

export default function InspectorOutcomeMixCard({
  isCompactLayout,
  resultChartData,
  topOutcome,
  resultChartMax,
  resultChartTicks,
}: InspectorOutcomeMixCardProps) {
  const resultChartMargin = isCompactLayout
    ? { top: 18, right: 4, left: 0, bottom: 8 }
    : { top: 34, right: 10, left: 10, bottom: 16 };
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
            Inspection Outcome Mix
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            A quick look at how your completed inspections are ending.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
          <FiTrendingUp />
          {topOutcome ? `${topOutcome.label} leads` : "No results yet"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {resultChartData.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-gray-600"
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.legendColor }}
            />
            {item.label}
          </span>
        ))}
      </div>

      <div className="mt-4 h-56 min-h-56 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={resultChartData}
            margin={resultChartMargin}
            barCategoryGap={isCompactLayout ? "22%" : "28%"}
          >
            <defs>
              <linearGradient id="inspectorPassedBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4ADE80" />
                <stop offset="100%" stopColor="#22C55E" />
              </linearGradient>
              <linearGradient
                id="inspectorCompletionBar"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="inspectorFailedBar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FB7185" />
                <stop offset="100%" stopColor="#F43F5E" />
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
                fill: "#0F2942",
                fontSize: isCompactLayout ? 11 : 12,
                fontWeight: 700,
              }}
              dy={isCompactLayout ? 6 : 8}
              height={isCompactLayout ? 38 : 30}
            />
            <YAxis
              domain={[0, resultChartMax]}
              ticks={resultChartTicks}
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
              cursor={{ fill: "rgba(15, 41, 66, 0.04)" }}
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `${formatNumber(Number(value))} inspections`,
                "Outcome total",
              ]}
            />
            <Bar
              dataKey="value"
              radius={[18, 18, 0, 0]}
              maxBarSize={isCompactLayout ? 78 : 110}
            >
              {resultChartData.map((item) => (
                <Cell key={item.label} fill={item.fill} />
              ))}
              {!isCompactLayout && (
                <LabelList
                  dataKey="value"
                  position="top"
                  content={renderResultValueLabel}
                />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {resultChartData.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-gray-100 bg-[#FCFDFE] p-3 sm:p-3.5"
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-400">
              {item.label}
            </p>
            <p className="mt-2 text-lg font-black text-[#0F2942]">
              {formatNumber(item.value)}
            </p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-gray-500">
              {item.note}
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}
