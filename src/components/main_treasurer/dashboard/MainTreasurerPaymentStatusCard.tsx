import { FiBarChart2 } from "react-icons/fi";
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
import { formatNumber, type StatusChartDatum } from "./shared";

type LabelProps = {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  value?: string | number;
};

const renderStatusValueLabel = (rawProps: unknown) => {
  const props = (rawProps ?? {}) as LabelProps & { payload?: StatusChartDatum };
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const value = Number(props.value ?? 0);
  const payload = props.payload;
  const formattedValue = formatNumber(value);
  const badgeWidth = Math.max(36, formattedValue.length * 8 + 18);
  const badgeX = x + width / 2 - badgeWidth / 2;
  const badgeY = y - 36;

  return (
    <g>
      <rect
        x={badgeX}
        y={badgeY}
        width={badgeWidth}
        height={28}
        rx={14}
        fill={payload?.badgeFill ?? "#F4F8FC"}
      />
      <text
        x={x + width / 2}
        y={badgeY + 18}
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

type MainTreasurerPaymentStatusCardProps = {
  hasRecords: boolean;
  applicationsCount: number;
  paidRate: number;
  statusBars: StatusChartDatum[];
  statusChartMax: number;
  statusChartTicks: number[];
};

export default function MainTreasurerPaymentStatusCard({
  hasRecords,
  applicationsCount,
  paidRate,
  statusBars,
  statusChartMax,
  statusChartTicks,
}: MainTreasurerPaymentStatusCardProps) {
  return (
    <section className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-[#FCFDFE] p-4 md:min-h-0 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0F2942]">
            Overall Payment Status
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Whole-system application totals, grouped as paid or pending.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
          <FiBarChart2 />
          {paidRate}% settled
        </span>
      </div>

      {!hasRecords ? (
        <div className="mt-4 flex min-h-55 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center text-sm font-semibold text-gray-500 sm:min-h-47.5 md:flex-1">
          No payment records are available yet.
        </div>
      ) : (
        <div className="mt-4 flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 md:min-h-0 md:flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {statusBars.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500"
                >
                  <span
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: item.legendColor }}
                  />
                  {item.label}
                </span>
              ))}
            </div>

            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">
              Applications
            </span>
          </div>

          <div className="mt-4 h-56 min-h-56 w-full sm:h-64 lg:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusBars}
                margin={{ top: 38, right: 12, left: 10, bottom: 30 }}
                barCategoryGap="34%"
              >
                <defs>
                  <linearGradient
                    id="mainTreasurerPaidBar"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8AE0DD" />
                    <stop offset="100%" stopColor="#5BBEC8" />
                  </linearGradient>
                  <linearGradient
                    id="mainTreasurerPendingBar"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F7A9BC" />
                    <stop offset="100%" stopColor="#EF7F9F" />
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
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  dy={8}
                />
                <YAxis
                  domain={[0, statusChartMax]}
                  ticks={statusChartTicks}
                  tickFormatter={(value) => formatNumber(Number(value))}
                  allowDecimals={false}
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
                  cursor={{ fill: "rgba(15, 41, 66, 0.04)" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 18px 40px rgba(15, 41, 66, 0.12)",
                    padding: "10px 12px",
                  }}
                  formatter={(value) => [
                    `${formatNumber(Number(value))} applications`,
                    "Count",
                  ]}
                />
                <Bar
                  dataKey="applications"
                  radius={[18, 18, 0, 0]}
                  maxBarSize={96}
                >
                  {statusBars.map((item) => (
                    <Cell key={item.label} fill={item.fill} />
                  ))}
                  <LabelList
                    dataKey="applications"
                    position="top"
                    content={renderStatusValueLabel}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600 sm:text-sm">
            <span className="rounded-full bg-[#F4F8FC] px-3 py-2 text-[#0F2942] sm:px-3.5">
              {formatNumber(applicationsCount)} applications tracked
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 sm:px-3.5">
              {paidRate}% fully paid
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
