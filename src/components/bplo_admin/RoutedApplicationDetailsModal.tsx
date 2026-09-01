import type {
  BploInspectionDecisionType,
  BploPermitDecisionType,
  BploRoutedApplicationDetailType,
} from "@/types/bplo_admin/bplo_admin.type";
import PermitValidityDetailsPanels from "@/components/bplo_admin/routed_details/PermitValidityDetailsPanels";
import SubmittedSectionsPanel, {
  type SubmittedSectionGroup,
} from "@/components/bplo_admin/routed_details/SubmittedSectionsPanel";
import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

type RoutedApplicationDetailsModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  application: BploRoutedApplicationDetailType | null;
  isPermitValidityView?: boolean;
  isPermitReleaseView?: boolean;
  generatedPreviewReloadSignal?: number;
  canDecide?: boolean;
  decisionMode?: "permit_approval" | "inspection_request";
  isSavingDecision?: boolean;
  canManageGeneratedPermit?: boolean;
  canPrintGeneratedPermit?: boolean;
  isGeneratingPermit?: boolean;
  isPrintingGeneratedPermit?: boolean;
  isSendingToApplicant?: boolean;
  onClose: () => void;
  onSaveDecision?: (params: {
    decision: BploPermitDecisionType | BploInspectionDecisionType;
    remark: string;
  }) => Promise<void> | void;
  onGeneratePermit?: () => Promise<void> | void;
  onPrintGeneratedPermit?: () => Promise<void> | void;
  onSendToApplicant?: () => Promise<void> | void;
  onDone?: () => void;
  doneButtonLabel?: string;
};

export default function RoutedApplicationDetailsModal({
  isOpen,
  isLoading,
  error,
  application,
  isPermitValidityView = false,
  isPermitReleaseView = false,
  generatedPreviewReloadSignal = 0,
  canDecide = false,
  decisionMode = "permit_approval",
  isSavingDecision = false,
  canManageGeneratedPermit = false,
  canPrintGeneratedPermit = false,
  isGeneratingPermit = false,
  isPrintingGeneratedPermit = false,
  isSendingToApplicant = false,
  onClose,
  onSaveDecision,
  onGeneratePermit,
  onPrintGeneratedPermit,
  onSendToApplicant,
  onDone,
  doneButtonLabel = "Done",
}: RoutedApplicationDetailsModalProps) {
  const [decision, setDecision] = useState<
    BploPermitDecisionType | BploInspectionDecisionType
  >("approved");
  const [remark, setRemark] = useState("");
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState("");
  const [generatedPreviewError, setGeneratedPreviewError] = useState<
    string | null
  >(null);
  const [isPreparingGeneratedPreview, setIsPreparingGeneratedPreview] =
    useState(false);
  const generatedPreviewSrc = generatedPreviewUrl
    ? `${generatedPreviewUrl}#zoom=page-width`
    : "";
  const hasPendingPaymentForPermitApproval =
    decisionMode === "permit_approval" &&
    ((application?.paymentAssessments ?? []).length === 0 ||
      (application?.paymentAssessments ?? []).some(
        (assessment) => assessment.paymentStatus !== "paid",
      ));

  const decodeBase64ToArrayBuffer = (contentBase64: string) => {
    const binaryString = window.atob(contentBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }
    return bytes.buffer;
  };

  useEffect(() => {
    if (!application) {
      setDecision("approved");
      setRemark("");
      setDecisionError(null);
      return;
    }

    const initialDecision =
      decisionMode === "inspection_request"
        ? (application.inspectionAdminResult?.decision ?? "pending")
        : (application.adminResult?.decision ?? "approved");
    setDecision(initialDecision);
    setRemark(
      decisionMode === "inspection_request"
        ? (application.inspectionAdminResult?.remark ?? "")
        : (application.adminResult?.remark ?? ""),
    );
    setDecisionError(null);
  }, [application, decisionMode]);

  const submittedSections = useMemo(() => {
    if (!application) return [];

    const permitSections = application.permit?.sections ?? [];
    const permitFields = application.permit?.fields ?? [];
    const responses = application.responses ?? [];

    if (permitSections.length === 0 || permitFields.length === 0) {
      // Backward-compatible render path for permits without section metadata.
      return [
        {
          id: "section_submitted_values",
          title: "Submitted Form Values",
          layout: "one_column" as const,
          responses,
        },
      ];
    }

    const fieldOrder = new Map<string, number>();
    const fieldSectionMap = new Map<string, string>();

    permitFields.forEach((field, index) => {
      fieldOrder.set(field.id, index);
      fieldSectionMap.set(field.id, String(field.sectionId ?? "").trim());
    });

    const sectionMap = new Map<string, SubmittedSectionGroup>();

    permitSections.forEach((section) => {
      sectionMap.set(section.id, {
        id: section.id,
        title: section.title,
        layout: section.layout,
        responses: [],
      });
    });

    const fallbackSectionId = permitSections[0]?.id ?? "section_general";

    responses.forEach((response) => {
      const rawSectionId = fieldSectionMap.get(response.fieldId) ?? "";
      const sectionId = rawSectionId || fallbackSectionId;

      if (!sectionMap.has(sectionId)) {
        // Unknown section IDs are still shown so no submitted value is hidden.
        sectionMap.set(sectionId, {
          id: sectionId,
          title: "Other Information",
          layout: "one_column",
          responses: [],
        });
      }

      sectionMap.get(sectionId)?.responses.push(response);
    });

    sectionMap.forEach((section) => {
      section.responses.sort((a, b) => {
        const indexA = fieldOrder.get(a.fieldId) ?? Number.MAX_SAFE_INTEGER;
        const indexB = fieldOrder.get(b.fieldId) ?? Number.MAX_SAFE_INTEGER;
        return indexA - indexB;
      });
    });

    const orderedSectionIds = [
      ...permitSections.map((section) => section.id),
      ...Array.from(sectionMap.keys()).filter(
        (sectionId) =>
          !permitSections.some((section) => section.id === sectionId),
      ),
    ];

    return orderedSectionIds
      .map((sectionId) => sectionMap.get(sectionId))
      .filter(
        (section): section is SubmittedSectionGroup =>
          !!section && section.responses.length > 0,
      );
  }, [application]);

  const permitValidityEnabledResponses = useMemo(() => {
    if (!application) return [];

    const permit = application.permit;
    const isEnabled = permit?.enablePermitValidityFormDisplay === true;
    if (!isEnabled) return [];

    const configuredFieldIds = Array.isArray(permit?.permitValidityDisplayFieldIds)
      ? permit.permitValidityDisplayFieldIds
      : [];

    if (configuredFieldIds.length === 0) return [];

    const responseMap = new Map(
      (application.responses ?? []).map((response) => [response.fieldId, response]),
    );
    const fieldLabelMap = new Map(
      (permit?.fields ?? []).map((field) => [field.id, field.label]),
    );

    return configuredFieldIds.map((fieldId) => {
      const response = responseMap.get(fieldId);
      return {
        fieldId,
        label: response?.label || fieldLabelMap.get(fieldId) || fieldId,
        type: response?.type || "text",
        value: response?.value,
        files: response?.files ?? [],
      };
    });
  }, [application]);

  useEffect(() => {
    const buildGeneratedPreviewUrl = async () => {
      const clearPdfBase64 =
        application?.generatedPermit?.file?.pdf?.clearContentBase64;
      const clearPdfMimeType =
        application?.generatedPermit?.file?.pdf?.mimeType ||
        "application/pdf";
      if (!clearPdfBase64) {
        setGeneratedPreviewUrl("");
        setGeneratedPreviewError(null);
        setIsPreparingGeneratedPreview(false);
        return;
      }

      setIsPreparingGeneratedPreview(true);
      setGeneratedPreviewError(null);

      try {
        const arrayBuffer = decodeBase64ToArrayBuffer(clearPdfBase64);
        const previewBlob = new Blob([arrayBuffer], {
          type: clearPdfMimeType,
        });
        const url = window.URL.createObjectURL(previewBlob);
        setGeneratedPreviewUrl((previous) => {
          if (previous) window.URL.revokeObjectURL(previous);
          return url;
        });
      } catch {
        setGeneratedPreviewUrl("");
        setGeneratedPreviewError(
          "Unable to load the server-generated PDF preview. Please regenerate and try again.",
        );
      } finally {
        setIsPreparingGeneratedPreview(false);
      }
    };

    void buildGeneratedPreviewUrl();

    return () => {
      setGeneratedPreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }
        return "";
      });
    };
  }, [
    application?.generatedPermit?.file?.pdf?.clearContentBase64,
    application?.generatedPermit?.file?.pdf?.mimeType,
    generatedPreviewReloadSignal,
  ]);

  const handleSaveDecision = async () => {
    if (!onSaveDecision) return;

    if (decisionMode === "permit_approval" && decision === "approved") {
      // Prevent approval while any payment assessment is still pending.
      if (hasPendingPaymentForPermitApproval) {
        setDecisionError(
          "Permit cannot be approved while payment status is pending.",
        );
        return;
      }
    }

    const nextRemark = remark.trim();
    if (decision === "denied" && !nextRemark) {
      setDecisionError("Remarks are required when decision is Denied.");
      return;
    }

    setDecisionError(null);
    await onSaveDecision({ decision, remark: nextRemark });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:max-h-[calc(100vh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 shrink-0 rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4 md:px-8">
          <h2 className="text-xl md:text-2xl font-black text-[#0F2942]">
            {application?.permitType || "Submitted Application Details"}
          </h2>
        </div>

        <div className="min-h-0 overflow-y-auto p-5 md:p-8 space-y-6">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-[#0F2942] font-semibold">
              <FiLoader className="animate-spin mr-2" />
              Loading application details...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : !application ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              Application details are not available.
            </div>
          ) : (
            <>
              {isPermitValidityView ? (
                <PermitValidityDetailsPanels
                  application={application}
                  enabledResponses={permitValidityEnabledResponses}
                />
              ) : isPermitReleaseView ? null : (
                <SubmittedSectionsPanel sections={submittedSections} />
              )}

              {canDecide && (
                <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                  <h3 className="text-lg font-black text-[#0F2942] mb-4">
                    {decisionMode === "inspection_request"
                      ? "Inspection Request Decision"
                      : "Permit Approval Decision"}
                  </h3>

                  <div className="max-w-md">
                    <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
                      Decision
                    </label>
                    <select
                      value={decision}
                      onChange={(event) =>
                        setDecision(
                          event.target.value as
                            | BploPermitDecisionType
                            | BploInspectionDecisionType,
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F2942] font-semibold focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    >
                      <option
                        value="approved"
                        disabled={
                          decisionMode === "permit_approval" &&
                          hasPendingPaymentForPermitApproval
                        }
                      >
                        Approved
                      </option>
                      {decisionMode === "inspection_request" && (
                        <option value="pending">Pending</option>
                      )}
                      <option value="denied">Denied</option>
                    </select>
                  </div>

                  {decisionMode === "permit_approval" &&
                    hasPendingPaymentForPermitApproval && (
                      <p className="mt-3 text-sm font-semibold text-amber-700">
                        Approval is locked until payment status is fully paid.
                      </p>
                    )}

                  {decision === "denied" && (
                    <div className="mt-4 max-w-2xl">
                      <label className="block text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
                        Denial Remark
                      </label>
                      <textarea
                        rows={3}
                        value={remark}
                        onChange={(event) => setRemark(event.target.value)}
                        placeholder="Enter reason for denied application."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F2942] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                      />
                    </div>
                  )}

                  {decisionError && (
                    <p className="mt-3 text-sm font-semibold text-red-700">
                      {decisionError}
                    </p>
                  )}

                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleSaveDecision()}
                      disabled={
                        isSavingDecision ||
                        (decisionMode === "permit_approval" &&
                          decision === "approved" &&
                          hasPendingPaymentForPermitApproval)
                      }
                      className="px-6 py-3 rounded-xl bg-[#0F2942] text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSavingDecision ? "Saving..." : "Save Decision"}
                    </button>
                  </div>
                </section>
              )}

              {canManageGeneratedPermit && (
                <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                  <h3 className="text-lg font-black text-[#0F2942]">
                    {isPermitReleaseView ? "Permit" : "Generated Permit / Certificate"}
                  </h3>
                  {!application.generatedPermit ? (
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      No generated permit document yet for this approved record.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {!isPermitReleaseView && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                            Template
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                            {application.generatedPermit.templateName} (v
                            {application.generatedPermit.templateVersion})
                          </p>
                        </div>
                      )}
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                          Permit Preview
                        </p>
                        {isPreparingGeneratedPreview ? (
                          <div className="mt-3 inline-flex items-center text-xs font-semibold text-[#0F2942]">
                            <FiLoader className="mr-2 animate-spin" />
                            Preparing generated document preview...
                          </div>
                        ) : generatedPreviewError ? (
                          <p className="mt-2 text-xs font-semibold text-red-700">
                            {generatedPreviewError}
                          </p>
                        ) : !generatedPreviewUrl ? (
                          <p className="mt-2 text-xs font-semibold text-gray-600">
                            Generated document preview is not available.
                          </p>
                        ) : (
                          <div className="mt-3 space-y-2">
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                              <iframe
                                key={`generated-preview-${generatedPreviewReloadSignal}`}
                                title="Generated permit actual preview"
                                src={generatedPreviewSrc}
                                className="h-112 w-full"
                              />
                            </div>
                            {!isPermitReleaseView && (
                              <p className="text-[11px] font-semibold text-gray-500">
                                Preview uses the clear server-generated PDF.
                                Applicant copies continue to use watermark overlay.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {!isPermitReleaseView && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              application.generatedPermit.sentToApplicantAt
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {application.generatedPermit.sentToApplicantAt
                              ? "Sent To Applicant"
                              : "Generated"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {onGeneratePermit && (
                      <button
                        type="button"
                        onClick={() => void onGeneratePermit()}
                        disabled={isGeneratingPermit}
                        aria-busy={isGeneratingPermit}
                        className="inline-flex items-center rounded-xl bg-[#0F2942] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isGeneratingPermit && (
                          <FiLoader className="mr-2 animate-spin" />
                        )}
                        {isGeneratingPermit
                          ? "Generating Permit..."
                          : "Generate / Regenerate"}
                      </button>
                    )}
                    {canPrintGeneratedPermit && (
                      <button
                        type="button"
                        onClick={() => void onPrintGeneratedPermit?.()}
                        disabled={
                          isPrintingGeneratedPermit ||
                          !application.generatedPermit
                        }
                        className="inline-flex items-center rounded-xl border border-[#0F2942] bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPrintingGeneratedPermit && (
                          <FiLoader className="mr-2 animate-spin" />
                        )}
                        {isPrintingGeneratedPermit
                          ? "Preparing Print..."
                          : "Print Copy"}
                      </button>
                    )}
                    {onSendToApplicant && (
                      <button
                        type="button"
                        onClick={() => void onSendToApplicant()}
                        disabled={
                          isSendingToApplicant ||
                          !application.generatedPermit ||
                          Boolean(application.generatedPermit.sentToApplicantAt)
                        }
                        className="inline-flex items-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSendingToApplicant && (
                          <FiLoader className="mr-2 animate-spin" />
                        )}
                        {application.generatedPermit?.sentToApplicantAt
                          ? "Sent To Applicant"
                          : isSendingToApplicant
                            ? "Sending..."
                            : "Send To Applicant"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => (onDone ?? onClose)()}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942]"
                    >
                      {doneButtonLabel}
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
