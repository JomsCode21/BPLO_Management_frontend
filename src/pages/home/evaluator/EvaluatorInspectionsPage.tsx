import {
  getEvaluatorInspectionReviewApplicationsApi,
  getEvaluatorInspectionReviewByIdApi,
  submitEvaluatorInspectionReviewApi,
} from "@/api/evaluator/evaluator.api";
import { LazyModalFallback } from "@/components/ui/LazyFallback";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createEvaluatorSocket,
  EVALUATOR_INSPECTION_REVIEW_EVENT,
} from "@/socket/evaluator.socket";
import type {
  EvaluatorApplicationDetailType,
  EvaluatorInspectionReviewListItemType,
} from "@/types/evaluator/evaluator.type";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

const EvaluatorInspectionDetailsModal = lazy(
  () =>
    import("@/components/evaluator/inspections/EvaluatorInspectionDetailsModal"),
);
const EvaluatorInspectionSubmitStatusModal = lazy(
  () =>
    import("@/components/evaluator/inspections/EvaluatorInspectionSubmitStatusModal"),
);

const getStatusBadgeClass = (statusLabel: string) => {
  if (statusLabel === "Done") return "bg-emerald-100 text-emerald-700";
  if (statusLabel === "For Admin Approval") return "bg-blue-100 text-blue-700";
  if (statusLabel === "For Reinspection") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
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

const getStatusCode = (err: unknown): number | null => {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "status" in err.response &&
    typeof err.response.status === "number"
  ) {
    return err.response.status;
  }

  return null;
};

const ITEMS_PER_PAGE = 8;

export default function EvaluatorInspectionsPage() {
  const [activeTab, setActiveTab] = useState<
    "ongoing" | "done" | "reinspection"
  >("ongoing");
  const [applications, setApplications] = useState<
    EvaluatorInspectionReviewListItemType[]
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getEvaluatorInspectionReviewApplicationsApi();
      // Combined inspection-review feed across departments, grouped in UI tabs below.
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (getStatusCode(err) === 304) {
        // "Not Modified" means data is unchanged; keep current state.
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        setError(
          getErrorMessage(err, "Failed to load inspection review records."),
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
    // Keep table fresh even when realtime events are delayed.
    const intervalId = window.setInterval(() => {
      void loadApplications({ silent: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const socket = createEvaluatorSocket();

    socket.on(
      EVALUATOR_INSPECTION_REVIEW_EVENT,
      (incoming: EvaluatorInspectionReviewListItemType[]) => {
        setApplications(incoming ?? []);
        setError(null);
      },
    );

    return () => {
      socket.off(EVALUATOR_INSPECTION_REVIEW_EVENT);
      socket.disconnect();
    };
  }, []);

  const openDetails = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplication(null);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const response = await getEvaluatorInspectionReviewByIdApi(applicationId);
      setSelectedApplication(response.data ?? null);
    } catch (err: unknown) {
      setDetailError(
        getErrorMessage(err, "Failed to load inspection review details."),
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
  };

  const submitForAdminApproval = async () => {
    if (!selectedApplicationId || !selectedApplication?.inspectionReview)
      return;
    if (!selectedApplication.inspectionReview.canSubmitForAdminApproval) return;

    setIsSubmitting(true);
    setDetailError(null);

    try {
      await submitEvaluatorInspectionReviewApi(selectedApplicationId);
      setShowStatusModal(true);
      closeDetails();
      // Silent refresh updates tab counts/status after successful handoff to admin.
      await loadApplications({ silent: true });
    } catch (err: unknown) {
      setDetailError(
        getErrorMessage(err, "Failed to submit for admin approval."),
      );
    } finally {
      setIsSubmitting(false);
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

  const filteredApplications = useMemo(() => {
    if (activeTab === "done") {
      return sortedApplications.filter(
        (application) => application.inspectionReview.statusLabel === "Done",
      );
    }

    if (activeTab === "reinspection") {
      return sortedApplications.filter(
        (application) =>
          application.inspectionReview.statusLabel === "For Reinspection",
      );
    }

    return sortedApplications.filter(
      (application) =>
        application.inspectionReview.statusLabel !== "Done" &&
        application.inspectionReview.statusLabel !== "For Reinspection",
    );
  }, [activeTab, sortedApplications]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

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
  const pageEnd = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredApplications.length,
  );
  const detailModalFallback = (
    <LazyModalFallback
      title="Loading inspection details"
      description="Preparing the evaluator inspection review modal."
      align="top"
      maxWidthClassName="max-w-6xl"
    />
  );
  const statusModalFallback = (
    <LazyModalFallback
      title="Loading submission confirmation"
      description="Preparing the inspection review status update."
      compact
      maxWidthClassName="max-w-md"
    />
  );

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      {showStatusModal && (
        <Suspense fallback={statusModalFallback}>
          <EvaluatorInspectionSubmitStatusModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
          />
        </Suspense>
      )}

      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-evaluator-tour="inspections-header"
      >
        <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
          Inspection Review
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track department inspection progress and submit completed
          applications.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="px-1">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            aria-pressed={activeTab === "ongoing"}
            onClick={() => setActiveTab("ongoing")}
            className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer ${
              activeTab === "ongoing"
                ? "bg-white text-[#0F2942] shadow-sm"
                : "text-gray-600"
            }`}
          >
            Ongoing
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "done"}
            onClick={() => setActiveTab("done")}
            className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer ${
              activeTab === "done"
                ? "bg-white text-[#0F2942] shadow-sm"
                : "text-gray-600"
            }`}
          >
            Done
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "reinspection"}
            onClick={() => setActiveTab("reinspection")}
            className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer ${
              activeTab === "reinspection"
                ? "bg-white text-[#0F2942] shadow-sm"
                : "text-gray-600"
            }`}
          >
            Re-inspection
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            No records found for this tab.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-160">
              <thead className="bg-[#0F2942] text-white text-sm uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-4">Applicant Name</th>
                  <th className="px-5 py-4">Permit Type</th>
                  <th className="px-5 py-4">Inspection Status</th>
                  <th className="px-5 py-4">Where It Is Now</th>
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
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(application.inspectionReview.statusLabel)}`}
                      >
                        {application.inspectionReview.statusLabel}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                      {application.inspectionReview.whereNow}
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

        {!isLoading && filteredApplications.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-gray-600">
              Showing {pageStart}-{pageEnd} of {filteredApplications.length}
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
          <EvaluatorInspectionDetailsModal
            selectedApplication={selectedApplication}
            isDetailLoading={isDetailLoading}
            detailError={detailError}
            isSubmitting={isSubmitting}
            onClose={closeDetails}
            onSubmitForAdminApproval={submitForAdminApproval}
          />
        </Suspense>
      )}
    </div>
  );
}
