import {
  generatePermitDocumentApi,
  getPermitApprovalApplicationsApi,
  getRoutedApplicationByIdApi,
  savePermitApprovalDecisionApi,
  sendGeneratedPermitToApplicantApi,
} from "@/api/bplo_admin/bplo_admin.api";
import { BploAdminPermitApprovalSkeleton } from "@/layouts/home/home-fallback-skeletons";
import RoutedApplicationDetailsModal from "@/components/bplo_admin/RoutedApplicationDetailsModal";
import {
  ADMIN_PERMIT_APPROVAL_EVENT,
  createBploAdminSocket,
} from "@/socket/bplo_admin.socket";
import type {
  BploPermitDecisionType,
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
  for_admin_approval: "For Admin Approval",
};

const getPaymentStatusBadge = (paymentStatus?: "paid" | "pending") => {
  if (paymentStatus === "paid") {
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

export default function BploAdminPermitApprovalPage() {
  const [applications, setApplications] = useState<BploRoutedApplicationType[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<BploRoutedApplicationDetailType | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSavingDecision, setIsSavingDecision] = useState(false);
  const [isGeneratingPermit, setIsGeneratingPermit] = useState(false);
  const [isSendingToApplicant, setIsSendingToApplicant] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getPermitApprovalApplicationsApi();
      // Approval queue consumed by BPLO Admin after evaluator handoff.
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        setError(
          getRequestErrorMessage(
            err,
            "Unable to load permit approval applications.",
          ),
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
    // Keep list aligned with backend even if websocket packets are missed.
    const intervalId = window.setInterval(() => {
      void loadApplications({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = createBploAdminSocket();

    socket.on(
      ADMIN_PERMIT_APPROVAL_EVENT,
      (incoming: BploRoutedApplicationType[]) => {
        setApplications(incoming ?? []);
      },
    );

    return () => {
      socket.off(ADMIN_PERMIT_APPROVAL_EVENT);
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
    setIsSavingDecision(false);
    setIsGeneratingPermit(false);
    setIsSendingToApplicant(false);
  };

  const saveDecision = async (params: {
    decision: BploPermitDecisionType;
    remark: string;
  }) => {
    if (!selectedApplicationId) return;
    const applicationId = selectedApplicationId;

    setIsSavingDecision(true);
    setDetailError(null);

    try {
      const response = await savePermitApprovalDecisionApi(applicationId, {
        decision: params.decision,
        remark: params.remark,
      });

      setSelectedApplication(response.data ?? null);
      setApplications((prev) =>
        prev.filter((application) => application._id !== applicationId),
      );

      if (params.decision === "approved") {
        // Approval path triggers permit generation before final release/send actions.
        setIsGeneratingPermit(true);
        try {
          await generatePermitDocumentApi(applicationId);
        } catch (generationErr: unknown) {
          setDetailError(
            getRequestErrorMessage(
              generationErr,
              "Permit decision was saved, but document generation failed.",
            ),
          );
        } finally {
          setIsGeneratingPermit(false);
        }

        try {
          const details = await getRoutedApplicationByIdApi(applicationId);
          setSelectedApplication(details.data ?? null);
        } catch {
          // Keep existing selected application state if details refresh fails.
        }

        await loadApplications();
        return;
      }

      closeDetails();
      await loadApplications();
    } catch (err: unknown) {
      setDetailError(
        getRequestErrorMessage(err, "Unable to save permit decision."),
      );
    } finally {
      setIsSavingDecision(false);
    }
  };

  const refreshSelectedApplication = async () => {
    if (!selectedApplicationId) return;
    // Shared refresh used after generate/send actions to keep modal state current.
    const response = await getRoutedApplicationByIdApi(selectedApplicationId);
    setSelectedApplication(response.data ?? null);
  };

  const generatePermitDocument = async () => {
    if (!selectedApplicationId) return;
    setIsGeneratingPermit(true);
    setDetailError(null);
    try {
      await generatePermitDocumentApi(selectedApplicationId);
      await refreshSelectedApplication();
      await loadApplications();
    } catch (err: unknown) {
      setDetailError(
        getRequestErrorMessage(err, "Unable to generate permit document."),
      );
    } finally {
      setIsGeneratingPermit(false);
    }
  };

  const sendPermitToApplicant = async () => {
    if (!selectedApplicationId) return;
    setIsSendingToApplicant(true);
    setDetailError(null);
    try {
      await sendGeneratedPermitToApplicantApi(selectedApplicationId);
      await refreshSelectedApplication();
      await loadApplications();
    } catch (err: unknown) {
      setDetailError(
        getRequestErrorMessage(err, "Unable to send permit to applicant."),
      );
    } finally {
      setIsSendingToApplicant(false);
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
  const showLoadingSkeleton = isLoading && !hasLoadedOnce;

  if (showLoadingSkeleton) {
    return <BploAdminPermitApprovalSkeleton />;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 pb-24 sm:gap-6 md:h-full md:min-h-0 md:overflow-hidden md:pb-0">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-bplo-admin-tour="permit-approval-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Permit Approval
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Applications routed by evaluator for admin permit approval.
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
          {sortedApplications.length === 0 ? (
            <div className="flex h-full items-center justify-center py-16 text-center text-sm font-semibold text-gray-500">
              No applications routed for permit approval.
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 md:hidden">
                {paginatedApplications.map((application) => {
                  const paymentBadge = getPaymentStatusBadge(
                    application.paymentStatus,
                  );

                  return (
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

                        <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          {statusLabelMap[application.tableStatus] ?? "Pending"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-gray-500">
                          Payment:
                        </span>
                        <span
                          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
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
                  );
                })}
              </div>

              <div className="hidden overflow-auto md:block md:h-full">
                <table className="w-full min-w-160 border-collapse text-left">
                  <thead className="bg-[#0F2942] text-sm uppercase tracking-wide text-white">
                    <tr>
                      <th className="px-5 py-4">Applicant Name</th>
                      <th className="px-5 py-4">Permit Type</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Payment Status</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((application) => {
                      const paymentBadge = getPaymentStatusBadge(
                        application.paymentStatus,
                      );

                      return (
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
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            {statusLabelMap[application.tableStatus] ?? "Pending"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${paymentBadge.className}`}
                          >
                            {paymentBadge.label}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {sortedApplications.length > 0 && (
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
        canDecide={!selectedApplication?.adminResult?.decision}
        canManageGeneratedPermit={Boolean(
          selectedApplication?.adminResult?.decision === "approved",
        )}
        isGeneratingPermit={isGeneratingPermit}
        isSendingToApplicant={isSendingToApplicant}
        isSavingDecision={isSavingDecision}
        onClose={closeDetails}
        onSaveDecision={(params) =>
          saveDecision({
            decision: params.decision as BploPermitDecisionType,
            remark: params.remark,
          })
        }
        onGeneratePermit={generatePermitDocument}
        onSendToApplicant={sendPermitToApplicant}
        onDone={closeDetails}
      />
    </div>
  );
}
