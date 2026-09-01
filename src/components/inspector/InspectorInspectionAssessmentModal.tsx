import type { InspectorInspectionRequestDetailType } from "@/types/inspector/inspector.type";
import type { GeneratedInspectionCertificateType } from "@/api/inspector/inspector.api";
import {
  buildSubmittedSections,
  InspectorSubmittedSectionsAccordion,
} from "@/components/inspector/submitted-sections.shared";
import { createPdfObjectUrlFromBase64 } from "@/utils/pdf-preview.util";
import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

type AssessmentResultType = "passed" | "for_completion" | "failed";

type InspectorInspectionAssessmentModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  application: InspectorInspectionRequestDetailType | null;
  showGeneratedCertificatePanel?: boolean;
  generatedCertificate?: GeneratedInspectionCertificateType | null;
  isGeneratingCertificate?: boolean;
  onClose: () => void;
  onGenerateCertificate?: () => Promise<void> | void;
  onDone?: () => void;
  onSubmitAssessment: (params: {
    result: AssessmentResultType;
    remark: string;
  }) => Promise<void> | void;
};

export default function InspectorInspectionAssessmentModal({
  isOpen,
  isLoading,
  isSaving,
  error,
  application,
  showGeneratedCertificatePanel = false,
  generatedCertificate = null,
  isGeneratingCertificate = false,
  onClose,
  onGenerateCertificate,
  onDone,
  onSubmitAssessment,
}: InspectorInspectionAssessmentModalProps) {
  const [result, setResult] = useState<AssessmentResultType>("passed");
  const [remark, setRemark] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [openSectionIds, setOpenSectionIds] = useState<string[]>([]);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState("");
  const [generatedPreviewError, setGeneratedPreviewError] = useState<
    string | null
  >(null);
  const [isPreparingGeneratedPreview, setIsPreparingGeneratedPreview] =
    useState(false);

  const submittedSections = useMemo(() => {
    return buildSubmittedSections(application);
  }, [application]);

  useEffect(() => {
    setOpenSectionIds([]);
  }, [application?._id]);

  useEffect(() => {
    const buildGeneratedPreviewUrl = async () => {
      const clearPdfBase64 = generatedCertificate?.file?.pdf?.clearContentBase64;
      const clearPdfMimeType =
        generatedCertificate?.file?.pdf?.mimeType || "application/pdf";
      if (!clearPdfBase64) {
        setGeneratedPreviewUrl("");
        setGeneratedPreviewError(null);
        setIsPreparingGeneratedPreview(false);
        return;
      }

      setIsPreparingGeneratedPreview(true);
      setGeneratedPreviewError(null);

      try {
        const url = createPdfObjectUrlFromBase64(
          clearPdfBase64,
          clearPdfMimeType,
        );
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
    generatedCertificate?.file?.pdf?.clearContentBase64,
    generatedCertificate?.file?.pdf?.mimeType,
  ]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionIds((previous) =>
      previous.includes(sectionId)
        ? previous.filter((id) => id !== sectionId)
        : [...previous, sectionId],
    );
  };

  if (!isOpen) return null;

  const isRemarkRequired = result === "failed" || result === "for_completion";

  const handleSubmit = async () => {
    if (isRemarkRequired && !remark.trim()) {
      setFormError("Remark is required for this assessment result.");
      return;
    }
    setFormError(null);
    await onSubmitAssessment({
      result,
      remark: remark.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 px-5 md:px-8 py-4">
          <h2 className="text-xl md:text-2xl font-black text-[#0F2942]">
            Inspection Assessment
          </h2>
        </div>

        <div className="p-5 md:p-8 space-y-6">
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
              <InspectorSubmittedSectionsAccordion
                sections={submittedSections}
                openSectionIds={openSectionIds}
                onToggleSection={toggleSection}
              />

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 space-y-1">
                <p className="text-sm font-semibold text-gray-700">
                  Current Department:{" "}
                  <span className="font-black text-[#0F2942]">
                    {application.currentDepartment}
                  </span>{" "}
                  ({application.currentSequence} / {application.totalDepartments})
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Scheduled:{" "}
                  <span className="font-black text-[#0F2942]">
                    {application.scheduledInspectionAt
                      ? new Date(application.scheduledInspectionAt).toLocaleString(
                          "en-PH",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )
                      : "-"}
                  </span>
                </p>
              </div>

              {!showGeneratedCertificatePanel && (
                <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                <h3 className="text-lg font-black text-[#0F2942] mb-4">Assessment Result</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { value: "passed", label: "Passed" },
                    { value: "for_completion", label: "For Completion" },
                    { value: "failed", label: "Failed" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setResult(option.value as AssessmentResultType)}
                      className={`rounded-xl border px-4 py-3 text-sm font-bold cursor-pointer ${
                        result === option.value
                          ? "bg-[#0F2942] border-[#0F2942] text-white"
                          : "bg-white border-gray-200 text-[#0F2942]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-xs uppercase tracking-wide text-gray-500 font-bold">
                    Remarks {isRemarkRequired ? "(Required)" : "(Optional)"}
                  </label>
                  <textarea
                    rows={4}
                    value={remark}
                    onChange={(event) => setRemark(event.target.value)}
                    placeholder={
                      isRemarkRequired
                        ? "Required: provide complete assessment remarks."
                        : "Optional: add supporting notes."
                    }
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F2942] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  />
                </div>

                {formError && (
                  <p className="mt-3 text-sm font-semibold text-red-700">{formError}</p>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl bg-[#0F2942] text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSaving ? "Submitting..." : "Submit Assessment"}
                  </button>
                </div>
                </section>
              )}

              {showGeneratedCertificatePanel && (
                <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                  <h3 className="text-lg font-black text-[#0F2942]">
                    Generated Permit / Certificate
                  </h3>
                  {!generatedCertificate ? (
                    <p className="mt-2 text-sm font-semibold text-gray-600">
                      No generated permit document yet for this approved record.
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                          Template
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                          {generatedCertificate.templateName} (v
                          {generatedCertificate.templateVersion})
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                          Actual Document Preview
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
                                title="Generated permit actual preview"
                                src={generatedPreviewUrl}
                                className="h-112 w-full"
                              />
                            </div>
                            <p className="text-[11px] font-semibold text-gray-500">
                              Preview uses the clear server-generated PDF.
                              Download uses the same PDF with watermark overlay.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            generatedCertificate.sentToApplicantAt
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {generatedCertificate.sentToApplicantAt
                            ? "Sent To Applicant"
                            : "Generated"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void onGenerateCertificate?.()}
                      disabled={isGeneratingCertificate}
                      aria-busy={isGeneratingCertificate}
                      className="inline-flex items-center rounded-xl bg-[#0F2942] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isGeneratingCertificate && (
                        <FiLoader className="mr-2 animate-spin" />
                      )}
                      {isGeneratingCertificate
                        ? "Generating Permit..."
                        : "Generate / Regenerate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => (onDone ?? onClose)()}
                      className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942]"
                    >
                      Done
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
