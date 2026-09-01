import {
  getOwnerApplicationStatusDetailApi,
  getOwnerGeneratedDocumentPdfApi,
} from "@/api/owner/owner.api";
import {
  OwnerApplicationStatusDetailContentSkeleton,
  OwnerPaymentStatusDetailContentSkeleton,
} from "@/components/owner/OwnerStatusLoading";
import PaymentAssessmentsSection from "@/components/owner/PaymentAssessmentsSection";
import OwnerStatusPageShell from "@/components/owner/OwnerStatusPageShell";
import type {
  OwnerApplicationStatusCode,
  OwnerApplicationStatusDetailType,
} from "@/types/owner/owner.type";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDownload,
  FiFileText,
  FiInfo,
  FiXCircle,
} from "react-icons/fi";
import { useLocation, useParams } from "react-router-dom";

const statusMessageMap: Record<OwnerApplicationStatusCode, string> = {
  submitted:
    "Your business permit application has been submitted and is waiting for evaluator review.",
  for_inspection:
    "Your business permit application was routed for inspection processing.",
  inspection_pending: "Your inspection request is pending BPLO admin review.",
  inspection_approved:
    "Your inspection request was approved and routed to inspectors.",
  inspection_scheduled: "An inspection schedule has been set for your request.",
  inspection_rescheduled: "Your inspection schedule was updated.",
  inspection_denied: "Your inspection request was denied by BPLO admin.",
  inspection_passed: "Your inspection assessment was marked as passed.",
  inspection_for_completion:
    "Your inspection needs completion before re-assessment.",
  inspection_failed: "Your inspection assessment was marked as failed.",
  for_admin_approval:
    "Your business permit application is now with BPLO admin for final approval.",
  payment_breakdown:
    "Your payment breakdown is ready. Review the fees while the full inspection flow is being completed.",
  payment_pending:
    "Your payment QR is ready. Pay first at the main treasurer before evaluator submission to BPLO admin.",
  payment_paid:
    "Your payment has been marked as paid and recorded by the treasurer. The evaluator can now forward your permit to BPLO admin.",
  payment_confirmed:
    "Your payment has been marked as paid and recorded by the treasurer. The evaluator can now forward your permit to BPLO admin.",
  re_submission:
    "Your business permit application needs re-submission. Please update and submit again.",
  approved:
    "Your business permit is complete and ready for download from this update.",
  failed: "Your business permit application has been denied.",
};

const formatNotificationDate = (value?: string | null) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getStatusVisuals = (status: OwnerApplicationStatusCode) => {
  switch (status) {
    case "approved":
      return {
        icon: FiCheckCircle,
        className: "bg-green-50 text-green-700 border-green-200",
        iconColor: "text-green-600",
        label: "Complete",
      };
    case "failed":
    case "inspection_denied":
      return {
        icon: FiXCircle,
        className: "bg-red-50 text-red-700 border-red-200",
        iconColor: "text-red-600",
        label: "Denied",
      };
    case "inspection_pending":
      return {
        icon: FiClock,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        iconColor: "text-amber-600",
        label: "Pending",
      };
    case "for_admin_approval":
      return {
        icon: FiCreditCard,
        className: "bg-blue-50 text-blue-700 border-blue-200",
        iconColor: "text-blue-600",
        label: "For Admin Approval",
      };
    case "payment_pending":
      return {
        icon: FiCreditCard,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        iconColor: "text-amber-600",
        label: "Payment Pending",
      };
    case "payment_breakdown":
      return {
        icon: FiCreditCard,
        className: "bg-blue-50 text-blue-700 border-blue-200",
        iconColor: "text-blue-600",
        label: "Payment Breakdown",
      };
    case "payment_paid":
      return {
        icon: FiCreditCard,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconColor: "text-emerald-600",
        label: "Payment Paid",
      };
    case "payment_confirmed":
      return {
        icon: FiCheckCircle,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconColor: "text-emerald-600",
        label: "Payment Paid",
      };
    case "inspection_approved":
      return {
        icon: FiCheckCircle,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconColor: "text-emerald-600",
        label: "Inspection Approved",
      };
    case "re_submission":
      return {
        icon: FiAlertCircle,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        iconColor: "text-amber-600",
        label: "Action Required",
      };
    default:
      return {
        icon: FiInfo,
        className: "bg-[#F4F8FC] text-[#0F2942] border-[#0F2942]/10",
        iconColor: "text-[#0F2942]",
        label: "In Progress",
      };
  }
};

export default function ApplicationStatusDetailPage() {
  const location = useLocation();
  const { applicationId = "" } = useParams();
  const [application, setApplication] =
    useState<OwnerApplicationStatusDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingPermit, setIsDownloadingPermit] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const isPaymentRoute = location.pathname.includes("/payment-status/");
  const backPath = isPaymentRoute
    ? "/home/user/payment-status"
    : "/home/user/application-status";
  const pageTitle = isPaymentRoute ? "Payment Status" : "Application Status";
  const detailCardTitle = isPaymentRoute
    ? "Payment Details"
    : "Application Details";
  const emptyStateLabel = isPaymentRoute
    ? "Payment status detail is unavailable."
    : "Application status detail is unavailable.";
  const errorLabel = isPaymentRoute
    ? "Failed to load payment status detail."
    : "Failed to load application status detail.";
  const visuals = application ? getStatusVisuals(application.status) : null;
  const StatusIcon = visuals?.icon;

  const handleDownloadFinalPermitPdf = async () => {
    if (!application?._id || isDownloadingPermit) return;

    setIsDownloadingPermit(true);
    setDownloadError(null);

    try {
      const blob = await getOwnerGeneratedDocumentPdfApi(
        application._id,
        "permit",
      );
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const fileName =
        application.generatedPermit?.file?.fileName?.replace(/\.docx$/i, ".pdf") ||
        "business-permit.pdf";
      anchor.href = url;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Unable to download the final permit right now.");
    } finally {
      setIsDownloadingPermit(false);
    }
  };

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getOwnerApplicationStatusDetailApi(applicationId, {
            force: isPaymentRoute,
          });
        setApplication(response.data ?? null);
      } catch (err: unknown) {
        const apiError = err as {
          response?: { status?: number; data?: { message?: string } };
        };

        if (apiError?.response?.status === 429) {
          setError(
            "Too many requests right now. Please wait a moment, then refresh this page.",
          );
          return;
        }

        setError(
          apiError?.response?.data?.message ??
            errorLabel,
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (applicationId) {
      void loadDetail();
    }
  }, [applicationId, errorLabel, isPaymentRoute]);

  return (
    <OwnerStatusPageShell title={pageTitle} backPath={backPath} wideDesktop>
      {isLoading ? (
        isPaymentRoute ? (
          <OwnerPaymentStatusDetailContentSkeleton />
        ) : (
          <OwnerApplicationStatusDetailContentSkeleton />
        )
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : !application ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
          {emptyStateLabel}
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-6">
          <div
            className={`rounded-3xl border px-6 py-8 ${visuals?.className} shadow-sm relative overflow-hidden transition-all`}
          >
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div
                className={`h-16 w-16 rounded-2xl ${visuals?.className.split(" ")[0]} brightness-95 border border-black/5 flex items-center justify-center shrink-0 shadow-inner`}
              >
                {StatusIcon && (
                  <StatusIcon className={`text-3xl ${visuals?.iconColor}`} />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black uppercase tracking-wide mb-1">
                  {visuals?.label}
                </h2>
                <p className="text-sm font-bold opacity-80 uppercase tracking-widest">
                  {application.permitType}
                </p>
              </div>
            </div>
            {StatusIcon && (
              <StatusIcon className="absolute -right-6 -bottom-6 text-9xl opacity-[0.07] rotate-12 pointer-events-none" />
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <h3 className="text-lg font-black text-[#0F2942] mb-4 flex items-center gap-2">
              <FiFileText className="text-xl" />
              {detailCardTitle}
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium text-lg">
              {statusMessageMap[application.status]}
            </p>
            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-gray-500 bg-gray-50 py-3 px-4 rounded-xl w-fit">
              <FiClock className="text-lg" />
              <span>
                Last updated {formatNotificationDate(application.decidedAt)}
              </span>
            </div>
          </div>

          {application.remark && application.remark.trim() && (
            <div className="bg-amber-50 rounded-3xl border border-amber-100 p-6 sm:p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-amber-800 mb-3 flex items-center gap-2">
                <FiAlertCircle />
                Remarks
              </h3>
              <p className="text-amber-900 font-medium leading-relaxed">
                {application.remark}
              </p>
            </div>
          )}

          {application.generatedPermit?.file?.pdf?.available && (
            <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 sm:p-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-emerald-800 mb-3">
                Final Permit Document
              </h3>
              <p className="text-emerald-900 font-medium leading-relaxed">
                Your finalized permit is now available.
              </p>
              {downloadError && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {downloadError}
                </div>
              )}
              <button
                type="button"
                onClick={() => void handleDownloadFinalPermitPdf()}
                disabled={isDownloadingPermit}
                className="mt-4 inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white cursor-pointer"
              >
                <FiDownload className="mr-2" />
                {isDownloadingPermit
                  ? "Downloading..."
                  : "Download Final Permit PDF"}
              </button>
            </div>
          )}

          {isPaymentRoute && (
            <PaymentAssessmentsSection
              status={application.status}
              combinedPaymentQrValue={application.combinedPaymentQrValue}
              paymentAssessments={application.paymentAssessments}
            />
          )}
        </div>
      )}
    </OwnerStatusPageShell>
  );
}
