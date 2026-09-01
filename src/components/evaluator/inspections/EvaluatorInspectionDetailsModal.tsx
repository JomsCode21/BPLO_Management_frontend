import type {
  EvaluatorApplicationDetailType,
  EvaluatorInspectionReviewStepStatus,
} from "@/types/evaluator/evaluator.type";
import { FiLoader } from "react-icons/fi";

const stepStatusLabelMap: Record<EvaluatorInspectionReviewStepStatus, string> = {
  pending: "Pending",
  scheduled: "Scheduled",
  rescheduled: "Rescheduled",
  in_progress: "In Progress",
  for_reinspection: "For Reinspection",
  done: "Done",
};

const formatDateTime = (value?: string | null) => {
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

const getStepStatusClass = (status: EvaluatorInspectionReviewStepStatus) => {
  if (status === "done") return "bg-emerald-100 text-emerald-700";
  if (status === "for_reinspection") return "bg-red-100 text-red-700";
  if (status === "in_progress") return "bg-blue-100 text-blue-700";
  return "bg-gray-100 text-gray-700";
};

type EvaluatorInspectionDetailsModalProps = {
  selectedApplication: EvaluatorApplicationDetailType | null;
  isDetailLoading: boolean;
  detailError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmitForAdminApproval: () => void | Promise<void>;
};

export default function EvaluatorInspectionDetailsModal({
  selectedApplication,
  isDetailLoading,
  detailError,
  isSubmitting,
  onClose,
  onSubmitForAdminApproval,
}: EvaluatorInspectionDetailsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4 md:px-8">
          <h2 className="text-xl font-black text-[#0F2942] md:text-2xl">
            {selectedApplication?.permitType || "Inspection Review Details"}
          </h2>
        </div>

        <div className="space-y-6 p-5 md:p-8">
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12 font-semibold text-[#0F2942]">
              <FiLoader className="mr-2 animate-spin" />
              Loading inspection details...
            </div>
          ) : !selectedApplication ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {detailError || "Inspection details are unavailable."}
            </div>
          ) : (
            <>
              {detailError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {detailError}
                </div>
              )}

              <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Inspection Status
                    </p>
                    <p className="mt-1 font-bold text-[#0F2942]">
                      {selectedApplication.inspectionReview?.statusLabel || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Evaluator Name
                    </p>
                    <p className="mt-1 font-bold text-[#0F2942]">
                      {selectedApplication.inspectionReview?.evaluatorName ||
                        "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Payment Status
                    </p>
                    <p className="mt-1 font-bold text-[#0F2942]">
                      {selectedApplication.inspectionReview?.isPaymentSettled
                        ? "Paid"
                        : selectedApplication.inspectionReview?.waitingForPayment
                          ? "Waiting for Owner Payment"
                          : "Not Ready Yet"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 md:col-span-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                      Where It Is Now
                    </p>
                    <p className="mt-1 font-bold text-[#0F2942]">
                      {selectedApplication.inspectionReview?.whereNow || "-"}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                <h3 className="mb-4 text-lg font-black text-[#0F2942]">
                  Department Inspection Details
                </h3>

                {(selectedApplication.inspectionReview?.steps ?? []).length ===
                0 ? (
                  <p className="text-sm text-gray-500">
                    No inspection department details available.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-150 w-full border-collapse text-left">
                      <thead className="bg-gray-100 text-xs uppercase tracking-wide text-[#0F2942]">
                        <tr>
                          <th className="px-4 py-3">Department</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Done</th>
                          <th className="px-4 py-3">Inspection Date</th>
                          <th className="px-4 py-3">Inspector</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedApplication.inspectionReview?.steps ?? []).map(
                          (step) => (
                            <tr
                              key={
                                step.processId ||
                                `${step.sequence}-${step.processName}`
                              }
                              className="border-b border-gray-100"
                            >
                              <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                {step.sequence}. {step.processName}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${getStepStatusClass(
                                    step.status,
                                  )}`}
                                >
                                  {stepStatusLabelMap[step.status]}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                                {step.isDone ? "Yes" : "No"}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                                {formatDateTime(
                                  step.completedAt || step.inspectionDate,
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                                {step.assignedInspectorName || "-"}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold text-gray-700"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => void onSubmitForAdminApproval()}
                  disabled={
                    isSubmitting ||
                    !selectedApplication.inspectionReview
                      ?.canSubmitForAdminApproval
                  }
                  className="cursor-pointer rounded-xl bg-[#0F2942] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Submitting..."
                    : selectedApplication.inspectionReview?.waitingForPayment
                      ? "Waiting for Payment"
                    : selectedApplication.inspectionReview?.currentStage ===
                          "admin_permit_approval" &&
                        !selectedApplication.inspectionReview
                          ?.canSubmitForAdminApproval
                      ? "Already Submitted"
                      : "Submit For Admin Approval"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
