import { getBploAdminPermitPaymentPayersApi } from "@/api/bplo_admin/bplo_admin.api";
import type { BploAdminPermitPaymentPayersType } from "@/types/bplo_admin/bplo_admin.type";
import { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

const formatCurrency = (value: number) =>
  `PHP ${Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const initialState: BploAdminPermitPaymentPayersType = {
  permitId: "",
  permitName: "",
  totalCollectedAmount: 0,
  paidAssessmentCount: 0,
  payers: [],
};

export default function BploAdminPermitPaymentPayersPage() {
  const navigate = useNavigate();
  const { permitId = "" } = useParams();
  const [payload, setPayload] = useState<BploAdminPermitPaymentPayersType>(initialState);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPayers = async () => {
      if (!permitId) {
        setError("Permit type not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const response = await getBploAdminPermitPaymentPayersApi(permitId);
        setPayload(response.data ?? initialState);
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load paid list for this permit.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadPayers();
  }, [permitId]);

  const sortedPayers = useMemo(
    () =>
      [...(payload.payers ?? [])].sort(
        (a, b) =>
          new Date(b.paidAt ?? 0).getTime() - new Date(a.paidAt ?? 0).getTime(),
      ),
    [payload.payers],
  );

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <button
          type="button"
          onClick={() => navigate("/home/bplo_admin/payment-analytics")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#0F2942] hover:bg-[#F7FAFD]"
        >
          <FiArrowLeft /> Back to Analytics
        </button>

        <h1 className="mt-4 text-2xl md:text-3xl font-black text-[#0F2942]">
          {payload.permitName || "Permit"} Paid List
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Owners who already paid the BPLO fee for this permit.
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
            {formatCurrency(payload.totalCollectedAmount)}
          </p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
            Paid Assessments
          </p>
          <p className="mt-2 text-3xl font-black text-[#0F2942]">
            {Number(payload.paidAssessmentCount ?? 0).toLocaleString("en-PH")}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        {isLoading ? (
          <div className="py-20 flex items-center justify-center text-[#0F2942] font-semibold">
            <FiLoader className="animate-spin mr-2" /> Loading paid list...
          </div>
        ) : sortedPayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center text-sm font-semibold text-gray-500">
            No paid records yet for this permit.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedPayers.map((payer) => (
              <div
                key={`${payer.applicationId}_${payer.paidAt ?? "-"}`}
                className="rounded-2xl border border-gray-100 bg-[#FBFCFE] px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-black text-[#0F2942]">
                    {payer.applicantName || "Unknown Applicant"}
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-gray-500">
                    Paid Amount
                  </p>
                  <p className="text-lg font-black text-[#0F2942] mt-1">
                    {formatCurrency(payer.paidAmount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Paid at: {formatDateTime(payer.paidAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
