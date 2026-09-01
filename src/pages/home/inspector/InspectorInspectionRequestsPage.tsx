import {
  getInspectorInspectionRequestByIdApi,
  getInspectorInspectionRequestsApi,
  setInspectorInspectionScheduleApi,
} from "@/api/inspector/inspector.api";
import StatusModal from "@/components/feedback/StatusModal";
import InspectorInspectionDetailsModal from "@/components/inspector/InspectorInspectionDetailsModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createInspectorSocket,
  INSPECTOR_INSPECTION_REQUEST_EVENT,
} from "@/socket/inspector.socket";
import { useAuthStore } from "@/stores/auth/auth.store";
import type {
  InspectorInspectionRequestDetailType,
  InspectorInspectionRequestType,
} from "@/types/inspector/inspector.type";
import {
  markInspectorRequestsSeen,
  markInspectorRequestsUpdated,
} from "@/utils/inspector/inspector-request-notification.util";
import { useCallback, useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 15;

export default function InspectorInspectionRequestsPage() {
  const user = useAuthStore((state) => state.user);
  const inspectorId = String(user?._id ?? "").trim();
  const [applications, setApplications] = useState<
    InspectorInspectionRequestType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<InspectorInspectionRequestDetailType | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadApplications = useCallback(
    async (options?: { silent?: boolean }) => {
      const isSilent = options?.silent ?? false;
      if (!isSilent) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const response = await getInspectorInspectionRequestsApi();
        // Canonical inspector request queue for this screen.
        setApplications(response.data ?? []);
        markInspectorRequestsSeen(inspectorId);
        if (isSilent) setError(null);
      } catch (err: unknown) {
        if (!isSilent) {
          const apiError = err as {
            response?: { data?: { message?: string } };
          };
          setError(
            apiError?.response?.data?.message ??
              "Failed to load inspector inspection requests.",
          );
        }
      } finally {
        if (!isSilent) setIsLoading(false);
      }
    },
    [inspectorId],
  );

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    const socket = createInspectorSocket();
    socket.on(
      INSPECTOR_INSPECTION_REQUEST_EVENT,
      (payload?: { updatedAt?: string | null }) => {
        // Keep notification marker and table data aligned with realtime updates.
        markInspectorRequestsUpdated(
          inspectorId,
          payload?.updatedAt ?? undefined,
        );
        void loadApplications({ silent: true });
      },
    );

    return () => {
      socket.off(INSPECTOR_INSPECTION_REQUEST_EVENT);
      socket.disconnect();
    };
  }, [inspectorId, loadApplications]);

  const openDetails = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplication(null);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const response =
        await getInspectorInspectionRequestByIdApi(applicationId);
      setSelectedApplication(response.data ?? null);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setDetailError(
        apiError?.response?.data?.message ??
          "Failed to load inspection request details.",
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
    setIsScheduling(false);
  };

  const setSchedule = async (params: {
    inspectionAt: string;
    remark: string;
  }) => {
    if (!selectedApplicationId) return;
    setIsScheduling(true);
    setDetailError(null);

    try {
      await setInspectorInspectionScheduleApi(selectedApplicationId, {
        inspectionAt: params.inspectionAt,
      });
      closeDetails();
      setShowSuccessModal(true);
      // Refresh queue immediately after scheduling to reflect moved status.
      await loadApplications();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setDetailError(
        apiError?.response?.data?.message ??
          "Failed to set inspection schedule.",
      );
    } finally {
      setIsScheduling(false);
    }
  };

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.assignedAt ?? b.submittedAt).getTime() -
          new Date(a.assignedAt ?? a.submittedAt).getTime(),
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

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-inspector-tour="inspection-requests-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Inspection Request
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Department-assigned inspection requests for your account.
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
            No inspection requests assigned to you.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-160">
              <thead className="bg-[#0F2942] text-white text-sm uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-4">Applicant Name</th>
                  <th className="px-5 py-4">Permit Type</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Step</th>
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
                    <td className="px-5 py-4 text-gray-700 font-semibold">
                      {application.currentDepartment}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {application.currentSequence} /{" "}
                      {application.totalDepartments}
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

      <InspectorInspectionDetailsModal
        isOpen={!!selectedApplicationId}
        isLoading={isDetailLoading}
        isSaving={isScheduling}
        error={detailError}
        mode="create"
        application={selectedApplication}
        onClose={closeDetails}
        onSaveSchedule={setSchedule}
      />

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Scheduled"
        message="Inspection schedule set successfully."
        autoCloseMs={2200}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
