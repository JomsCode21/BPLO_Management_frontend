import type { DepartmentPayerType } from "@/types/treasurer/treasurer.type";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime, formatNumber } from "./shared";

type Props = {
  pendingCount: number;
  recentPendingRecords: DepartmentPayerType[];
};

export default function DepartmentTreasurerRecentPendingActivityCard({
  pendingCount,
  recentPendingRecords,
}: Props) {
  return (
    <section>
      <article className="flex min-w-0 flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-[#0F2942]">
              Recent Pending Payer Activity
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Latest pending assessment records generated for your department.
            </p>
          </div>

          <Link
            to="/home/department_treasurer/payers-pending"
            className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-700"
          >
            {formatNumber(pendingCount)} pending
          </Link>
        </div>

        {recentPendingRecords.length === 0 ? (
          <div className="mt-4 flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-[#FBFDFF] px-6 text-center">
            <div>
              <p className="text-base font-black text-[#0F2942]">
                No pending payer activity right now
              </p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">
                Recent unpaid assessments will appear here once your department
                has pending payment entries.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {recentPendingRecords.map((record) => (
              <div
                key={`${record._id}_${record.departmentId}`}
                className="rounded-3xl border border-gray-100 bg-[#FAFCFF] p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-[#0F2942]">
                      {record.applicantName}
                    </p>
                    <p className="mt-1 break-all text-sm font-medium text-gray-500">
                      {record.applicantEmail}
                    </p>
                  </div>

                  <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">
                    Pending
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Permit
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                      {record.permitType}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Amount
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#0F2942]">
                      {formatCurrency(record.totalAmount)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Generated
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                      {formatDateTime(record.generatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/home/department_treasurer/payers-pending"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#0F2942] bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] transition-all duration-200 hover:bg-[#0F2942] hover:text-white"
              >
                View Pending Payers
                <FiArrowRight />
              </Link>
            </div>
          </div>
        )}
      </article>
    </section>
  );
}
