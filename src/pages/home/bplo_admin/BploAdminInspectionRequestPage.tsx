import {
  getInspectionRequestApplicationsApi,
  getRoutedApplicationByIdApi,
  saveInspectionRequestDecisionApi,
} from "@/api/bplo_admin/bplo_admin.api";
import { BploAdminQueueResultsSkeleton } from "@/components/bplo_admin/BploAdminLoading";
import StatusModal from "@/components/feedback/StatusModal";
import RoutedApplicationDetailsModal from "@/components/bplo_admin/RoutedApplicationDetailsModal";
import {
  ADMIN_INSPECTION_REQUEST_EVENT,
  createBploAdminSocket,
} from "@/socket/bplo_admin.socket";
import type {
  BploInspectionDecisionType,
  BploRoutedApplicationDetailType,
  BploRoutedApplicationType,
} from "@/types/bplo_admin/bplo_admin.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useMemo, useState } from "react";

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

const statusLabelMap: Record<string, string> = {
  for_inspection: "For Inspection",
  pending: "Pending",
  approved: "Approved",
  denied: "Denied",
};

export default function BploAdminInspectionRequestPage() {
  const [applications, setApplications] = useState<BploRoutedApplicationType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<BploRoutedApplicationDetailType | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getInspectionRequestApplicationsApi();
      // Canonical queue for inspector-routing decisions in this screen.
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load inspection request applications.",
        );
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  useEffect(() => {
    // Polling remains as fallback if realtime events are delayed.
    const intervalId = window.setInterval(() => {
      void loadApplications({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = createBploAdminSocket();

    socket.on(
      ADMIN_INSPECTION_REQUEST_EVENT,
      (incoming: BploRoutedApplicationType[]) => {
        setApplications(incoming ?? []);
      },
    );

    return () => {
      socket.off(ADMIN_INSPECTION_REQUEST_EVENT);
      socket.disconnect();
    };
  }, []);

  const openDetails = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplication(null);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const response = await getRoutedApplicationByIdApi(applicationId);
      setSelectedApplication(response.data ?? null);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setDetailError(
        apiError?.response?.data?.message ??
          "Failed to load application details.",
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
    setIsSavingDecision(false);
  };

  const saveDecision = async (params: {
    decision: BploInspectionDecisionType;
    remark: string;
  }) => {
    if (!selectedApplicationId) return;

    setIsSavingDecision(true);
    setDetailError(null);

    try {
      const response = await saveInspectionRequestDecisionApi(selectedApplicationId, {
        decision: params.decision,
        remark: params.remark,
      });

      setSelectedApplication(response.data ?? null);
      closeDetails();
      setShowSuccessModal(true);
      // Refresh list immediately so routed queue reflects latest admin action.
      await loadApplications();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setDetailError(
        apiError?.response?.data?.message ??
          "Failed to save inspection request decision.",
      );
    } finally {
      setIsSavingDecision(false);
    }
  };

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.decidedAt ?? b.submittedAt).getTime() -
          new Date(a.decidedAt ?? a.submittedAt).getTime(),
      ),
    [applications],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedApplications.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedApplications.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedApplications]);

  const pageStart =
    sortedApplications.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedApplications.length);
  const paginationItems = getPaginationItems(currentPage, totalPages);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 pb-24 sm:gap-6 md:h-full md:min-h-0 md:overflow-hidden md:pb-0">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-bplo-admin-tour="inspection-request-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Inspection Request
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Applications routed by evaluator for inspection processing.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
          </div>
        )}

      <div className="flex min-h-96 w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:min-h-0 md:flex-1">
        <div className="md:min-h-0 md:flex-1">
          {isLoading ? (
            <BploAdminQueueResultsSkeleton />
          ) : sortedApplications.length === 0 ? (
            <div className="flex h-full items-center justify-center py-16 text-center text-sm font-semibold text-gray-500">
              No applications routed for inspection.
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 md:hidden">
                {paginatedApplications.map((application) => (
                  <article key={application._id} className="p-4 sm:p-5">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="wrap-break-word text-lg font-black leading-tight text-[#0F2942]">
                            {application.applicantName}
                          </p>
                          <p className="mt-1 wrap-break-word text-sm font-semibold text-gray-500">
                            {application.permitType}
                          </p>
                        </div>

                        <span className="inline-flex w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                          {statusLabelMap[application.tableStatus] ?? "Pending"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => void openDetails(application._id)}
                        className="w-full rounded-xl bg-[#0F2942] px-4 py-3 text-sm font-bold text-white cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-auto md:block md:h-full">
                <table className="w-full min-w-160 border-collapse text-left">
                  <thead className="bg-[#0F2942] text-sm uppercase tracking-wide text-white">
                    <tr>
                      <th className="px-5 py-4">Applicant Name</th>
                      <th className="px-5 py-4">Permit Type</th>
                      <th className="px-5 py-4">Status</th>
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
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                            {statusLabelMap[application.tableStatus] ?? "Pending"}
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
                            Details
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

        {!isLoading && sortedApplications.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-gray-600">
              Showing {pageStart}-{pageEnd} of {sortedApplications.length}
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
        canDecide
        decisionMode="inspection_request"
        isSavingDecision={isSavingDecision}
        onClose={closeDetails}
        onSaveDecision={(params) =>
          saveDecision({
            decision: params.decision as BploInspectionDecisionType,
            remark: params.remark,
          })
        }
      />

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Saved"
        message="Inspection request decision updated successfully."
        autoCloseMs={2200}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
