import type {
  EvaluatorApplicationDetailType,
  EvaluatorDecisionType,
} from "@/types/evaluator/evaluator.type";
import type { InspectionDepartmentType } from "@/types/process/process.type";
import { useMemo, useState } from "react";
import { FiChevronDown, FiExternalLink, FiLoader } from "react-icons/fi";
import {
  buildSubmittedSections,
  decisionLabelMap,
  evaluatorDecisionOptions,
  formatValue,
} from "./shared";

type EvaluatorRequestDetailsModalProps = {
  selectedApplication: EvaluatorApplicationDetailType | null;
  isDetailLoading: boolean;
  detailError: string | null;
  formError: string | null;
  decision: EvaluatorDecisionType;
  onDecisionChange: (decision: EvaluatorDecisionType) => void;
  remark: string;
  onRemarkChange: (remark: string) => void;
  processes: InspectionDepartmentType[];
  notRequiredProcessIds: string[];
  onToggleNotRequired: (processId: string, checked: boolean) => void;
  isSaving: boolean;
  onSave: () => void | Promise<void>;
  onClose: () => void;
};

export default function EvaluatorRequestDetailsModal({
  selectedApplication,
  isDetailLoading,
  detailError,
  formError,
  decision,
  onDecisionChange,
  remark,
  onRemarkChange,
  processes,
  notRequiredProcessIds,
  onToggleNotRequired,
  isSaving,
  onSave,
  onClose,
}: EvaluatorRequestDetailsModalProps) {
  const [openSubmittedSectionIds, setOpenSubmittedSectionIds] = useState<
    string[]
  >([]);

  const submittedSections = useMemo(
    () => buildSubmittedSections(selectedApplication),
    [selectedApplication],
  );

  const toggleSubmittedSection = (sectionId: string) => {
    setOpenSubmittedSectionIds((previous) =>
      previous.includes(sectionId)
        ? previous.filter((id) => id !== sectionId)
        : [...previous, sectionId],
    );
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-PH", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-3 md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-white px-5 py-4 md:px-8">
          <h2 className="text-xl font-black text-[#0F2942] md:text-2xl">
            {selectedApplication?.permitType || "Submitted Application Details"}
          </h2>
        </div>

        <div className="space-y-6 p-5 md:p-8">
          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12 font-semibold text-[#0F2942]">
              <FiLoader className="mr-2 animate-spin" />
              Loading application details...
            </div>
          ) : !selectedApplication ? (
            detailError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {detailError}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                Application details are not available.
              </div>
            )
          ) : (
            <>
              {submittedSections.map((section) => (
                <section
                  key={section.id}
                  className="rounded-2xl border border-gray-100 p-4 md:p-5"
                >
                  <button
                    type="button"
                    onClick={() => toggleSubmittedSection(section.id)}
                    className="flex w-full items-center justify-between gap-3 text-left"
                    aria-expanded={openSubmittedSectionIds.includes(section.id)}
                  >
                    <div>
                      <h3 className="text-lg font-black text-[#0F2942]">
                        {section.title}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-gray-500">
                        {section.responses.length} field
                        {section.responses.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <FiChevronDown
                      className={`text-[#0F2942] transition-transform ${
                        openSubmittedSectionIds.includes(section.id)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </button>

                  {openSubmittedSectionIds.includes(section.id) && (
                    <div
                      className={`mt-4 ${
                        section.layout === "two_column"
                          ? "grid grid-cols-1 gap-3 md:grid-cols-2"
                          : "space-y-3"
                      }`}
                    >
                      {section.responses.map((response) => (
                        <div
                          key={response.fieldId}
                          className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                        >
                          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                            {response.label}
                          </p>
                          {response.type === "file" ? (
                            <div className="mt-2 space-y-2">
                              {(response.files ?? []).length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  No uploaded document.
                                </p>
                              ) : (
                                (response.files ?? []).map((file, index) => (
                                  <a
                                    key={`${response.fieldId}-${index}`}
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F2942] underline underline-offset-2"
                                  >
                                    <FiExternalLink />
                                    {file.name}
                                  </a>
                                ))
                              )}
                            </div>
                          ) : (
                            <p className="mt-1 text-sm font-medium text-gray-800 md:text-base">
                              {formatValue(response.value, response.type)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ))}

              <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                <h3 className="text-lg font-black text-[#0F2942]">
                  Business History
                </h3>

                {!selectedApplication.businessRegistrationHistory ? (
                  <p className="mt-2 text-sm text-gray-600">
                    No comparable business-name history found for this applicant.
                  </p>
                ) : (
                  <>
                    <p className="mt-2 text-xs font-semibold text-gray-500">
                      Counts below are based on the same applicant + same business
                      name across all permit types.
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Total Attempts
                        </p>
                        <p className="mt-1 text-lg font-black text-[#0F2942]">
                          {
                            selectedApplication.businessRegistrationHistory
                              .attemptCount
                          }
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Approved
                        </p>
                        <p className="mt-1 text-lg font-black text-emerald-700">
                          {
                            selectedApplication.businessRegistrationHistory
                              .successfulCount
                          }
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                          Denied
                        </p>
                        <p className="mt-1 text-lg font-black text-rose-700">
                          {
                            selectedApplication.businessRegistrationHistory
                              .deniedFinalCount
                          }
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-xs font-semibold text-gray-500">
                      Last approved:{" "}
                      {formatDateTime(
                        selectedApplication.businessRegistrationHistory
                          .lastApprovedAt,
                      )}
                    </p>

                    <div className="mt-3 overflow-x-auto rounded-xl border border-gray-100">
                      <table className="w-full min-w-[720px] border-collapse text-left">
                        <thead className="bg-[#0F2942] text-xs uppercase tracking-wide text-white">
                          <tr>
                            <th className="px-3 py-2">Submitted</th>
                            <th className="px-3 py-2">Permit</th>
                            <th className="px-3 py-2">Table Status</th>
                            <th className="px-3 py-2">Evaluator Decision</th>
                            <th className="px-3 py-2">Admin Decision</th>
                            <th className="px-3 py-2">Tag</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedApplication.businessRegistrationHistory.recentApplications.map(
                            (item) => (
                              <tr
                                key={item.applicationId}
                                className="border-t border-gray-100"
                              >
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  {formatDateTime(item.submittedAt)}
                                </td>
                                <td className="px-3 py-2 text-sm font-semibold text-[#0F2942]">
                                  {item.permitType}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  {item.tableStatus === "re_submission"
                                    ? "Re-submission"
                                    : "For Review"}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  {item.evaluatorDecision || "N/A"}
                                </td>
                                <td className="px-3 py-2 text-sm text-gray-700">
                                  {item.adminDecision || "N/A"}
                                </td>
                                <td className="px-3 py-2 text-sm font-bold text-[#0F2942]">
                                  {item.isCurrent ? "Current" : "History"}
                                </td>
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </section>

              <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                <h3 className="mb-4 text-lg font-black text-[#0F2942]">
                  Evaluation Section
                </h3>

                {formError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {formError}
                  </div>
                )}

                <div className="max-w-md">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                    Evaluation Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(event) =>
                      onDecisionChange(
                        event.target.value as EvaluatorDecisionType,
                      )
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-semibold text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  >
                    {evaluatorDecisionOptions.map((option) => (
                      <option key={option} value={option}>
                        {decisionLabelMap[option]}
                      </option>
                    ))}
                  </select>
                </div>

                {decision === "re_submission" && (
                  <div className="mt-4 max-w-2xl">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                      Re-submission Remark
                    </label>
                    <textarea
                      rows={3}
                      value={remark}
                      onChange={(event) => onRemarkChange(event.target.value)}
                      placeholder="Enter evaluator remark for re-submission"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This remark is required when the decision is
                      Re-submission.
                    </p>
                  </div>
                )}

                {decision === "for_inspection" && (
                  <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                    <p className="text-sm font-bold text-[#0F2942]">
                      Inspection Process Checklist
                    </p>
                    <p className="mb-3 mt-1 text-xs text-gray-500">
                      Check the process that is not required for this
                      application.
                    </p>

                    {processes.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No inspection departments/processes available.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {processes.map((process) => (
                          <label
                            key={process.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
                          >
                            <span className="text-sm font-semibold text-[#0F2942]">
                              {process.sequence}. {process.name}
                            </span>
                            <span className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                              <input
                                type="checkbox"
                                checked={notRequiredProcessIds.includes(
                                  process.id,
                                )}
                                onChange={(event) =>
                                  onToggleNotRequired(
                                    process.id,
                                    event.target.checked,
                                  )
                                }
                              />
                              Not Required
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void onSave()}
                    disabled={isSaving}
                    className="cursor-pointer rounded-xl bg-[#0F2942] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? "Saving..." : "Save Evaluation"}
                  </button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
