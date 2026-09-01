import { getBploAdminPermitPaymentAnalyticsApi } from "@/api/bplo_admin/bplo_admin.api";
import type { BploAdminPermitPaymentAnalyticsType } from "@/types/bplo_admin/bplo_admin.type";
import { useEffect, useMemo, useState } from "react";
import { FiActivity, FiLoader } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const formatCurrency = (value: number) =>
  `PHP ${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function BploAdminPaymentAnalyticsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<BploAdminPermitPaymentAnalyticsType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getBploAdminPermitPaymentAnalyticsApi();
        setRecords(response.data ?? []);
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load payment received records.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const totals = useMemo(() => {
    const totalCollected = records.reduce(
      (sum, item) => sum + Number(item.totalCollectedAmount ?? 0),
      0,
    );
    const totalPaidAssessments = records.reduce(
      (sum, item) => sum + Number(item.paidAssessmentCount ?? 0),
      0,
    );
    return { totalCollected, totalPaidAssessments };
  }, [records]);

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-bplo-admin-tour="payment-analytics-header"
      >
        <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
          Payment Received
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Total collected payment amounts from main treasurer confirmations,
          grouped by permit.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
            Total Collected
          </p>
          <p className="mt-2 text-3xl font-black text-[#0F2942]">
            {formatCurrency(totals.totalCollected)}
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
            Paid Assessments
          </p>
          <p className="mt-2 text-3xl font-black text-[#0F2942]">
            {totals.totalPaidAssessments.toLocaleString("en-PH")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center text-[#0F2942] font-semibold">
            <FiLoader className="animate-spin mr-2" /> Loading payment received records...
          </div>
        ) : records.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center text-sm font-semibold text-gray-500">
            No permit records available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {records.map((item) => (
              <button
                type="button"
                key={item.permitId}
                onClick={() =>
                  navigate(`/home/bplo_admin/payment-analytics/${item.permitId}`)
                }
                className="rounded-2xl border border-gray-100 bg-[#FBFCFE] p-5 text-left hover:border-[#0F2942]/25 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                      Permit
                    </p>
                    <h3 className="mt-1 text-lg font-black text-[#0F2942] leading-tight">
                      {item.permitName}
                    </h3>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-[#0F2942]/8 text-[#0F2942] flex items-center justify-center">
                    <FiActivity className="text-lg" />
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                    Total Collected
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#0F2942]">
                    {formatCurrency(item.totalCollectedAmount)}
                  </p>
                </div>

                <p className="mt-3 text-xs font-semibold text-gray-500">
                  Paid assessments: {Number(item.paidAssessmentCount ?? 0).toLocaleString("en-PH")}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

