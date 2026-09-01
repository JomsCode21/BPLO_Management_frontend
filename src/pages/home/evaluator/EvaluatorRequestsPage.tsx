import {
  getEvaluatorApplicationByIdApi,
  getEvaluatorApplicationsApi,
  getEvaluatorInspectionProcessApi,
  saveEvaluatorDecisionApi,
} from "@/api/evaluator/evaluator.api";
import { decisionNotificationMessageMap } from "@/components/evaluator/requests/shared";
import { LazyModalFallback } from "@/components/ui/LazyFallback";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createEvaluatorSocket,
  EVALUATOR_APPLICATIONS_EVENT,
} from "@/socket/evaluator.socket";
import type {
  EvaluatorApplicationDetailType,
  EvaluatorApplicationListItemType,
  EvaluatorDecisionType,
  EvaluatorTableStatus,
} from "@/types/evaluator/evaluator.type";
import type { InspectionDepartmentType } from "@/types/process/process.type";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

const EvaluatorRequestDetailsModal = lazy(
  () => import("@/components/evaluator/requests/EvaluatorRequestDetailsModal"),
);
const EvaluatorRequestSaveStatusModal = lazy(
  () =>
    import("@/components/evaluator/requests/EvaluatorRequestSaveStatusModal"),
);

const statusLabelMap: Record<EvaluatorTableStatus, string> = {
  for_review: "For Review",
  re_submission: "Re-submission",
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "message" in err.response.data &&
    typeof err.response.data.message === "string"
  ) {
    return err.response.data.message;
  }

  return fallback;
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
  return getErrorMessage(err, fallback);
};

const ITEMS_PER_PAGE = 15;

export default function EvaluatorRequestsPage() {
  const [applications, setApplications] = useState<
    EvaluatorApplicationListItemType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<EvaluatorApplicationDetailType | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [processes, setProcesses] = useState<InspectionDepartmentType[]>([]);
  const [decision, setDecision] =
    useState<EvaluatorDecisionType>("for_inspection");
  const [remark, setRemark] = useState("");
  const [notRequiredProcessIds, setNotRequiredProcessIds] = useState<string[]>(
    [],
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveStatusModal, setShowSaveStatusModal] = useState(false);
  const [saveStatusMessage, setSaveStatusMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getEvaluatorApplicationsApi();
      // Source of truth for pending evaluator queue; refreshed by polling and socket pushes.
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (!isSilent) {
        setError(getErrorMessage(err, "Failed to load application requests."));
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  useEffect(() => {
    // Polling acts as a fallback safety net for missed websocket events.
    const intervalId = window.setInterval(() => {
      void loadApplications({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = createEvaluatorSocket();

    socket.on(
      EVALUATOR_APPLICATIONS_EVENT,
      (incoming: EvaluatorApplicationListItemType[]) => {
        setApplications(incoming ?? []);
      },
    );

    return () => {
      socket.off(EVALUATOR_APPLICATIONS_EVENT);
      socket.disconnect();
    };
  }, []);

  const loadProcessList = async () => {
    try {
      const response = await getEvaluatorInspectionProcessApi();
      const ordered = [...(response.data?.departments ?? [])].sort(
        (a, b) => a.sequence - b.sequence,
      );
      setProcesses(ordered);
    } catch {
      setProcesses([]);
    }
  };

  const openDetails = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplication(null);
    setIsDetailLoading(true);
    setDetailError(null);
    setFormError(null);
    setShowSaveStatusModal(false);

    try {
      const [detailResponse] = await Promise.all([
        // Load application detail and process checklist together to reduce modal wait time.
        getEvaluatorApplicationByIdApi(applicationId),
        loadProcessList(),
      ]);

      const detail = detailResponse.data;
      setSelectedApplication(detail);

      const initialDecision =
        detail.evaluatorResult?.decision ?? "for_inspection";
      setDecision(initialDecision);
      setRemark(detail.evaluatorResult?.remark ?? "");

      const initialNotRequired =
        detail.evaluatorResult?.decision === "for_inspection"
          ? (detail.evaluatorResult.processDecisions ?? [])
              .filter((item) => item.notRequired)
              .map((item) => item.processId)
          : [];

      setNotRequiredProcessIds(initialNotRequired);
    } catch (err: unknown) {
      setDetailError(
        getErrorMessage(err, "Failed to load application details."),
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedApplicationId(null);
    setSelectedApplication(null);
    setDetailError(null);
    setFormError(null);
    setShowSaveStatusModal(false);
    setNotRequiredProcessIds([]);
    setDecision("for_inspection");
    setRemark("");
    setSaveStatusMessage("");
  };

  const toggleNotRequired = (processId: string, checked: boolean) => {
    setNotRequiredProcessIds((prev) => {
      if (checked) return Array.from(new Set([...prev, processId]));
      return prev.filter((id) => id !== processId);
    });
  };

  const saveDecision = async () => {
    if (!selectedApplicationId) return;
    if (decision === "re_submission" && !remark.trim()) {
      setFormError("Please provide a remark for Re-submission.");
      return;
    }

    setIsSaving(true);
    setShowSaveStatusModal(false);
    setDetailError(null);
    setFormError(null);

    try {
      const response = await saveEvaluatorDecisionApi(selectedApplicationId, {
        decision,
        notRequiredProcessIds:
          decision === "for_inspection" ? notRequiredProcessIds : [],
        remark: decision === "re_submission" ? remark.trim() : "",
      });

      const updated = response.data;
      setSelectedApplication(updated);

      const decisionForNotification =
        updated.evaluatorResult?.decision ?? decision;
      setSaveStatusMessage(
        decisionNotificationMessageMap[decisionForNotification],
      );
      setShowSaveStatusModal(true);

      // Remove resolved item from current table so evaluator queue stays actionable.
      setApplications((prev) =>
        prev.filter((application) => application._id !== selectedApplicationId),
      );
    } catch (err: unknown) {
      setFormError(
        getRequestErrorMessage(err, "Unable to save evaluation decision."),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
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
    sortedApplications.length === 0
      ? 0
      : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(
    currentPage * ITEMS_PER_PAGE,
    sortedApplications.length,
  );
  const detailModalFallback = (
    <LazyModalFallback
      title="Loading application details"
      description="Preparing the evaluator review modal and submitted application data."
      align="top"
      maxWidthClassName="max-w-6xl"
    />
  );
  const statusModalFallback = (
    <LazyModalFallback
      title="Loading status confirmation"
      description="Preparing the evaluator decision update."
      compact
      maxWidthClassName="max-w-md"
    />
  );

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      {showSaveStatusModal && (
        <Suspense fallback={statusModalFallback}>
          <EvaluatorRequestSaveStatusModal
            isOpen={showSaveStatusModal}
            message={saveStatusMessage}
            onClose={closeDetails}
          />
        </Suspense>
      )}

      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-evaluator-tour="requests-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Application Request
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review submitted applications and assign evaluator decisions.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {sortedApplications.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            No submitted applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-160">
              <thead className="bg-[#0F2942] text-white text-sm uppercase tracking-wide">
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
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => void openDetails(application._id)}
                  >
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {application.applicantName}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {application.permitType}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          application.tableStatus === "re_submission"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {statusLabelMap[application.tableStatus]}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void openDetails(application._id);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#0F2942] text-white text-sm font-bold cursor-pointer"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && sortedApplications.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-gray-600">
              Showing {pageStart}-{pageEnd} of {sortedApplications.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isActive = page === currentPage;

                  return (
                    <button
                      key={page}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-sm font-bold cursor-pointer ${
                        isActive
                          ? "bg-[#0F2942] text-white"
                          : "border border-gray-200 text-[#0F2942]"
                      }`}
                    >
                      {page}
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

      {selectedApplicationId && (
        <Suspense fallback={detailModalFallback}>
          <EvaluatorRequestDetailsModal
            selectedApplication={selectedApplication}
            isDetailLoading={isDetailLoading}
            detailError={detailError}
            formError={formError}
            decision={decision}
            onDecisionChange={(nextDecision) => {
              setDecision(nextDecision);
              if (formError) setFormError(null);
            }}
            remark={remark}
            onRemarkChange={(nextRemark) => {
              setRemark(nextRemark);
              if (formError) setFormError(null);
            }}
            processes={processes}
            notRequiredProcessIds={notRequiredProcessIds}
            onToggleNotRequired={toggleNotRequired}
            isSaving={isSaving}
            onSave={saveDecision}
            onClose={closeDetails}
          />
        </Suspense>
      )}
    </div>
  );
}
