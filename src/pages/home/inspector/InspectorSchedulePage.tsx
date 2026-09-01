import {
  getInspectorInspectionRequestByIdApi,
  getInspectorInspectionSchedulesApi,
  updateInspectorInspectionScheduleApi,
} from "@/api/inspector/inspector.api";
import StatusModal from "@/components/feedback/StatusModal";
import InspectorInspectionDetailsModal from "@/components/inspector/InspectorInspectionDetailsModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  createInspectorSocket,
  INSPECTOR_SCHEDULE_EVENT,
} from "@/socket/inspector.socket";
import type {
  InspectorInspectionRequestDetailType,
  InspectorInspectionScheduleType,
} from "@/types/inspector/inspector.type";
import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiGrid, FiList } from "react-icons/fi";

const ITEMS_PER_PAGE = 15;

const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);

const toDateKey = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

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

export default function InspectorSchedulePage() {
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [focusDate, setFocusDate] = useState(new Date());
  const [schedules, setSchedules] = useState<InspectorInspectionScheduleType[]>(
    [],
  );
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadSchedules = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const response = await getInspectorInspectionSchedulesApi();
      setSchedules(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load inspector schedules.",
        );
      }
    } finally {
      if (!isSilent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSchedules();
  }, []);

  useEffect(() => {
    const socket = createInspectorSocket();
    socket.on(INSPECTOR_SCHEDULE_EVENT, () => {
      // Realtime schedule updates from this inspector and other related actors.
      void loadSchedules({ silent: true });
    });
    return () => {
      socket.off(INSPECTOR_SCHEDULE_EVENT);
      socket.disconnect();
    };
  }, []);

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
        apiError?.response?.data?.message ?? "Failed to load schedule details.",
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
  };

  const updateSchedule = async (params: {
    inspectionAt: string;
    remark: string;
  }) => {
    if (!selectedApplicationId) return;
    setIsSaving(true);
    setDetailError(null);
    try {
      await updateInspectorInspectionScheduleApi(selectedApplicationId, {
        inspectionAt: params.inspectionAt,
        remark: params.remark,
      });
      closeDetails();
      setShowSuccessModal(true);
      await loadSchedules();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setDetailError(
        apiError?.response?.data?.message ??
          "Failed to update inspection schedule.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const groupedByDate = useMemo(() => {
    // Calendar mode groups entries by local day key.
    const map = new Map<string, InspectorInspectionScheduleType[]>();
    for (const item of schedules) {
      const key = toDateKey(item.scheduledInspectionAt);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)?.push(item);
    }
    return map;
  }, [schedules]);

  const calendarDays = useMemo(() => {
    const first = startOfMonth(focusDate);
    const last = endOfMonth(focusDate);
    const startOffset = first.getDay();
    const totalDays = last.getDate();
    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < startOffset; i += 1) {
      cells.push({ date: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= totalDays; d += 1) {
      const date = new Date(focusDate.getFullYear(), focusDate.getMonth(), d);
      cells.push({ date, key: `day-${d}` });
    }
    return cells;
  }, [focusDate]);

  const sortedSchedules = useMemo(
    () =>
      [...schedules].sort(
        (a, b) =>
          new Date(a.scheduledInspectionAt).getTime() -
          new Date(b.scheduledInspectionAt).getTime(),
      ),
    [schedules],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(sortedSchedules.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSchedules.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, sortedSchedules]);

  const pageStart =
    sortedSchedules.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(
    currentPage * ITEMS_PER_PAGE,
    sortedSchedules.length,
  );

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 space-y-6">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6 flex items-center justify-between"
        data-inspector-tour="schedule-inspection-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Schedule Inspection
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and manage your scheduled inspections.
          </p>
        </div>
        <div className="inline-flex rounded-2xl border border-gray-200 bg-gray-50 p-1 shadow-sm">
          <button
            type="button"
            aria-pressed={viewMode === "calendar"}
            onClick={() => setViewMode("calendar")}
            className={`no-login-theme px-4 py-2 text-sm font-bold cursor-pointer inline-flex items-center gap-2 ${
              viewMode === "calendar"
                ? "rounded-xl bg-[#F2C94C] text-[#0F2942] shadow-[0_8px_20px_rgba(242,201,76,0.25)]"
                : "rounded-xl bg-transparent text-gray-500 hover:text-[#0F2942]"
            }`}
          >
            <FiGrid /> Calendar
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "table"}
            onClick={() => setViewMode("table")}
            className={`no-login-theme px-4 py-2 text-sm font-bold cursor-pointer inline-flex items-center gap-2 ${
              viewMode === "table"
                ? "rounded-xl bg-[#F2C94C] text-[#0F2942] shadow-[0_8px_20px_rgba(242,201,76,0.25)]"
                : "rounded-xl bg-transparent text-gray-500 hover:text-[#0F2942]"
            }`}
          >
            <FiList /> Table
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {sortedSchedules.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            No scheduled inspections yet.
          </div>
        ) : viewMode === "table" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-160">
                <thead className="bg-[#0F2942] text-white text-sm uppercase tracking-wide">
                  <tr>
                    <th className="px-5 py-4">Date & Time</th>
                    <th className="px-5 py-4">Applicant</th>
                    <th className="px-5 py-4">Permit</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSchedules.map((item) => (
                    <tr
                      key={item._id}
                      className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                      onClick={() => void openDetails(item._id)}
                    >
                      <td className="px-5 py-4 font-semibold text-[#0F2942]">
                        {formatScheduleDateTime(item.scheduledInspectionAt)}
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {item.applicantName}
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {item.permitType}
                      </td>
                      <td className="px-5 py-4 text-gray-700 font-medium">
                        {item.currentDepartment}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          {item.scheduleStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void openDetails(item._id);
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
            <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm font-semibold text-gray-600">
                Showing {pageStart}-{pageEnd} of {sortedSchedules.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
          </>
        ) : (
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() =>
                  setFocusDate(
                    new Date(
                      focusDate.getFullYear(),
                      focusDate.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-[#0F2942] cursor-pointer"
              >
                Prev
              </button>
              <h2 className="text-lg font-black text-[#0F2942]">
                {focusDate.toLocaleString("en-PH", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <button
                type="button"
                onClick={() =>
                  setFocusDate(
                    new Date(
                      focusDate.getFullYear(),
                      focusDate.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-bold text-[#0F2942] cursor-pointer"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-gray-500 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell) => {
                if (!cell.date) {
                  return (
                    <div
                      key={cell.key}
                      className="h-24 rounded-lg bg-gray-50"
                    />
                  );
                }
                const key = toDateKey(cell.date.toISOString());
                const daySchedules = groupedByDate.get(key) ?? [];
                return (
                  <div
                    key={cell.key}
                    className="h-24 rounded-lg border border-gray-100 p-2 overflow-hidden"
                  >
                    <p className="text-xs font-black text-[#0F2942]">
                      {cell.date.getDate()}
                    </p>
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                      {daySchedules.slice(0, 2).map((entry) => (
                        <button
                          key={entry._id}
                          type="button"
                          onClick={() => void openDetails(entry._id)}
                          className="w-full text-left text-[10px] font-semibold bg-[#F4F8FC] text-[#0F2942] rounded px-1.5 py-1 cursor-pointer"
                        >
                          <FiCalendar className="inline mr-1" />
                          {new Date(
                            entry.scheduledInspectionAt,
                          ).toLocaleTimeString("en-PH", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </button>
                      ))}
                      {daySchedules.length > 2 && (
                        <p className="text-[10px] text-gray-500 font-semibold">
                          +{daySchedules.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <InspectorInspectionDetailsModal
        isOpen={!!selectedApplicationId}
        isLoading={isDetailLoading}
        isSaving={isSaving}
        error={detailError}
        mode="edit"
        application={selectedApplication}
        onClose={closeDetails}
        onSaveSchedule={updateSchedule}
      />

      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Updated"
        message="Inspection schedule updated successfully."
        autoCloseMs={2200}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
