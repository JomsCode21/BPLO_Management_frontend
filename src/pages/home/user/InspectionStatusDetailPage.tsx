import {
  getOwnerApplicationStatusDetailApi,
  getOwnerGeneratedDocumentPdfApi,
  requestOwnerInspectionReassessmentApi,
} from "@/api/owner/owner.api";
import InspectionStepper from "@/components/general/InspectionStepper";
import { OwnerInspectionStatusDetailContentSkeleton } from "@/components/owner/OwnerStatusLoading";
import OwnerStatusPageShell from "@/components/owner/OwnerStatusPageShell";
import type {
  OwnerApplicationStatusCode,
  OwnerApplicationStatusDetailType,
} from "@/types/owner/owner.type";
import { createPdfObjectUrlFromBlob } from "@/utils/pdf-preview.util";
import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiInfo,
  FiXCircle,
} from "react-icons/fi";
import { useParams } from "react-router-dom";

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
  approved: "Your business permit application has been approved.",
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
    case "inspection_passed":
      return {
        icon: FiCheckCircle,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconColor: "text-emerald-600",
        label: "Inspection Passed",
      };
    case "inspection_for_completion":
      return {
        icon: FiAlertCircle,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        iconColor: "text-amber-600",
        label: "For Completion",
      };
    case "inspection_failed":
      return {
        icon: FiXCircle,
        className: "bg-red-50 text-red-700 border-red-200",
        iconColor: "text-red-600",
        label: "Inspection Failed",
      };
    case "inspection_approved":
      return {
        icon: FiCheckCircle,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconColor: "text-emerald-600",
        label: "Inspection Approved",
      };
    case "inspection_denied":
      return {
        icon: FiXCircle,
        className: "bg-red-50 text-red-700 border-red-200",
        iconColor: "text-red-600",
        label: "Inspection Denied",
      };
    case "inspection_pending":
      return {
        icon: FiClock,
        className: "bg-amber-50 text-amber-700 border-amber-200",
        iconColor: "text-amber-600",
        label: "Inspection Pending",
      };
    case "inspection_scheduled":
      return {
        icon: FiCalendar,
        className: "bg-sky-50 text-sky-700 border-sky-200",
        iconColor: "text-sky-600",
        label: "Inspection Scheduled",
      };
    case "inspection_rescheduled":
      return {
        icon: FiCalendar,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
        iconColor: "text-indigo-600",
        label: "Inspection Rescheduled",
      };
    default:
      return {
        icon: FiInfo,
        className: "bg-[#F4F8FC] text-[#0F2942] border-[#0F2942]/10",
        iconColor: "text-[#0F2942]",
        label: "Inspection Ongoing",
      };
  }
};

export default function InspectionStatusDetailPage() {
  const { applicationId = "" } = useParams();
  const [application, setApplication] =
    useState<OwnerApplicationStatusDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRequestingReassessment, setIsRequestingReassessment] =
    useState(false);
  const [certificatePreviewUrl, setCertificatePreviewUrl] = useState("");
  const [isLoadingCertificatePreview, setIsLoadingCertificatePreview] =
    useState(false);
  const [certificatePreviewError, setCertificatePreviewError] = useState<
    string | null
  >(null);
  const visuals = application ? getStatusVisuals(application.status) : null;
  const StatusIcon = visuals?.icon;
  const hasFeedback = Boolean(application?.remark?.trim());

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response =
          await getOwnerApplicationStatusDetailApi(applicationId);
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
            "Failed to load inspection status detail.",
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (applicationId) void loadDetail();
  }, [applicationId]);

  useEffect(() => {
    const pdfMeta = application?.generatedInspectionCertificate?.file?.pdf;
    const mimeType = pdfMeta?.mimeType || "application/pdf";

    if (!application?._id || !pdfMeta?.available) {
      setCertificatePreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }
        return "";
      });
      setIsLoadingCertificatePreview(false);
      setCertificatePreviewError(null);
      return;
    }

    let isActive = true;
    setIsLoadingCertificatePreview(true);
    setCertificatePreviewError(null);

    void getOwnerGeneratedDocumentPdfApi(
      application._id,
      "inspection_certificate",
    )
      .then((blob) => {
        if (!isActive) return;

        const nextUrl = createPdfObjectUrlFromBlob(blob, mimeType);
        setCertificatePreviewUrl((previous) => {
          if (previous) {
            window.URL.revokeObjectURL(previous);
          }
          return nextUrl;
        });
      })
      .catch(() => {
        if (!isActive) return;
        setCertificatePreviewUrl((previous) => {
          if (previous) {
            window.URL.revokeObjectURL(previous);
          }
          return "";
        });
        setCertificatePreviewError(
          "Unable to load your generated inspection certificate preview.",
        );
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoadingCertificatePreview(false);
      });

    return () => {
      // Revoke object URL on dependency change/unmount to avoid memory leaks.
      isActive = false;
      setCertificatePreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }
        return "";
      });
    };
  }, [application?._id, application?.generatedInspectionCertificate?.file?.pdf]);

  const handleRequestReassessment = async () => {
    const applicationRefId = application?.applicationRefId;
    if (!applicationRefId || isRequestingReassessment) return;

    setIsRequestingReassessment(true);
    setError(null);
    try {
      await requestOwnerInspectionReassessmentApi(applicationRefId);
      // Force refresh to immediately reflect new reassessment request state.
      const refreshed = await getOwnerApplicationStatusDetailApi(applicationId, {
        force: true,
      });
      setApplication(refreshed.data ?? null);
    } catch (err: unknown) {
      const apiError = err as {
        response?: { data?: { message?: string } };
      };
      setError(
        apiError?.response?.data?.message ??
          "Failed to submit re-assessment request.",
      );
    } finally {
      setIsRequestingReassessment(false);
    }
  };

  return (
    <OwnerStatusPageShell
      title="Inspection Status"
      backPath="/home/user/inspection-status"
      wideDesktop
    >
      {isLoading ? (
        <OwnerInspectionStatusDetailContentSkeleton />
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : !application ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
          Inspection status detail is unavailable.
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
              Inspection Details
            </h3>
            <p className="text-gray-700 leading-relaxed font-medium text-lg">
              {statusMessageMap[application.status]}
            </p>

            {hasFeedback && (
              <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 sm:px-5 sm:py-5">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-800 mb-2 flex items-center gap-2">
                  <FiAlertCircle />
                  Feedback
                </h4>
                <p className="text-amber-900 font-medium leading-relaxed whitespace-pre-line">
                  {application.remark}
                </p>
              </div>
            )}

            {application.canRequestReassessment && (
              <div className="mt-6 rounded-2xl border border-[#0F2942]/10 bg-[#F4F8FC] px-4 py-4 sm:px-5 sm:py-5">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#0F2942] mb-2">
                  Re-Assessment Request
                </h4>
                <p className="text-[#0F2942] font-medium leading-relaxed">
                  Once your required compliance is complete, request re-assessment so the same assigned inspector can schedule a new inspection.
                </p>
                <button
                  type="button"
                  onClick={() => void handleRequestReassessment()}
                  disabled={isRequestingReassessment}
                  className="mt-4 inline-flex items-center rounded-xl bg-[#0F2942] px-5 py-3 text-sm font-bold text-white disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isRequestingReassessment
                    ? "Requesting..."
                    : "Request Re-Assessment"}
                </button>
              </div>
            )}

            {!application.canRequestReassessment &&
              application.status === "inspection_for_completion" &&
              application.reassessmentRequestedAt && (
                <div className="mt-6 rounded-2xl border border-[#0F2942]/10 bg-[#F4F8FC] px-4 py-4 sm:px-5 sm:py-5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#0F2942] mb-2">
                    Re-Assessment Requested
                  </h4>
                  <p className="text-[#0F2942] font-medium leading-relaxed">
                    Your re-assessment request has been sent. Please wait for the inspector to set a new schedule.
                  </p>
                </div>
              )}

            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-gray-500 bg-gray-50 py-3 px-4 rounded-xl w-fit">
              <FiClock className="text-lg" />
              <span>
                Last updated {formatNotificationDate(application.decidedAt)}
              </span>
            </div>
          </div>

          {(application.inspectionUpdates ?? []).length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              <h3 className="text-lg font-black text-[#0F2942] mb-6">
                Inspection Routing Progress
              </h3>
              <InspectionStepper steps={application.inspectionUpdates ?? []} />
            </div>
          )}

          {application.generatedInspectionCertificate && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
              <h3 className="text-lg font-black text-[#0F2942] mb-4">
                Generated Inspection Certificate
              </h3>
              <p className="text-sm font-semibold text-gray-600">
                {application.generatedInspectionCertificate.templateName} (v
                {application.generatedInspectionCertificate.templateVersion})
              </p>
              {certificatePreviewError ? (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {certificatePreviewError}
                </div>
              ) : isLoadingCertificatePreview ? (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                  Loading generated certificate preview...
                </div>
              ) : !certificatePreviewUrl ? (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700">
                  Generated certificate preview is not available.
                </div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100">
                  <iframe
                    title="Generated inspection certificate preview"
                    src={certificatePreviewUrl}
                    className="h-112 w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </OwnerStatusPageShell>
  );
}


