import type { InspectorInspectionRequestDetailType } from "@/types/inspector/inspector.type";
import {
  buildSubmittedSections,
  InspectorSubmittedSectionsAccordion,
} from "@/components/inspector/submitted-sections.shared";
import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";

const MORNING_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00"];
const AFTERNOON_SLOTS = ["13:00", "14:00", "15:00", "16:00", "17:00"];

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toTimeInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const buildInspectionDateTimeIso = (datePart: string, timePart: string) => {
  if (!datePart || !timePart) return "";
  return new Date(`${datePart}T${timePart}:00`).toISOString();
};

const toTodayDateInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

type InspectorInspectionDetailsModalProps = {
  isOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  mode: "create" | "edit";
  application: InspectorInspectionRequestDetailType | null;
  onClose: () => void;
  onSaveSchedule: (params: { inspectionAt: string; remark: string }) => Promise<void> | void;
};

export default function InspectorInspectionDetailsModal({
  isOpen,
  isLoading,
  isSaving,
  error,
  mode,
  application,
  onClose,
  onSaveSchedule,
}: InspectorInspectionDetailsModalProps) {
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [remark, setRemark] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const minScheduleDate = toTodayDateInputValue();

  useEffect(() => {
    if (!application) {
      setScheduleDate("");
      setScheduleTime("");
      setRemark("");
      setFormError(null);
      return;
    }
    setScheduleDate(toDateInputValue(application.scheduledInspectionAt));
    setScheduleTime(toTimeInputValue(application.scheduledInspectionAt));
    setRemark("");
    setFormError(null);
  }, [application]);

  const submittedSections = useMemo(() => {
    return buildSubmittedSections(application);
  }, [application]);

  useEffect(() => {
    setOpenSectionId(null);
  }, [application?._id]);

  const toggleSection = (sectionId: string) => {
    setOpenSectionId((previous) => (previous === sectionId ? null : sectionId));
  };

  const openSectionIds = openSectionId ? [openSectionId] : [];

  if (!isOpen) return null;

  const handleSave = async () => {
    if (scheduleDate && scheduleDate < minScheduleDate) {
      setFormError("Inspection date cannot be in the past.");
      return;
    }

    const inspectionAt = buildInspectionDateTimeIso(scheduleDate, scheduleTime);
    if (!inspectionAt) {
      setFormError("Please select inspection date and time.");
      return;
    }

    const inspectionDate = new Date(inspectionAt);
    if (inspectionDate.getTime() < Date.now()) {
      setFormError("Inspection date/time cannot be in the past.");
      return;
    }

    if (mode === "edit" && !remark.trim()) {
      setFormError("Remark is required when editing the schedule.");
      return;
    }
    setFormError(null);
    await onSaveSchedule({ inspectionAt, remark: remark.trim() });
  };

  const currentHour = Number(scheduleTime.split(":")[0] || 0);
  const activePeriod = currentHour >= 13 ? "afternoon" : "morning";

  return (
    <div
      className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-20 bg-white rounded-t-3xl border-b border-gray-100 px-5 md:px-8 py-4">
          <h2 className="text-xl md:text-2xl font-black text-[#0F2942]">
            {mode === "edit" ? "Edit Inspection Schedule" : "Set Inspection Schedule"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
          {isLoading ? (
            <div className="py-12 flex items-center justify-center text-[#0F2942] font-semibold">
              <FiLoader className="animate-spin mr-2" />
              Loading application details...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : !application ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
              Application details are not available.
            </div>
          ) : (
            <>
              <section className="space-y-3">
                <h3 className="text-lg font-black text-[#0F2942]">Application Details</h3>
                <InspectorSubmittedSectionsAccordion
                  sections={submittedSections}
                  openSectionIds={openSectionIds}
                  onToggleSection={toggleSection}
                />
              </section>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-sm font-semibold text-gray-700">
                  Current Department:{" "}
                  <span className="font-black text-[#0F2942]">
                    {application.currentDepartment}
                  </span>{" "}
                  ({application.currentSequence} / {application.totalDepartments})
                </p>
              </div>

              <section className="rounded-2xl border border-gray-100 p-4 md:p-5">
                <h3 className="text-lg font-black text-[#0F2942] mb-4">Schedule Inspection</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wide text-gray-500 font-bold">
                      Date
                    </label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(event) => setScheduleDate(event.target.value)}
                      min={minScheduleDate}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F2942] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-wide text-gray-500 font-bold">
                      Time
                    </label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(event) => setScheduleTime(event.target.value)}
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F2942] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
                      Morning
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {MORNING_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setScheduleTime(slot)}
                          className={`px-3 py-2 rounded-lg border text-sm font-semibold cursor-pointer ${
                            scheduleTime === slot
                              ? "bg-[#0F2942] border-[#0F2942] text-white"
                              : activePeriod === "morning" && !scheduleTime
                                ? "border-gray-200 text-gray-700"
                                : "border-gray-200 text-gray-700"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 font-bold mb-2">
                      Afternoon
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AFTERNOON_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setScheduleTime(slot)}
                          className={`px-3 py-2 rounded-lg border text-sm font-semibold cursor-pointer ${
                            scheduleTime === slot
                              ? "bg-[#0F2942] border-[#0F2942] text-white"
                              : "border-gray-200 text-gray-700"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {mode === "edit" && (
                  <div className="mt-4">
                    <label className="text-xs uppercase tracking-wide text-gray-500 font-bold">
                      Update Remark
                    </label>
                    <textarea
                      rows={3}
                      value={remark}
                      onChange={(event) => setRemark(event.target.value)}
                      placeholder="Required: explain why schedule was changed."
                      className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#0F2942] font-medium focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                  </div>
                )}

                {formError && (
                  <p className="mt-3 text-sm font-semibold text-red-700">{formError}</p>
                )}

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleSave()}
                    disabled={isSaving}
                    className="px-6 py-3 rounded-xl bg-[#0F2942] text-white font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSaving
                      ? "Saving..."
                      : mode === "edit"
                        ? "Update Schedule"
                        : "Set Schedule"}
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
