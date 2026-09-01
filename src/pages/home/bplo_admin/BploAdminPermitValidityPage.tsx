import {
  getPermitValidityApplicationsApi,
  getRoutedApplicationByIdApi,
} from "@/api/bplo_admin/bplo_admin.api";
import {
  BploAdminPermitValidityResultsSkeleton,
  BploAdminPermitValidityTabsSkeleton,
} from "@/components/bplo_admin/BploAdminLoading";
import RoutedApplicationDetailsModal from "@/components/bplo_admin/RoutedApplicationDetailsModal";
import {
  ADMIN_PERMIT_VALIDITY_EVENT,
  createBploAdminSocket,
} from "@/socket/bplo_admin.socket";
import type {
  BploPermitValidityApplicationType,
  BploRoutedApplicationDetailType,
} from "@/types/bplo_admin/bplo_admin.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";

const ITEMS_PER_PAGE = 6;

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

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

const getRequestErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as {
    code?: string;
    response?: { data?: { message?: string } };
    request?: unknown;
  };
  const message = apiError?.response?.data?.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (apiError?.code === "ECONNABORTED") {
    return `${fallback} The request timed out. Please retry.`;
  }
  if (apiError?.request) {
    return `${fallback} No server response received. Please retry.`;
  }
  return fallback;
};

const getStatusLabel = (status: BploPermitValidityApplicationType["status"]) => {
  switch (status) {
    case "active":
      return "Active";
    case "for_renewal":
      return "For Renewal";
    case "inactive":
      return "Inactive";
    case "delinquent":
      return "Delinquent";
    default:
      return "Unknown";
  }
};

const getStatusBadgeClass = (
  status: BploPermitValidityApplicationType["status"],
) => {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "for_renewal":
      return "bg-amber-100 text-amber-700";
    case "inactive":
      return "bg-rose-100 text-rose-700";
    case "delinquent":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getPermitControlNumber = (application: BploPermitValidityApplicationType) => {
  const autoIncrementField = (application.displayedFields ?? []).find((field) =>
    String(field.fieldId ?? "").startsWith("auto_increment:"),
  );
  return autoIncrementField?.value?.trim() || "-";
};

export default function BploAdminPermitValidityPage() {
  const [applications, setApplications] = useState<
    BploPermitValidityApplicationType[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePermitType, setActivePermitType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedApplication, setSelectedApplication] =
    useState<BploRoutedApplicationDetailType | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const loadApplications = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }

    try {
      const response = await getPermitValidityApplicationsApi();
      setApplications(response.data ?? []);
      if (isSilent) setError(null);
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load permit validity applications.",
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
    const socket = createBploAdminSocket();
    const handleConnect = () => {
      setIsSocketConnected(true);
    };
    const handleDisconnect = () => {
      setIsSocketConnected(false);
    };
    const handleConnectError = () => {
      setIsSocketConnected(false);
    };
    const handlePermitValidityUpdate = (
      incoming: BploPermitValidityApplicationType[],
    ) => {
      setApplications(incoming ?? []);
      setError(null);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on(ADMIN_PERMIT_VALIDITY_EVENT, handlePermitValidityUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off(ADMIN_PERMIT_VALIDITY_EVENT, handlePermitValidityUpdate);
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isSocketConnected) return;

    // When realtime is disconnected, periodically sync validity records.
    const intervalId = window.setInterval(() => {
      void loadApplications({ silent: true });
    }, 45000);

    return () => window.clearInterval(intervalId);
  }, [isSocketConnected]);

  useEffect(() => {
    const permitTypes = Array.from(
      new Set(
        applications
          .map((application) => application.permitType)
          .filter((permitType) => permitType.trim()),
      ),
    ).sort((a, b) => a.localeCompare(b));

    if (permitTypes.length === 0) {
      setActivePermitType("all");
      return;
    }

    setActivePermitType((current) =>
      current === "all" || permitTypes.includes(current)
        ? current
        : permitTypes[0],
    );
  }, [applications]);

  const permitTabs = useMemo(() => {
    const types = Array.from(
      new Set(
        applications
          .map((application) => application.permitType)
          .filter((permitType) => permitType.trim()),
      ),
    ).sort((a, b) => a.localeCompare(b));

    return ["all", ...types];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const base =
      activePermitType === "all"
        ? applications
        : applications.filter(
            (application) => application.permitType === activePermitType,
          );

    const normalizedSearch = searchTerm.trim().toLowerCase();

    const searched =
      normalizedSearch.length === 0
        ? base
        : base.filter((application) => {
            // Search spans IDs, labels, status aliases, and configured display fields.
            const searchableValues = [
              application._id,
              application.currentYearApplicationId ?? "",
              application.applicantName,
              application.permitType,
              application.status,
              getStatusLabel(application.status),
              String(application.permitYear ?? ""),
              application.validFrom ?? "",
              application.validUntil ?? "",
              application.approvedAt ?? "",
              application.submittedAt,
              formatDateTime(application.validFrom),
              formatDateTime(application.validUntil),
              formatDateTime(application.approvedAt),
              formatDateTime(application.submittedAt),
              ...(application.displayedFields ?? []).flatMap((field) => [
                field.label,
                field.value,
              ]),
              getPermitControlNumber(application),
            ];

            return searchableValues
              .join(" ")
              .toLowerCase()
              .includes(normalizedSearch);
          });

    return [...searched].sort(
      (a, b) =>
        new Date(b.approvedAt ?? b.submittedAt).getTime() -
        new Date(a.approvedAt ?? a.submittedAt).getTime(),
    );
  }, [activePermitType, applications, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / ITEMS_PER_PAGE),
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activePermitType, searchTerm]);

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
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredApplications.length);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const showLoadingSkeleton = isLoading && !hasLoadedOnce;

  const getDetailApplicationId = (
    application: BploPermitValidityApplicationType,
  ) => {
    // Prefer current fiscal-year application if available for accurate detail context.
    const currentYearId = String(application.currentYearApplicationId ?? "").trim();
    return currentYearId || application._id;
  };

  const openDetails = async (application: BploPermitValidityApplicationType) => {
    const detailApplicationId = getDetailApplicationId(application);
    setSelectedApplicationId(detailApplicationId);
    setSelectedApplication(null);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const response = await getRoutedApplicationByIdApi(detailApplicationId);
      setSelectedApplication(response.data ?? null);
    } catch (err: unknown) {
      setDetailError(
        getRequestErrorMessage(err, "Failed to load application details."),
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

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-3 pb-24 sm:gap-6 md:h-full md:min-h-0 md:overflow-hidden md:pb-0">
      <div
        className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6"
        data-bplo-admin-tour="permit-validity-header"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
            Permit Validity
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fiscal-year validity status grouped by permit type.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 md:p-4">
        <label
          htmlFor="permit-validity-search"
          className="mb-2 block text-sm font-semibold text-[#0F2942]"
        >
          Search Records
        </label>
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            id="permit-validity-search"
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by applicant, permit type, status, date, ID..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-[#0F2942] outline-none transition focus:border-[#0F2942]"
          />
        </div>
      </div>

      {showLoadingSkeleton ? (
        <BploAdminPermitValidityTabsSkeleton />
      ) : permitTabs.length > 1 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-3 md:p-4">
          <div className="sm:hidden">
            <label
              htmlFor="permit-validity-type-filter"
              className="mb-2 block text-sm font-semibold text-[#0F2942]"
            >
              Permit Type
            </label>
            <select
              id="permit-validity-type-filter"
              value={activePermitType}
              onChange={(event) => setActivePermitType(event.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] outline-none transition focus:border-[#0F2942]"
            >
              {permitTabs.map((tab) => (
                <option key={tab} value={tab}>
                  {tab === "all" ? "All Permit Types" : tab}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden gap-2 sm:flex sm:flex-wrap">
            {permitTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActivePermitType(tab)}
                aria-pressed={activePermitType === tab}
                className={`no-login-theme shrink-0 px-4 py-2 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                  activePermitType === tab
                    ? "border-[#F2C94C] bg-[#F2C94C] text-[#0F2942]"
                    : "border-[#D8DEE8] bg-white text-[#5E6D7E] hover:border-[#B9C4D4] hover:bg-[#F8FAFC]"
                }`}
              >
                {tab === "all" ? "All Permit Types" : tab}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex min-h-96 w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:min-h-0 md:flex-1">
        <div className="md:min-h-0 md:flex-1">
          {showLoadingSkeleton ? (
            <BploAdminPermitValidityResultsSkeleton />
          ) : filteredApplications.length === 0 ? (
            <div className="flex h-full items-center justify-center py-16 text-center text-sm font-semibold text-gray-500">
              No permit validity records found.
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 md:hidden">
                {paginatedApplications.map((application) => (
                  <article
                    key={application._id}
                    className="p-4 sm:p-5"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-lg font-black leading-tight text-[#0F2942] wrap-break-words">
                            {application.applicantName}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-gray-500 wrap-break-word">
                            Permit: {application.permitType}
                          </p>
                        </div>

                        <span
                          className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(
                            application.status,
                          )}`}
                        >
                          {getStatusLabel(application.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                            Control Number
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#0F2942]">
                            {getPermitControlNumber(application)}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-[#F8FAFC] px-4 py-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-gray-400">
                            Valid From
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[#0F2942]">
                            {formatDate(application.validFrom)}
                          </p>
                        </div>

                      </div>

                      {(application.displayedFields ?? []).length > 0 && (
                        <div className="space-y-2">
                          {(application.displayedFields ?? []).map((field) => (
                            <div
                              key={`${application._id}-${field.fieldId}`}
                              className="rounded-xl border border-[#E8ECF3] bg-[#FCFDFF] px-4 py-3"
                            >
                              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
                                {field.label}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                                {field.value}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => void openDetails(application)}
                        className="w-full rounded-xl bg-[#0F2942] px-4 py-3 text-sm font-bold text-white cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-auto md:h-full md:block">
                <table className="w-full min-w-160 border-collapse text-left">
                  <thead className="bg-[#0F2942] text-sm uppercase tracking-wide text-white">
                    <tr>
                      <th className="px-5 py-4">Applicant Name</th>
                      <th className="px-5 py-4">Permit</th>
                      <th className="px-5 py-4">Control Number</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4">Valid From</th>
                      <th className="px-5 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedApplications.map((application) => (
                      <tr
                        key={application._id}
                        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                        onClick={() => void openDetails(application)}
                      >
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {application.applicantName}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {application.permitType}
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {getPermitControlNumber(application)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                              application.status,
                            )}`}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-700">
                          {formatDateTime(application.validFrom)}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void openDetails(application);
                            }}
                            className="rounded-xl bg-[#0F2942] px-4 py-2 text-sm font-bold text-white cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {!showLoadingSkeleton && filteredApplications.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:px-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-gray-600">
              Showing {pageStart}-{pageEnd} of {filteredApplications.length}
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
        isPermitValidityView
        onClose={closeDetails}
      />
    </div>
  );
}
