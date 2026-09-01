import { getDepartmentTreasurerPayersApi } from "@/api/treasurer/treasurer.api";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createTreasurerSocket,
  DEPARTMENT_TREASURER_PAYMENT_EVENT,
} from "@/socket/treasurer.socket";
import type { DepartmentPayerType } from "@/types/treasurer/treasurer.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 15;
const normalizeStatus = (value?: string) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function DepartmentTreasurerPendingPayersPage() {
  const [records, setRecords] = useState<DepartmentPayerType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const loadRecords = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDepartmentTreasurerPayersApi("pending");
      // Defensive filter keeps this page strict even if backend returns mixed states.
      const onlyPending = (response.data ?? []).filter(
        (row) => normalizeStatus(row.paymentStatus) === "pending",
      );
      setRecords(onlyPending);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        setError(null);
        return;
      }

      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message ?? "Failed to load payers list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  useEffect(() => {
    const socket = createTreasurerSocket();
    socket.on(DEPARTMENT_TREASURER_PAYMENT_EVENT, () => {
      // Refresh pending list immediately after any payment status change event.
      void loadRecords();
    });

    return () => {
      socket.off(DEPARTMENT_TREASURER_PAYMENT_EVENT);
      socket.disconnect();
    };
  }, []);

  const sorted = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          new Date(b.generatedAt ?? "").getTime() -
          new Date(a.generatedAt ?? "").getTime(),
      ),
    [records],
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sorted]);

  const pageStart =
    sorted.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, sorted.length);

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
          Pending Payers
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Business owners in your department with pending payment status.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            No pending payers available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-180">
              <thead className="bg-[#0F2942] text-white text-sm uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-4">Applicant</th>
                  <th className="px-5 py-4">Permit</th>
                  <th className="px-5 py-4">Generated</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row) => (
                  <tr
                    key={`${row._id}_${row.departmentId}`}
                    className="border-b border-gray-100"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[#0F2942]">
                        {row.applicantName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {row.applicantEmail}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {row.permitType}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {formatDate(row.generatedAt)}
                    </td>
                    <td className="px-5 py-4 font-bold text-[#0F2942]">
                      PHP {row.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          normalizeStatus(row.paymentStatus) === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {normalizeStatus(row.paymentStatus) === "paid"
                          ? "Paid"
                          : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && sorted.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-gray-600">
              Showing {pageStart}-{pageEnd} of {sorted.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-sm font-bold cursor-pointer ${
                        isActive
                          ? "bg-[#0F2942] text-white"
                          : "border border-gray-200 text-[#0F2942]"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
