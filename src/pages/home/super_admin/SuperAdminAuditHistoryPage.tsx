import {
  getSuperAdminWorkflowAuditApi,
  type SuperAdminWorkflowAuditEvent,
  type SuperAdminWorkflowAuditPagination,
} from "@/api/super_admin/super_admin.api";
import WorkflowAuditDetailsModal from "@/components/audit/WorkflowAuditDetailsModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import {
  SUPER_ADMIN_WORKFLOW_AUDIT_EVENT,
  createSuperAdminSocket,
} from "@/socket/super_admin.socket";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import { FiSearch } from "react-icons/fi";

const ITEMS_PER_PAGE = 8;

const initialPagination: SuperAdminWorkflowAuditPagination = {
  page: 1,
  limit: ITEMS_PER_PAGE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
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

const normalizeLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);

  const paginationItems: Array<number | string> = [];

  sortedPages.forEach((value, index) => {
    const previousValue = sortedPages[index - 1];
    if (previousValue && value - previousValue > 1) {
      paginationItems.push(`ellipsis-${previousValue}-${value}`);
    }
    paginationItems.push(value);
  });

  return paginationItems;
};

export default function SuperAdminAuditHistoryPage() {
  const [rows, setRows] = useState<SuperAdminWorkflowAuditEvent[]>([]);
  const [pagination, setPagination] =
    useState<SuperAdminWorkflowAuditPagination>(initialPagination);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEvent, setSelectedEvent] =
    useState<SuperAdminWorkflowAuditEvent | null>(null);
  const latestRequestIdRef = useRef(0);

  const sourceOptions = useMemo(
    () => ["system", "evaluator", "bplo_admin", "inspector", "treasurer"],
    [],
  );

  const loadAudit = useCallback(async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    const requestId = latestRequestIdRef.current + 1;
    latestRequestIdRef.current = requestId;

    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const response = await getSuperAdminWorkflowAuditApi({
        page,
        limit: ITEMS_PER_PAGE,
        source,
        search: search.trim(),
        dateFrom,
        dateTo,
      });
      // Ignore stale responses when filters/page changed during request.
      if (requestId !== latestRequestIdRef.current) return;
      setRows(response.data ?? []);
      setPagination(response.pagination ?? initialPagination);
      if (isSilent) {
        setError(null);
      }
    } catch (err: unknown) {
      if (requestId !== latestRequestIdRef.current) return;

      if (isNotModifiedHttpError(err)) {
        setError(null);
        return;
      }

      if (!isSilent) {
        const apiError = err as { response?: { data?: { message?: string } } };
        setError(
          apiError?.response?.data?.message ??
            "Failed to load workflow audit history.",
        );
      }
    } finally {
      if (requestId === latestRequestIdRef.current && !isSilent) {
        setIsLoading(false);
        setHasLoadedOnce(true);
      }
    }
  }, [page, source, search, dateFrom, dateTo]);

  useEffect(() => {
    void loadAudit({ silent: hasLoadedOnce });
  }, [hasLoadedOnce, loadAudit]);

  useEffect(() => {
    const socket = createSuperAdminSocket();
    socket.on(SUPER_ADMIN_WORKFLOW_AUDIT_EVENT, () => {
      void loadAudit({ silent: true });
    });

    return () => {
      socket.off(SUPER_ADMIN_WORKFLOW_AUDIT_EVENT);
      socket.disconnect();
    };
  }, [loadAudit]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      // Debounce free-text search input before triggering another query.
      const nextSearch = searchInput.trim();

      if (nextSearch === search) {
        return;
      }

      setPage(1);
      setSearch(nextSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, search]);

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextSearch = searchInput.trim();

    setPage(1);
    setSearch(nextSearch);

    if (page === 1 && search === nextSearch) {
      void loadAudit({ silent: hasLoadedOnce });
    }
  };

  const totalPages = Math.max(1, pagination.totalPages);
  const pageStart =
    pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const pageEnd = Math.min(pagination.page * pagination.limit, pagination.total);
  const paginationItems = getPaginationItems(page, totalPages);
  const showLoadingSkeleton = isLoading && !hasLoadedOnce;

  if (showLoadingSkeleton) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-4">
      <section
        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
        data-super-admin-tour="audit-history-header"
      >
        <h1 className="text-2xl font-black text-[#0F2942]">Workflow Audit History</h1>
        <p className="mt-2 text-sm font-medium text-gray-600">
          System-wide workflow event history for super admin monitoring.
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-5"
        >
          <label className="lg:col-span-2">
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              Search
            </span>
            <div className="flex items-center rounded-xl border border-gray-200 bg-white px-3">
              <FiSearch className="text-gray-400" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by when, status, source, actor, permit, applicant, remark..."
                className="w-full px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              Source
            </span>
            <select
              value={source}
              onChange={(event) => {
                setSource(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {normalizeLabel(option)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              From
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </label>

          <label>
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              To
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </label>
        </form>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {rows.length === 0 ? (
          <div className="py-12 px-5 text-center text-sm font-semibold text-gray-500">
            No audit records found for the current filter.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full table-auto border-collapse text-left">
              <thead className="bg-[#0F2942] text-xs uppercase tracking-[0.16em] text-white">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Permit</th>
                  <th className="px-4 py-3">Applicant</th>
                  <th className="px-4 py-3">Remark</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row._id}
                    className="cursor-pointer border-b border-gray-100 text-sm text-gray-700 transition hover:bg-gray-50 last:border-b-0"
                    onClick={() => setSelectedEvent(row)}
                  >
                    <td className="px-4 py-3 font-semibold text-[#0F2942]">
                      {formatDateTime(row.occurredAt)}
                    </td>
                    <td className="px-4 py-3">{row.statusCode}</td>
                    <td className="px-4 py-3">{normalizeLabel(row.source)}</td>
                    <td className="px-4 py-3">{row.actorName}</td>
                    <td className="px-4 py-3">{row.permitName}</td>
                    <td className="px-4 py-3">
                      <div>{row.applicantName}</div>
                      {row.applicantEmail && (
                        <div className="text-xs text-gray-500">{row.applicantEmail}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">{row.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-semibold text-gray-600">
          Showing {pageStart}-{pageEnd} of {pagination.total} event
          {pagination.total === 1 ? "" : "s"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={!pagination.hasPrevPage || isLoading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#0F2942] transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex flex-wrap items-center gap-1">
            {paginationItems.map((item) => {
              if (typeof item === "string") {
                return (
                  <span
                    key={item}
                    className="inline-flex h-9 min-w-9 items-center justify-center px-1 text-sm font-bold text-gray-400"
                  >
                    ...
                  </span>
                );
              }

              const isActive = item === page;
              return (
                <button
                  key={item}
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setPage(item)}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-[#F2C94C] text-[#0F2942] shadow-[0_8px_20px_rgba(242,201,76,0.25)]"
                      : "border border-gray-200 text-[#0F2942] hover:border-[#0F2942]/30 hover:bg-gray-50"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={!pagination.hasNextPage || isLoading}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-[#0F2942] transition-all disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>

      <WorkflowAuditDetailsModal
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        event={selectedEvent}
        title="Workflow Audit Event Details"
      />
    </div>
  );
}



