import { FiBarChart2 } from "react-icons/fi";
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
import {
  formatCurrency,
  formatNumber,
  type StatusChartDatum,
} from "./shared";

type Props = {
  totalAssessments: number;
  settledRate: number;
  statusChartData: StatusChartDatum[];
  statusChartMax: number;
  collectedAmount: number;
  outstandingAmount: number;
};

export default function DepartmentTreasurerPaymentStatusCard({
  totalAssessments,
  settledRate,
  statusChartData,
  statusChartMax,
  collectedAmount,
  outstandingAmount,
}: Props) {
  return (
    <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black text-[#0F2942]">
            Overall Payment Status
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Paid versus pending payment assessments in your department.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full bg-[#F4F8FC] px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#0F2942]">
          <FiBarChart2 />
          {settledRate}% settled
        </span>
      </div>

      {totalAssessments === 0 ? (
        <div className="mt-4 flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FBFDFF] px-6 text-center">
          <div>
            <p className="text-base font-black text-[#0F2942]">
              No assessment status to chart yet
            </p>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
              Once your department starts generating payment assessments, the
              paid and pending comparison will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#63C8C7]" />
              Paid
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-gray-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#F497B3]" />
              Pending
            </span>
          </div>

          <div className="mt-4 h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={statusChartData}
                margin={{ top: 12, right: 12, left: 6, bottom: 8 }}
                barCategoryGap="30%"
              >
                <defs>
                  <linearGradient
                    id="departmentTreasurerPaidBar"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8AE0DD" />
                    <stop offset="100%" stopColor="#5BBEC8" />
                  </linearGradient>
                  <linearGradient
                    id="departmentTreasurerPendingBar"
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
                  allowDecimals={false}
                  domain={[0, statusChartMax]}
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
                  cursor={{ fill: "rgba(15, 41, 66, 0.04)" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 18px 40px rgba(15, 41, 66, 0.12)",
                    padding: "10px 12px",
                  }}
                  formatter={(value) => [
                    `${formatNumber(Number(value))} assessment${Number(value) === 1 ? "" : "s"}`,
                    "Count",
                  ]}
                />
                <Bar dataKey="value" radius={[18, 18, 0, 0]}>
                  {statusChartData.map((item) => (
                    <Cell key={item.label} fill={item.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-gray-600 sm:text-sm">
            <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700 sm:px-3.5">
              Collected: {formatCurrency(collectedAmount)}
            </span>
            <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700 sm:px-3.5">
              Outstanding: {formatCurrency(outstandingAmount)}
            </span>
          </div>
        </>
      )}
    </article>
  );
}
