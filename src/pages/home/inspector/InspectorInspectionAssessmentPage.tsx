import {
  completeInspectorInspectionRequestApi,
  generateInspectorInspectionCertificateApi,
  getInspectorGeneratedInspectionCertificateApi,
  getInspectorInspectionAssessmentsApi,
  getInspectorInspectionRequestByIdApi,
  type GeneratedInspectionCertificateType,
} from "@/api/inspector/inspector.api";
import StatusModal from "@/components/feedback/StatusModal";
import InspectorInspectionAssessmentModal from "@/components/inspector/InspectorInspectionAssessmentModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createInspectorSocket,
  INSPECTOR_SCHEDULE_EVENT,
} from "@/socket/inspector.socket";
import type {
  InspectorInspectionAssessmentType,
  InspectorInspectionRequestDetailType,
} from "@/types/inspector/inspector.type";
import { useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 15;

const formatScheduleDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export default function InspectorInspectionAssessmentPage() {
  const [activeTab, setActiveTab] = useState<"today" | "all">("today");
  const [applications, setApplications] = useState<
    InspectorInspectionAssessmentType[]
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
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);
  const [showGeneratedCertificatePanel, setShowGeneratedCertificatePanel] =
    useState(false);
  const [generatedCertificate, setGeneratedCertificate] =
    useState<GeneratedInspectionCertificateType | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorStatusModal, setShowErrorStatusModal] = useState(false);
  const [errorStatusTitle, setErrorStatusTitle] = useState("Access Denied");
  const [errorStatusMessage, setErrorStatusMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const showLottieErrorStatus = (message: string) => {
    setErrorStatusTitle("Access Denied");
    setErrorStatusMessage(message);
    setShowErrorStatusModal(true);
  };

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getInspectorInspectionAssessmentsApi();
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load inspection assessments.",
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
    const socket = createInspectorSocket();
    socket.on(INSPECTOR_SCHEDULE_EVENT, () => {
      // Assessment list depends on schedule timeline, so subscribe to schedule updates.
      void loadApplications({ silent: true });
    });

    return () => {
      socket.off(INSPECTOR_SCHEDULE_EVENT);
      socket.disconnect();
    };
  }, []);

  const openDetails = async (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setSelectedApplication(null);
    setShowGeneratedCertificatePanel(false);
    setGeneratedCertificate(null);
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
    setIsSaving(false);
    setIsGeneratingCertificate(false);
    setShowGeneratedCertificatePanel(false);
    setGeneratedCertificate(null);
  };

  const loadGeneratedCertificate = async (applicationId: string) => {
    const response =
      await getInspectorGeneratedInspectionCertificateApi(applicationId);
    setGeneratedCertificate(response.data ?? null);
  };

  const submitAssessment = async (params: {
    result: "passed" | "for_completion" | "failed";
    remark: string;
  }) => {
    if (!selectedApplicationId) return;

    setIsSaving(true);
    setDetailError(null);
    try {
      await completeInspectorInspectionRequestApi(selectedApplicationId, {
        result: params.result,
        remark: params.remark,
      });

      if (params.result === "passed") {
        // Passed flow requires certificate preview/confirmation path.
        setShowGeneratedCertificatePanel(true);
        await loadGeneratedCertificate(selectedApplicationId);
      } else {
        closeDetails();
        setShowSuccessModal(true);
      }

      await loadApplications();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message =
        apiError?.response?.data?.message ??
        "Failed to submit inspection assessment.";
      if (message.includes("No active template found for this permit")) {
        setDetailError(null);
        showLottieErrorStatus(message);
      } else {
        setDetailError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const generateCertificate = async () => {
    if (!selectedApplicationId) return;

    setIsGeneratingCertificate(true);
    setDetailError(null);
    try {
      await generateInspectorInspectionCertificateApi(selectedApplicationId);
      await loadGeneratedCertificate(selectedApplicationId);
      await loadApplications();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message =
        apiError?.response?.data?.message ??
        "Failed to generate inspection certificate.";
      if (message.includes("No active template found for this permit")) {
        setDetailError(null);
        showLottieErrorStatus(message);
      } else {
        setDetailError(message);
      }
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const sortedApplications = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(a.scheduledInspectionAt).getTime() -
          new Date(b.scheduledInspectionAt).getTime(),
      ),
    [applications],
  );

  const filteredApplications = useMemo(() => {
    if (activeTab === "all") return sortedApplications;

    const today = new Date();
    // Compare by YYYY-MM-DD so time component does not affect "Today" tab.
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    return sortedApplications.filter((application) => {
      const inspectionDate = new Date(application.scheduledInspectionAt);
      if (Number.isNaN(inspectionDate.getTime())) return false;
      const inspectionKey = `${inspectionDate.getFullYear()}-${String(inspectionDate.getMonth() + 1).padStart(2, "0")}-${String(inspectionDate.getDate()).padStart(2, "0")}`;
      return inspectionKey === todayKey;
    });
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

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-inspector-tour="inspection-assessment-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Inspection Assessment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Scheduled inspections ready for assessment submission.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 md:p-5">
        <div className="inline-flex rounded-2xl border border-gray-200 bg-gray-50 p-1 shadow-sm">
          <button
            type="button"
            aria-pressed={activeTab === "today"}
            onClick={() => setActiveTab("today")}
            className={`no-login-theme rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeTab === "today"
                ? "bg-[#F2C94C] text-[#0F2942] shadow-[0_8px_20px_rgba(242,201,76,0.25)]"
                : "bg-transparent text-gray-500 hover:text-[#0F2942]"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            aria-pressed={activeTab === "all"}
            onClick={() => setActiveTab("all")}
            className={`no-login-theme rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-[#F2C94C] text-[#0F2942] shadow-[0_8px_20px_rgba(242,201,76,0.25)]"
                : "bg-transparent text-gray-500 hover:text-[#0F2942]"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            {activeTab === "today"
              ? "No inspections scheduled for today."
              : "No scheduled inspections available for assessment."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-160">
              <thead className="bg-[#0F2942] text-white text-sm uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-4">Inspection Schedule</th>
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
                    <td className="px-5 py-4 text-[#0F2942] font-semibold">
                      {formatScheduleDateTime(
                        application.scheduledInspectionAt,
                      )}
                    </td>
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

      <InspectorInspectionAssessmentModal
        isOpen={!!selectedApplicationId}
        isLoading={isDetailLoading}
        isSaving={isSaving}
        error={detailError}
        application={selectedApplication}
        showGeneratedCertificatePanel={showGeneratedCertificatePanel}
        generatedCertificate={generatedCertificate}
        isGeneratingCertificate={isGeneratingCertificate}
        onClose={closeDetails}
        onGenerateCertificate={generateCertificate}
        onDone={closeDetails}
        onSubmitAssessment={submitAssessment}
      />

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Submitted"
        message="Inspection assessment submitted successfully."
        autoCloseMs={2200}
        onClose={() => setShowSuccessModal(false)}
      />
      <StatusModal
        isOpen={showErrorStatusModal}
        type="error"
        title={errorStatusTitle}
        message={errorStatusMessage}
        onClose={() => setShowErrorStatusModal(false)}
      />
    </div>
  );
}
