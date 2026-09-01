import {
  getOwnerGeneratedDocumentPdfApi,
  getOwnerGeneratedDocumentsApi,
} from "@/api/owner/owner.api";
import type { OwnerGeneratedDocumentType } from "@/types/owner/owner.type";
import { renderPdfFirstPageToImageDataUrlFromBlob } from "@/utils/pdf-preview.util";
import { useEffect, useMemo, useState } from "react";
import { FiClock, FiFileText, FiLoader } from "react-icons/fi";

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

const getDocumentTypeLabel = (documentKind: OwnerGeneratedDocumentType["documentKind"]) =>
  documentKind === "permit"
    ? "Business Permit"
    : "Inspection Certificate";

const documentTypeBadgeClass = (
  documentKind: OwnerGeneratedDocumentType["documentKind"],
) =>
  documentKind === "permit"
    ? "bg-[#F2C94C] text-[#0F2942]"
    : "bg-[#8DD6FF] text-[#0F2942]";

type PreviewCardProps = {
  document: OwnerGeneratedDocumentType;
};

function GeneratedDocumentPreviewCard({ document }: PreviewCardProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(true);

  useEffect(() => {
    let isActive = true;
    setIsRendering(true);
    setPreviewError(null);

    void getOwnerGeneratedDocumentPdfApi(
      document.statusId,
      document.documentKind,
    )
      .then((blob) =>
        renderPdfFirstPageToImageDataUrlFromBlob(blob, document.mimeType, {
          maxWidth: 1000,
        }),
      )
      .then((dataUrl) => {
        if (!isActive) return;
        setPreviewUrl(dataUrl);
      })
      .catch(() => {
        if (!isActive) return;
        setPreviewUrl("");
        setPreviewError("Preview is unavailable for this document.");
      })
      .finally(() => {
        if (!isActive) return;
        setIsRendering(false);
      });

    return () => {
      isActive = false;
    };
  }, [document.documentKind, document.mimeType, document.statusId]);

  return (
    <article className="rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(27,58,84,0.96)_0%,rgba(17,43,66,0.98)_100%)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            {document.permitType || "Business Permit"}
          </p>
          <p className="mt-1 truncate text-xs font-semibold text-white/70">
            {document.templateName} (v{document.templateVersion || 1})
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${documentTypeBadgeClass(document.documentKind)}`}
        >
          {getDocumentTypeLabel(document.documentKind)}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/65">
        <FiClock className="text-sm" />
        <span>Generated: {formatDate(document.generatedAt)}</span>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0E2C45]">
        {isRendering ? (
          <div className="flex h-56 items-center justify-center text-sm font-semibold text-white/72">
            <FiLoader className="mr-2 animate-spin text-base" />
            Rendering preview...
          </div>
        ) : previewError ? (
          <div className="flex h-56 items-center justify-center px-4 text-center text-sm font-semibold text-rose-200">
            {previewError}
          </div>
        ) : (
          <img
            src={previewUrl}
            alt={`${getDocumentTypeLabel(document.documentKind)} preview`}
            className="h-auto w-full object-cover"
            loading="lazy"
          />
        )}
      </div>
    </article>
  );
}

export default function UserAccountSettingsGeneratedDocumentsSection() {
  const [documents, setDocuments] = useState<OwnerGeneratedDocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadDocuments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getOwnerGeneratedDocumentsApi();
        const nextDocuments = response.data ?? [];

        if (!isActive) return;
        setDocuments(nextDocuments);
      } catch {
        if (!isActive) return;
        setError("Failed to load generated documents.");
      } finally {
        if (!isActive) return;
        setIsLoading(false);
      }
    };

    void loadDocuments();

    return () => {
      isActive = false;
    };
  }, []);

  const hasDocuments = useMemo(() => documents.length > 0, [documents.length]);
  const hasOddNumberOfDocuments = documents.length % 2 !== 0;

  return (
    <section className="overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(41,77,107,0.95)_0%,rgba(14,38,59,0.98)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-sm">
      <div className="border-b border-white/10 bg-white/5 px-5 py-5 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#F2C94C]">
          Generated Records
        </p>
        <h3 className="mt-2 text-2xl font-bold text-white">
          Permit and Certificate Images
        </h3>
        <p className="mt-1 text-sm text-white/70">
          Generated permit and inspection certificate previews for your account.
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        {isLoading ? (
          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-5 text-sm font-semibold text-white/75">
            <FiLoader className="mr-2 inline-block animate-spin text-base" />
            Loading generated document previews...
          </div>
        ) : error ? (
          <div className="rounded-[1.4rem] border border-rose-200/40 bg-rose-500/10 px-4 py-5 text-sm font-semibold text-rose-200">
            {error}
          </div>
        ) : !hasDocuments ? (
          <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-5 text-sm font-semibold text-white/75">
            No generated permit or inspection certificate found yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {documents.map((document, index) => {
              const isLastOddItem =
                hasOddNumberOfDocuments && index === documents.length - 1;

              return (
                <div
                  key={document.id}
                  className={
                    isLastOddItem ? "md:col-span-2 md:mx-auto md:w-[78%]" : ""
                  }
                >
                  <GeneratedDocumentPreviewCard document={document} />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/72">
          <FiFileText className="mr-2 inline-block text-base text-white/75" />
          These previews are rendered from your finalized PDF records.
        </div>
      </div>
    </section>
  );
}
