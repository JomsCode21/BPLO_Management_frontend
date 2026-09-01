import {
  getPermitReleaseApplicationsApi,
  getRoutedApplicationByIdApi,
} from "@/api/bplo_admin/bplo_admin.api";
import { BploAdminQueueResultsSkeleton } from "@/components/bplo_admin/BploAdminLoading";
import RoutedApplicationDetailsModal from "@/components/bplo_admin/RoutedApplicationDetailsModal";
import {
  ADMIN_PERMIT_APPROVAL_EVENT,
  ADMIN_PERMIT_VALIDITY_EVENT,
  createBploAdminSocket,
} from "@/socket/bplo_admin.socket";
import { renderPdfPagesToImageDataUrlsFromBlob } from "@/utils/pdf-preview.util";
import type {
  BploPermitReleaseApplicationType,
  BploRoutedApplicationDetailType,
} from "@/types/bplo_admin/bplo_admin.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiSearch } from "react-icons/fi";

const ITEMS_PER_PAGE = 10;

const getPaginationItems = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const visiblePages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage <= 3) {
    visiblePages.add(2);
    visiblePages.add(3);
  } else if (currentPage >= totalPages - 2) {
    visiblePages.add(totalPages - 1);
    visiblePages.add(totalPages - 2);
    visiblePages.add(totalPages - 3);
    visiblePages.add(totalPages - 4);
  } else {
    visiblePages.add(currentPage - 1);
    visiblePages.add(currentPage + 1);
  }

  const sortedPages = Array.from(visiblePages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
  const paginationItems: Array<number | string> = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];
    if (previousPage && page - previousPage > 1) {
      paginationItems.push(`ellipsis-${previousPage}-${page}`);
    }
    paginationItems.push(page);
  });

  return paginationItems;
};

const getRequestErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as {
    response?: { data?: { message?: string } };
    request?: unknown;
  };
  const message = apiError?.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (apiError?.request) {
    return `${fallback} No server response received. Please retry.`;
  }
  return fallback;
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getReleaseBadgeClass = (
  status: BploPermitReleaseApplicationType["releaseStatus"],
) => {
  if (status === "sent_to_applicant") {
    return "bg-emerald-100 text-emerald-700";
  }
  return "bg-amber-100 text-amber-700";
};

const getReleaseLabel = (
  status: BploPermitReleaseApplicationType["releaseStatus"],
) => {
  return status === "sent_to_applicant" ? "Sent To Applicant" : "For Release";
};

const decodeBase64ToArrayBuffer = (contentBase64: string) => {
  const binaryString = window.atob(contentBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  return bytes.buffer;
};

export default function BploAdminPermitReleasePage() {
  const [applications, setApplications] = useState<BploPermitReleaseApplicationType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activePermitType, setActivePermitType] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<BploRoutedApplicationDetailType | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isPrintingGeneratedPermit, setIsPrintingGeneratedPermit] =
    useState(false);
  const [isPermitMenuOpen, setIsPermitMenuOpen] = useState(false);
  const permitMenuRef = useRef<HTMLDivElement | null>(null);
  const [generatedPreviewReloadSignal, setGeneratedPreviewReloadSignal] =
    useState(0);

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getPermitReleaseApplicationsApi();
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        setError(
          getRequestErrorMessage(err, "Unable to load permit release records."),
        );
      }
    } finally {
      if (!isSilent) {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  useEffect(() => {
    // Polling fallback keeps release queue fresh if realtime events are delayed.
    const intervalId = window.setInterval(() => {
      void loadApplications({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = createBploAdminSocket();
    const triggerReload = () => {
      void loadApplications({ silent: true });
    };

    socket.on(ADMIN_PERMIT_APPROVAL_EVENT, triggerReload);
    socket.on(ADMIN_PERMIT_VALIDITY_EVENT, triggerReload);

    return () => {
      socket.off(ADMIN_PERMIT_APPROVAL_EVENT, triggerReload);
      socket.off(ADMIN_PERMIT_VALIDITY_EVENT, triggerReload);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isPermitMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!permitMenuRef.current) return;
      if (!permitMenuRef.current.contains(event.target as Node)) {
        setIsPermitMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isPermitMenuOpen]);

  const openDetails = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplication(null);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const response = await getRoutedApplicationByIdApi(applicationId);
      setSelectedApplication(response.data ?? null);
    } catch (err: unknown) {
      setDetailError(
        getRequestErrorMessage(err, "Unable to load application details."),
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedApplicationId(null);
    setSelectedApplication(null);
    setIsDetailLoading(false);
    setDetailError(null);
    setIsPrintingGeneratedPermit(false);
  };

  const getClearPdfBlob = () => {
    const clearPdfBase64 =
      selectedApplication?.generatedPermit?.file?.pdf?.clearContentBase64;
    const clearPdfMimeType =
      selectedApplication?.generatedPermit?.file?.pdf?.mimeType ||
      "application/pdf";

    if (!clearPdfBase64) {
      setDetailError("No clear generated permit PDF available.");
      return null;
    }

    const arrayBuffer = decodeBase64ToArrayBuffer(clearPdfBase64);
    return new Blob([arrayBuffer], { type: clearPdfMimeType });
  };

  const printOriginalCopy = async () => {
    setIsPrintingGeneratedPermit(true);
    setDetailError(null);
    const refreshGeneratedPreview = () => {
      setGeneratedPreviewReloadSignal((previous) => previous + 1);
    };
    const handleAfterPrint = () => {
      refreshGeneratedPreview();
    };
    window.addEventListener("afterprint", handleAfterPrint, { once: true });

    try {
      const printableBlob = getClearPdfBlob();
      if (!printableBlob) return;
      // Render PDF pages to images for more consistent browser print behavior.
      const renderedPages = await renderPdfPagesToImageDataUrlsFromBlob(
        printableBlob,
        "application/pdf",
        { maxWidth: 1240 },
      );
      if (renderedPages.length === 0) {
        setDetailError("No printable permit pages were generated.");
        return;
      }

      const printFrame = document.createElement("iframe");
      printFrame.style.position = "fixed";
      printFrame.style.right = "0";
      printFrame.style.bottom = "0";
      printFrame.style.width = "0";
      printFrame.style.height = "0";
      printFrame.style.opacity = "0";
      printFrame.style.pointerEvents = "none";
      printFrame.style.border = "0";

      let hasCleanedUp = false;
      let hasPrintTriggered = false;
      let resolvePrintTriggered: (() => void) | null = null;
      const printTriggered = new Promise<void>((resolve) => {
        resolvePrintTriggered = resolve;
      });

      const markPrintTriggered = () => {
        if (hasPrintTriggered) return;
        hasPrintTriggered = true;
        resolvePrintTriggered?.();
      };

      const cleanup = () => {
        if (hasCleanedUp) return;
        hasCleanedUp = true;
        if (printFrame.parentNode) {
          printFrame.parentNode.removeChild(printFrame);
        }
      };

      const pagesMarkup = renderedPages
        .map(
          (pageImage, index) => `
            <section class="print-page ${index < renderedPages.length - 1 ? "print-break" : ""}">
              <img src="${pageImage}" alt="Permit page ${index + 1}" />
            </section>
          `,
        )
        .join("");

      printFrame.srcdoc = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Permit Print</title>
    <style>
      @page {
        margin: 0;
      }
      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }
      .print-page {
        width: 100%;
      }
      .print-page img {
        display: block;
        width: 100%;
        height: auto;
      }
      .print-break {
        page-break-after: always;
      }
    </style>
  </head>
  <body>
    ${pagesMarkup}
  </body>
</html>`;

      printFrame.onload = () => {
        try {
          const frameWindow = printFrame.contentWindow;
          if (!frameWindow) {
            throw new Error("Print frame did not initialize.");
          }
          frameWindow.focus();
          frameWindow.print();
          markPrintTriggered();
          window.setTimeout(cleanup, 300000);
        } catch {
          markPrintTriggered();
          cleanup();
          setDetailError("Direct print failed on this browser.");
        }
      };

      document.body.appendChild(printFrame);
      window.setTimeout(markPrintTriggered, 15000);
      await printTriggered;
    } catch {
      setDetailError("Unable to prepare printable original permit copy.");
    } finally {
      window.removeEventListener("afterprint", handleAfterPrint);
      setIsPrintingGeneratedPermit(false);
    }
  };

  const filteredApplications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const sorted = [...applications].sort((a, b) => {
      const bTime = new Date(b.generatedAt ?? b.approvedAt ?? b.submittedAt).getTime();
      const aTime = new Date(a.generatedAt ?? a.approvedAt ?? a.submittedAt).getTime();
      return bTime - aTime;
    });

    const permitFiltered =
      activePermitType === "all"
        ? sorted
        : sorted.filter((application) => application.permitType === activePermitType);

    if (!term) return permitFiltered;

    return permitFiltered.filter((application) => {
      const searchable = [
        application.applicantName,
        application.permitType,
        getReleaseLabel(application.releaseStatus),
        formatDateTime(application.approvedAt),
        application._id,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(term);
    });
  }, [activePermitType, applications, searchTerm]);

  const permitTabs = useMemo(() => {
    const permitTypes = Array.from(
      new Set(
        applications
          .map((application) => application.permitType)
          .filter((permitType) => permitType.trim()),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["all", ...permitTypes];
  }, [applications]);
  const hasPermitChoices = permitTabs.length > 1;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activePermitType, searchTerm]);

  useEffect(() => {
    if (permitTabs.length === 0) {
      setActivePermitType("all");
      return;
    }

    setActivePermitType((current) =>
      current === "all" || permitTabs.includes(current) ? current : permitTabs[1] ?? "all",
    );
  }, [permitTabs]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredApplications]);

  const pageStart =
    filteredApplications.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredApplications.length);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const showLoadingSkeleton = isLoading && !hasLoadedOnce;

  if (showLoadingSkeleton) {
    return <BploAdminQueueResultsSkeleton />;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 pb-24 sm:gap-6 md:h-full md:min-h-0 md:overflow-hidden md:pb-0">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-bplo-admin-tour="permit-release-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Permit Release
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Approved records with generated permits, ready for original-copy print.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-3xl border border-gray-100 bg-white p-3 shadow-sm md:p-4">
        <form className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <label className="lg:col-span-3">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              Search
            </span>
            <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3">
              <FiSearch className="text-gray-400" />
              <input
                id="permit-release-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by applicant, permit type, status, date, ID..."
                className="w-full px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </label>

          <label className="lg:col-span-2">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              Permit
            </span>
            <div className="relative" ref={permitMenuRef}>
              <button
                id="permit-release-type-filter"
                type="button"
                onClick={() => {
                  if (!hasPermitChoices) return;
                  setIsPermitMenuOpen((prev) => !prev);
                }}
                className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-[#0F2942] outline-none transition ${
                  hasPermitChoices ? "hover:border-gray-300" : "cursor-default"
                }`}
              >
                <span className="truncate">
                  {activePermitType === "all" ? "All" : activePermitType}
                </span>
                <FiChevronDown
                  className={`ml-2 text-gray-500 transition-transform ${
                    isPermitMenuOpen && hasPermitChoices ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPermitMenuOpen && hasPermitChoices && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  {permitTabs.map((tab) => {
                    const optionLabel = tab === "all" ? "All" : tab;
                    const isActive = tab === activePermitType;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => {
                          setActivePermitType(tab);
                          setCurrentPage(1);
                          setIsPermitMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-[#0F2942] text-white"
                            : "text-[#0F2942] hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{optionLabel}</span>
                        {isActive && <FiCheck className="ml-2 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </label>
        </form>
      </section>

      <div className="flex min-h-96 w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:min-h-0 md:flex-1">
        <div className="md:min-h-0 md:flex-1">
          {filteredApplications.length === 0 ? (
            <div className="flex h-full items-center justify-center py-16 text-center text-sm font-semibold text-gray-500">
              No permit release records found.
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 md:hidden">
                {paginatedApplications.map((application) => (
                  <article key={application._id} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-black leading-tight text-[#0F2942] wrap-break-words">
                            {application.applicantName}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-500 wrap-break-word">
                            {application.permitType}
                          </p>
                        </div>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${getReleaseBadgeClass(
                            application.releaseStatus,
                          )}`}
                        >
                          {getReleaseLabel(application.releaseStatus)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                            Approved At
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#0F2942]">
                            {formatDateTime(application.approvedAt)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => void openDetails(application._id)}
                        className="w-full rounded-xl bg-[#0F2942] px-4 py-3 text-sm font-bold text-white cursor-pointer"
                      >
                        View Permit
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-auto md:h-full md:block">
                <table className="w-full min-w-160 border-collapse text-left">
                  <thead className="bg-[#0F2942] text-sm uppercase tracking-wide text-white">
                    <tr>
                      <th className="px-5 py-4">Applicant Name</th>
                      <th className="px-5 py-4">Permit Type</th>
                      <th className="px-5 py-4">Approved At</th>
                      <th className="px-5 py-4">Release Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((application) => (
                      <tr
                        key={application._id}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => void openDetails(application._id)}
                      >
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {application.applicantName}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {application.permitType}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {formatDateTime(application.approvedAt)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getReleaseBadgeClass(
                              application.releaseStatus,
                            )}`}
                          >
                            {getReleaseLabel(application.releaseStatus)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void openDetails(application._id);
                            }}
                            className="rounded-xl bg-[#0F2942] px-4 py-2 text-sm font-bold text-white cursor-pointer"
                          >
                            View Permit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {filteredApplications.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-gray-600">
              Showing {pageStart}-{pageEnd} of {filteredApplications.length}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {paginationItems.map((item) => {
                  if (typeof item !== "number") {
                    return (
                      <span
                        key={item}
                        className="inline-flex h-8 min-w-8 items-center justify-center px-1 text-sm font-bold text-gray-400"
                      >
                        ...
                      </span>
                    );
                  }

                  const isActive = item === currentPage;
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setCurrentPage(item)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-sm font-bold cursor-pointer ${
                        isActive
                          ? "bg-[#0F2942] text-white"
                          : "border border-gray-200 text-[#0F2942]"
                      }`}
                    >
                      {item}
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

      <RoutedApplicationDetailsModal
        isOpen={!!selectedApplicationId}
        isLoading={isDetailLoading}
        error={detailError}
        application={selectedApplication}
        isPermitReleaseView
        canManageGeneratedPermit={Boolean(selectedApplication?.generatedPermit)}
        canPrintGeneratedPermit={Boolean(selectedApplication?.generatedPermit)}
        isPrintingGeneratedPermit={isPrintingGeneratedPermit}
        generatedPreviewReloadSignal={generatedPreviewReloadSignal}
        onClose={closeDetails}
        onPrintGeneratedPermit={printOriginalCopy}
        onDone={closeDetails}
        doneButtonLabel="Close"
      />
    </div>
  );
}
