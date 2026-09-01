import type {
  OwnerApplicationStatusCode,
  OwnerApplicationStatusDetailType,
} from "@/types/owner/owner.type";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { FiAlertCircle, FiCreditCard, FiHash } from "react-icons/fi";

type PaymentAssessment = NonNullable<
  OwnerApplicationStatusDetailType["paymentAssessments"]
>[number];

const EMPTY_PAYMENT_ASSESSMENTS: PaymentAssessment[] = [];
const ACTIVE_QR_STATUSES = new Set<OwnerApplicationStatusCode>([
  "payment_pending",
]);

type PaymentAssessmentsSectionProps = {
  status: OwnerApplicationStatusCode;
  combinedPaymentQrValue?: string;
  paymentAssessments?: OwnerApplicationStatusDetailType["paymentAssessments"];
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const formatCurrency = (value: number) =>
  Number(value ?? 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getAssessmentKey = (assessment: PaymentAssessment) =>
  `${assessment.departmentId}_${assessment.generatedAt ?? "pending"}`;

const getStatusBadge = (assessment: PaymentAssessment) => {
  if (assessment.paymentStatus === "paid") {
    return {
      label: "Paid",
      className: "bg-emerald-100 text-emerald-700",
    };
  }

  return {
    label: "Pending",
    className: "bg-amber-100 text-amber-700",
  };
};

const CurrencyAmount = ({ value }: { value: number }) => (
  <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[#0F2942]">
    <span className="text-lg font-black leading-none sm:text-xl">PHP</span>
    <span className="min-w-0 break-all text-[clamp(1.35rem,4vw,2rem)] font-black leading-tight tabular-nums">
      {formatCurrency(value)}
    </span>
  </div>
);

export default function PaymentAssessmentsSection({
  status,
  combinedPaymentQrValue,
  paymentAssessments,
}: PaymentAssessmentsSectionProps) {
  const assessments = paymentAssessments ?? EMPTY_PAYMENT_ASSESSMENTS;
  const canShowQr = ACTIVE_QR_STATUSES.has(status);
  const isQrExpired =
    status === "for_admin_approval" ||
    status === "payment_paid" ||
    status === "payment_confirmed" ||
    status === "approved";
  const [combinedQrImage, setCombinedQrImage] = useState("");
  const grandTotal = assessments.reduce(
    (total, assessment) => total + Number(assessment.totalAmount ?? 0),
    0,
  );
  const paymentReferences = assessments
    .map((assessment) => assessment.paymentReference?.trim() || "")
    .filter(Boolean);

  useEffect(() => {
    let isCancelled = false;

    const generateQrCode = async () => {
      if (assessments.length === 0 || !canShowQr || !combinedPaymentQrValue?.trim()) {
        if (!isCancelled) {
          setCombinedQrImage("");
        }
        return;
      }

      const dataUrl = await QRCode.toDataURL(combinedPaymentQrValue, {
        errorCorrectionLevel: "L",
        margin: 3,
        width: 420,
        color: {
          dark: "#000000",
          light: "#FFFFFFFF",
        },
      });

      if (!isCancelled) {
        setCombinedQrImage(dataUrl);
      }
    };

    void generateQrCode().catch(() => {
      if (!isCancelled) {
        setCombinedQrImage("");
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [assessments, canShowQr, combinedPaymentQrValue]);

  if (assessments.length === 0) {
    if (!["for_admin_approval", "payment_breakdown", "approved"].includes(status)) {
      return null;
    }

    return (
      <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
        <h3 className="text-lg font-black text-[#0F2942] mb-4 flex items-center gap-2">
          <FiCreditCard className="text-xl" />
          Payment Status
        </h3>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-sm font-black uppercase tracking-widest text-blue-800">
            {status === "payment_breakdown"
              ? "Payment Breakdown Ready"
              : "For Admin Approval"}
          </p>
          <p className="mt-2 text-sm font-medium text-[#0F2942] leading-relaxed">
            {status === "payment_breakdown"
              ? "Your department fee breakdown is being prepared. The payment QR will be released once all required inspection departments are completed."
              : canShowQr
                ? "Your payment QR is active. Review the totals below and proceed to the main treasurer before evaluator submission to BPLO admin."
                : "Your payment step is complete. The application is now moving through the next approval stage."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
      <h3 className="text-lg font-black text-[#0F2942] mb-6 flex items-center gap-2">
        <FiCreditCard className="text-xl" />
        Payment Status
      </h3>

      <div className="mb-6 rounded-3xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-800">
                Combined Treasurer QR
              </p>
              <p className="mt-2 text-sm font-medium text-[#0F2942] leading-relaxed">
                {isQrExpired
                  ? "This payment QR is no longer active because the payment flow has already moved forward."
                  : "This single QR combines the current totals from all department assessments shown below."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-blue-800">
                  Included Departments
                </p>
                <p className="mt-2 text-2xl font-black text-[#0F2942]">
                  {assessments.length}
                </p>
              </div>
              <div className="min-w-0 rounded-2xl border border-blue-100 bg-white px-4 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-blue-800">
                  Grand Total
                </p>
                <CurrencyAmount value={grandTotal} />
              </div>
            </div>

            {paymentReferences.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                <p className="text-xs font-black uppercase tracking-widest text-blue-800 flex items-center gap-2">
                  <FiHash />
                  Included References
                </p>
                <div className="mt-3 space-y-2">
                  {paymentReferences.map((reference) => (
                    <p
                      key={reference}
                      className="text-sm font-bold text-[#0F2942] break-all"
                    >
                      {reference}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full max-w-sm shrink-0 rounded-3xl border border-blue-100 bg-white px-4 py-4">
            <div className="aspect-square overflow-hidden rounded-2xl border border-blue-100 bg-white">
              {canShowQr && combinedQrImage ? (
                <img
                  src={combinedQrImage}
                  alt="Combined payment QR"
                  className="h-full w-full object-contain"
                  style={{ imageRendering: "pixelated" }}
                />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-xs font-semibold text-gray-500">
                  {canShowQr
                    ? combinedPaymentQrValue?.trim()
                      ? "Generating combined treasurer QR..."
                      : "The current BPLO payment QR is not available yet."
                    : isQrExpired
                      ? "This QR is no longer active because payment was already recorded or the application already moved past the treasurer step."
                    : "QR will be released after all required inspection departments are completed."}
                </div>
              )}
            </div>
            <p className="mt-3 text-xs font-semibold text-gray-600 text-center leading-relaxed">
              {canShowQr
                ? "Present this single QR to the treasurer for the combined payment total."
                : isQrExpired
                  ? "You can still review the payment breakdown below, but this QR should no longer be used for scanning."
                : "You can already review the combined breakdown here, but payment QR access is still locked."}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {assessments.map((assessment) => {
          const key = getAssessmentKey(assessment);
          const statusBadge = getStatusBadge(assessment);

          return (
            <div
              key={key}
              className="rounded-3xl border border-blue-100 bg-blue-50/60 p-4 sm:p-5"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base sm:text-lg font-black text-[#0F2942]">
                    {assessment.departmentName}
                  </h4>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${statusBadge.className}`}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-800 flex items-center gap-2">
                      <FiHash />
                      Payment Reference
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#0F2942] break-all">
                      {assessment.paymentReference || "Will be generated soon"}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-gray-500">
                      Generated {formatDate(assessment.generatedAt)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                    <p className="text-xs font-black uppercase tracking-widest text-blue-800">
                      Department Total
                    </p>
                    <CurrencyAmount value={assessment.totalAmount} />
                    <p className="mt-3 text-xs font-semibold text-gray-500">
                      {assessment.paymentStatus === "paid"
                        ? assessment.statusUpdatedAt
                          ? `Paid and recorded by ${
                              assessment.statusUpdatedByName || "Treasurer"
                            } on ${formatDate(assessment.statusUpdatedAt)}`
                          : `Paid and recorded by ${
                              assessment.statusUpdatedByName || "Treasurer"
                            }`
                        : assessment.statusUpdatedByName
                          ? `Updated by ${
                              assessment.statusUpdatedByName
                            } on ${formatDate(assessment.statusUpdatedAt)}`
                          : "Awaiting treasurer update"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-white px-4 py-4">
                  <p className="text-xs font-black uppercase tracking-widest text-blue-800">
                    Assessment Breakdown
                  </p>
                  {assessment.items.length === 0 ? (
                    <p className="mt-3 text-sm font-medium text-gray-600">
                      No fee items available yet.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {assessment.items.map((item, index) => (
                        <div
                          key={`${assessment.departmentId}_${index}`}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="font-medium text-gray-700">
                            {item.feeName}
                          </span>
                          <span className="font-bold text-[#0F2942]">
                            PHP {formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-xs font-black uppercase tracking-widest text-amber-800 flex items-center gap-2">
          <FiAlertCircle />
          {canShowQr ? "Treasurer Note" : "QR Release Note"}
        </p>
        <p className="mt-2 text-sm font-medium text-amber-900 leading-relaxed">
          {canShowQr
            ? "Keep this combined QR ready during payment. Once the treasurer marks the assessment totals as paid, the payment status here will update automatically."
            : isQrExpired
              ? "Payment was already recorded for this application, so the owner QR is no longer active for treasurer scanning."
            : "Passed inspection departments can already build up the fee breakdown here. The QR stays hidden until all required inspection departments are complete."}
        </p>
      </div>
    </div>
  );
}
