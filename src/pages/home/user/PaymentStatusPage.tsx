import {
  markAllOwnerApplicationStatusesAsReadApi,
  markOwnerApplicationStatusAsReadApi,
} from "@/api/owner/owner.api";
import { OwnerStatusListContentSkeleton } from "@/components/owner/OwnerStatusLoading";
import OwnerStatusPageShell from "@/components/owner/OwnerStatusPageShell";
import OwnerStatusTabs from "@/components/owner/OwnerStatusTabs";
import AnimatedList from "@/components/ui/AnimatedList";
import { useOwnerStatusStore } from "@/stores/owner/owner-status.store";
import type {
  OwnerApplicationStatusCode,
  OwnerApplicationStatusType,
} from "@/types/owner/owner.type";
import {
  formatOwnerStatusLabel,
  getOwnerStatusActionLabel,
  getOwnerStatusBadgeClass,
  getOwnerStatusContextLabel,
} from "@/utils/owner/owner-status-presenter.util";
import { isPaymentNotification } from "@/utils/owner/owner-status-routing.util";
import { useEffect, useMemo, useState } from "react";
import { FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const statusMessageMap: Record<OwnerApplicationStatusCode, string> = {
  submitted:
    "Your business permit application has been submitted and is waiting for evaluator review.",
  for_inspection:
    "Your business permit application was routed for inspection processing.",
  inspection_pending: "Your inspection request is pending BPLO admin review.",
  inspection_approved:
    "Your inspection request was approved and routed to inspectors.",
  inspection_scheduled: "An inspection schedule has been set for your request.",
  inspection_rescheduled: "Your inspection schedule was updated.",
  inspection_denied: "Your inspection request was denied by BPLO admin.",
  inspection_passed: "Your inspection assessment was marked as passed.",
  inspection_for_completion:
    "Your inspection needs completion before re-assessment.",
  inspection_failed: "Your inspection assessment was marked as failed.",
  for_admin_approval:
    "Your permit is now with BPLO admin for final approval.",
  payment_breakdown:
    "Your payment breakdown is ready. Review the fee breakdown while the full inspection flow is being completed.",
  payment_pending:
    "Your payment QR is ready. Pay first at the main treasurer before evaluator submission to BPLO admin.",
  payment_paid:
    "Your payment has been marked as paid and recorded by the treasurer. The evaluator can now continue the permit.",
  payment_confirmed:
    "Your payment has been marked as paid and recorded by the treasurer. The evaluator can now continue the permit.",
  re_submission:
    "Your business permit application needs re-submission. Please update and submit again.",
  approved: "Your business permit is complete and ready for download.",
  failed: "Your business permit application has been denied.",
};

const getUnreadNotificationCount = (
  application: OwnerApplicationStatusType,
) => {
  if (typeof application.unreadCount === "number") {
    return Math.max(0, application.unreadCount);
  }

  return application.isRead === false ? 1 : 0;
};

const buildNotificationText = (application: OwnerApplicationStatusType) => {
  const base = statusMessageMap[application.status];
  const remark =
    application.evaluatorRemark?.trim() || application.adminRemark?.trim();

  if (!remark) return base;
  return `${base} ${remark}`;
};

const formatNotificationDate = (value?: string | null) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getApplicationSortTimestamp = (application: OwnerApplicationStatusType) =>
  application.decidedAt ?? application.submittedAt;

const getApplicationDisplayTimestamp = (
  application: OwnerApplicationStatusType,
) => application.decidedAt ?? application.updatedAt ?? application.submittedAt;

export default function PaymentStatusPage() {
  const navigate = useNavigate();
  const allApplications = useOwnerStatusStore((state) => state.applications);
  const hasLoaded = useOwnerStatusStore((state) => state.hasLoaded);
  const fetchStatuses = useOwnerStatusStore((state) => state.fetchStatuses);
  const ensureRealtime = useOwnerStatusStore((state) => state.ensureRealtime);
  const markStatusAsReadOptimistic = useOwnerStatusStore(
    (state) => state.markStatusAsReadOptimistic,
  );
  const restoreStatus = useOwnerStatusStore((state) => state.restoreStatus);
  const markAllAsReadOptimistic = useOwnerStatusStore(
    (state) => state.markAllAsReadOptimistic,
  );
  const restoreApplications = useOwnerStatusStore(
    (state) => state.restoreApplications,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureRealtime();
  }, [ensureRealtime]);

  useEffect(() => {
    if (hasLoaded) {
      setIsLoading(false);
      return;
    }

    const loadApplications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        await fetchStatuses();
      } catch (err: unknown) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load payment status records.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, [fetchStatuses, hasLoaded]);

  const applications = useMemo(
    () =>
      allApplications.filter((application) =>
        isPaymentNotification(application),
      ),
    [allApplications],
  );

  const sortedApplications = useMemo(
    () =>
      [...applications].sort((a, b) => {
        const unreadA = getUnreadNotificationCount(a) > 0 ? 1 : 0;
        const unreadB = getUnreadNotificationCount(b) > 0 ? 1 : 0;

        if (unreadA !== unreadB) {
          return unreadB - unreadA;
        }

        return (
          new Date(getApplicationSortTimestamp(b)).getTime() -
          new Date(getApplicationSortTimestamp(a)).getTime()
        );
      }),
    [applications],
  );

  const handleOpenNotification = async (
    application: OwnerApplicationStatusType,
  ) => {
    if (getUnreadNotificationCount(application) > 0) {
      const previousStatus = markStatusAsReadOptimistic(application._id);

      try {
        await markOwnerApplicationStatusAsReadApi(application._id);
      } catch (err: unknown) {
        const statusCode =
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status
            ? (err as { response?: { status?: number } }).response?.status
            : undefined;

        if (statusCode !== 404) {
          restoreStatus(previousStatus);
        }
      }
    }

    navigate(`/home/user/payment-status/${application._id}`);
  };

  const handleMarkAllAsRead = async () => {
    const hasUnread = applications.some(
      (application) => getUnreadNotificationCount(application) > 0,
    );
    if (!hasUnread || isMarkingAllRead) return;

    setIsMarkingAllRead(true);
    const previousApplications = markAllAsReadOptimistic(
      isPaymentNotification,
    );

    try {
      await markAllOwnerApplicationStatusesAsReadApi("payment");
    } catch {
      restoreApplications(previousApplications);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const hasUnread = sortedApplications.some(
    (application) => getUnreadNotificationCount(application) > 0,
  );
  const updateCountLabel = `${sortedApplications.length} ${
    sortedApplications.length === 1 ? "update" : "updates"
  }`;

  return (
    <OwnerStatusPageShell
      title="Payment Status"
      backPath="/home/user/dashboard"
      tourId="status-payment-header"
      wideDesktop
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      <OwnerStatusTabs />

      {!isLoading && sortedApplications.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#0F2942]/55 sm:text-xs">
            {updateCountLabel}
          </p>
          <button
            type="button"
            onClick={() => void handleMarkAllAsRead()}
            disabled={!hasUnread || isMarkingAllRead}
            className="text-xs sm:text-sm font-bold text-[#0F2942] disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {isMarkingAllRead ? "Marking..." : "Mark all as read"}
          </button>
        </div>
      )}

      {isLoading ? (
        <OwnerStatusListContentSkeleton />
      ) : sortedApplications.length === 0 ? (
        <div className="py-8 text-sm font-semibold text-gray-600">
          No payment updates yet.
        </div>
      ) : (
        <>
          <div className="md:hidden">
            <AnimatedList
              items={sortedApplications}
              onItemSelect={(application) => {
                void handleOpenNotification(application);
              }}
              getItemKey={(application) => application._id}
              getItemLabel={(application) =>
                `${formatOwnerStatusLabel(application.status)} ${application.permitType}`
              }
              showGradients={false}
              enableArrowNavigation={false}
              useInternalScroll={false}
              displayScrollbar={false}
              listClassName="pr-1 pb-2"
              renderItem={(application) => {
                const unreadCount = getUnreadNotificationCount(application);
                const isUnread = unreadCount > 0;
                const actionLabel = getOwnerStatusActionLabel(
                  application.status,
                );

                return (
                  <div
                    className={`rounded-[1.5rem] border p-3.5 shadow-sm transition-all duration-200 ${
                      isUnread
                        ? "border-[#0F2942]/10 bg-[#F4F8FC]"
                        : "border-gray-100 bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-[#0F2942]">
                        {formatOwnerStatusLabel(application.status)}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${getOwnerStatusBadgeClass(application.status)}`}
                      >
                        {getOwnerStatusContextLabel(application.status)}
                      </span>
                      {isUnread && (
                        <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-[11px] font-black text-white">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0F2942]/70">
                      {application.permitType}
                    </p>

                    <p className="mt-2.5 line-clamp-4 text-[13px] leading-5 text-gray-700">
                      {buildNotificationText(application)}
                    </p>

                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                      <FiClock className="text-xs" />
                      <span>
                        {formatNotificationDate(
                          getApplicationDisplayTimestamp(application),
                        )}
                      </span>
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void handleOpenNotification(application);
                        }}
                        className="w-full rounded-xl border border-[#F2C94C]/20 bg-[#F2C94C] px-4 py-2.5 text-sm font-bold text-[#0F2942] cursor-pointer"
                      >
                        {actionLabel}
                      </button>
                    </div>
                  </div>
                );
              }}
            />
          </div>

          <div className="hidden overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:block">
            <div className="max-h-[calc(100vh-15rem)] overflow-auto">
              <table className="w-full table-fixed border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-[#0F2942] text-xs uppercase tracking-[0.18em] text-white">
                  <tr>
                    <th className="w-[23%] px-3 py-4 sm:px-5">Update</th>
                    <th className="w-[14%] px-3 py-4 sm:px-5">Status</th>
                    <th className="hidden w-[14%] px-3 py-4 sm:px-5 md:table-cell">
                      Permit
                    </th>
                    <th className="w-[34%] px-3 py-4 sm:px-5 md:w-[32%]">
                      Message
                    </th>
                    <th className="hidden w-[16%] px-3 py-4 sm:px-5 sm:table-cell md:w-[14%]">
                      Updated
                    </th>
                    <th className="w-[20%] px-3 py-4 text-right sm:px-5 md:w-[16%]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedApplications.map((application) => {
                    const unreadCount = getUnreadNotificationCount(application);
                    const isUnread = unreadCount > 0;
                    const actionLabel = getOwnerStatusActionLabel(
                      application.status,
                    );

                    return (
                      <tr
                        key={application._id}
                        className={`border-b border-gray-100 last:border-b-0 ${
                          isUnread
                            ? "bg-[#F4F8FC]"
                            : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-4 align-top sm:px-5">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-[#0F2942]">
                                {formatOwnerStatusLabel(application.status)}
                              </span>
                              {isUnread && (
                                <span className="inline-flex rounded-full bg-red-500 px-3 py-1 text-[11px] font-black text-white">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="space-y-1 md:hidden">
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0F2942]/70">
                                {application.permitType}
                              </p>
                            </div>
                            <div className="space-y-1 sm:hidden">
                              <div className="inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                                <FiClock className="text-sm" />
                                <span>
                                  {formatNotificationDate(
                                    getApplicationDisplayTimestamp(application),
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top sm:px-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${getOwnerStatusBadgeClass(application.status)}`}
                            >
                              {getOwnerStatusContextLabel(application.status)}
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-3 py-4 align-top text-sm font-semibold text-gray-700 sm:px-5 md:table-cell">
                          {application.permitType}
                        </td>
                        <td className="px-3 py-4 align-top sm:px-5">
                          <p className="text-sm leading-6 text-gray-700 line-clamp-2 sm:line-clamp-3 md:line-clamp-2 wrap-break-word">
                            {buildNotificationText(application)}
                          </p>
                        </td>
                        <td className="hidden px-3 py-4 align-top sm:px-5 sm:table-cell">
                          <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-500">
                            <FiClock className="text-sm" />
                            <span className="leading-5">
                              {formatNotificationDate(
                                getApplicationDisplayTimestamp(application),
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-top text-right sm:px-5">
                          <button
                            type="button"
                            onClick={() =>
                              void handleOpenNotification(application)
                            }
                            className="w-full rounded-lg border border-[#F2C94C]/20 bg-[#F2C94C] px-3 py-2 text-sm font-bold text-[#0F2942] cursor-pointer sm:w-auto sm:px-4"
                          >
                            {actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </OwnerStatusPageShell>
  );
}
