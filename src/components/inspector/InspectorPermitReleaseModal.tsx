import type { GeneratedInspectionCertificateType } from "@/api/inspector/inspector.api";
import { createPdfObjectUrlFromBase64 } from "@/utils/pdf-preview.util";
import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

type InspectorPermitReleaseModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  isPrinting: boolean;
  error: string | null;
  title: string;
  generatedCertificate: GeneratedInspectionCertificateType | null;
  generatedPreviewReloadSignal?: number;
  onClose: () => void;
  onPrintCopy: () => Promise<void> | void;
};

export default function InspectorPermitReleaseModal({
  isOpen,
  isLoading,
  isPrinting,
  error,
  title,
  generatedCertificate,
  generatedPreviewReloadSignal = 0,
  onClose,
  onPrintCopy,
}: InspectorPermitReleaseModalProps) {
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState("");
  const [generatedPreviewError, setGeneratedPreviewError] = useState<
    string | null
  >(null);
  const [isPreparingGeneratedPreview, setIsPreparingGeneratedPreview] =
    useState(false);
  const generatedPreviewSrc = generatedPreviewUrl
    ? `${generatedPreviewUrl}#zoom=page-width`
    : "";

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
        const url = createPdfObjectUrlFromBase64(clearPdfBase64, clearPdfMimeType);
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
    generatedPreviewReloadSignal,
  ]);

  const canPrint = useMemo(
    () => Boolean(generatedCertificate?.file?.pdf?.clearContentBase64),
    [generatedCertificate?.file?.pdf?.clearContentBase64],
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl md:max-h-[calc(100vh-3rem)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 shrink-0 rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4 md:px-8">
          <h2 className="text-xl font-black text-[#0F2942] md:text-2xl">
            {title || "Permit"}
          </h2>
        </div>

        <div className="min-h-0 space-y-6 overflow-y-auto p-5 md:p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 font-semibold text-[#0F2942]">
              <FiLoader className="mr-2 animate-spin" />
              Loading generated certificate...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : !generatedCertificate ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              Generated certificate is not available.
            </div>
          ) : (
            <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
              <h3 className="text-lg font-black text-[#0F2942]">Permit</h3>

              <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
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
                        key={`inspector-generated-preview-${generatedPreviewReloadSignal}`}
                        title="Generated certificate preview"
                        src={generatedPreviewSrc}
                        className="h-112 w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void onPrintCopy()}
                  disabled={isPrinting || !canPrint}
                  className="inline-flex items-center rounded-xl border border-[#0F2942] bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPrinting && <FiLoader className="mr-2 animate-spin" />}
                  {isPrinting ? "Preparing Print..." : "Print Copy"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942]"
                >
                  Close
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

