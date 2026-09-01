import { getMainTreasurerPaymentsApi } from "@/api/treasurer/treasurer.api";
import type { MainTreasurerPaymentGroupType } from "@/components/main_treasurer/payments/shared";
import {
  formatCurrency,
  getPaymentStatusBadge,
} from "@/components/main_treasurer/payments/shared";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import { LazyModalFallback } from "@/components/ui/LazyFallback";
import {
  createTreasurerSocket,
  MAIN_TREASURER_PAYMENT_EVENT,
} from "@/socket/treasurer.socket";
import type { MainTreasurerPaymentType } from "@/types/treasurer/treasurer.type";
import { isNotModifiedHttpError } from "@/utils/error/http-error.util";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  FiCheck,
  FiCamera,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import { Link } from "react-router-dom";

const MainTreasurerPaymentDetailsModal = lazy(
  () =>
    import(
      "@/components/main_treasurer/payments/MainTreasurerPaymentDetailsModal"
    ),
);

const modalFallback = (
  <LazyModalFallback
    title="Loading payment details"
    description="Preparing the payment breakdown and assessment history."
    align="top"
    maxWidthClassName="max-w-4xl"
  />
);

const ITEMS_PER_PAGE = 5 as const;

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

const buildPaymentGroups = (records: MainTreasurerPaymentType[]) =>
  Array.from(
    records
      .reduce<Map<string, MainTreasurerPaymentGroupType>>((groups, record) => {
        const existing = groups.get(record.applicationId);
        const generatedAtTime = new Date(record.generatedAt ?? "").getTime();
        const statusUpdatedTime = new Date(record.statusUpdatedAt ?? "").getTime();

        if (!existing) {
          groups.set(record.applicationId, {
            applicationId: record.applicationId,
            applicantName: record.applicantName,
            applicantEmail: record.applicantEmail,
            permitType: record.permitType,
            combinedQrValue: record.combinedQrValue?.trim() || "",
            generatedAt: record.generatedAt ?? null,
            statusUpdatedAt: record.statusUpdatedAt ?? null,
            statusUpdatedByName: record.statusUpdatedByName,
            totalAmount: Number(record.totalAmount ?? 0),
            paymentStatus: record.paymentStatus === "paid" ? "paid" : "pending",
            assessments: [record],
            paidCount: record.paymentStatus === "paid" ? 1 : 0,
          });
          return groups;
        }

        const existingGeneratedAtTime = new Date(existing.generatedAt ?? "").getTime();
        const existingStatusUpdatedTime = new Date(
          existing.statusUpdatedAt ?? "",
        ).getTime();

        existing.assessments.push(record);
        existing.totalAmount += Number(record.totalAmount ?? 0);
        existing.paidCount += record.paymentStatus === "paid" ? 1 : 0;

        if (generatedAtTime > existingGeneratedAtTime) {
          existing.generatedAt = record.generatedAt ?? null;
        }

        if (statusUpdatedTime > existingStatusUpdatedTime) {
          existing.statusUpdatedAt = record.statusUpdatedAt ?? null;
          existing.statusUpdatedByName = record.statusUpdatedByName;
        }

        if (!existing.combinedQrValue && record.combinedQrValue?.trim()) {
          existing.combinedQrValue = record.combinedQrValue.trim();
        }

        existing.paymentStatus =
          existing.paidCount === existing.assessments.length ? "paid" : "pending";

        return groups;
      }, new Map<string, MainTreasurerPaymentGroupType>())
      .values(),
  ).sort(
    (a, b) =>
      new Date(b.generatedAt ?? "").getTime() -
      new Date(a.generatedAt ?? "").getTime(),
  );

export default function MainTreasurerPaymentsPage() {
  const [records, setRecords] = useState<MainTreasurerPaymentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [permit, setPermit] = useState("");
  const [isPermitMenuOpen, setIsPermitMenuOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const permitMenuRef = useRef<HTMLDivElement | null>(null);

  const loadRecords = async (options?: { silent?: boolean }) => {
    const isSilent = options?.silent ?? false;
    if (!isSilent) {
      setIsLoading(true);
      setError(null);
    }
    try {
      const response = await getMainTreasurerPaymentsApi();
      // Source queue from backend before local grouping/filtering.
      setRecords(response.data ?? []);
      if (isSilent) {
        setError(null);
      }
    } catch (err: unknown) {
      if (isNotModifiedHttpError(err)) {
        if (!isSilent) setError(null);
        return;
      }

      if (!isSilent) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(
          error?.response?.data?.message ?? "Failed to load payment records.",
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
    void loadRecords();
  }, []);

  useEffect(() => {
    const socket = createTreasurerSocket();
    socket.on(MAIN_TREASURER_PAYMENT_EVENT, () => {
      // Refresh quietly on payment updates from scanner or manual status actions.
      void loadRecords({ silent: true });
    });

    return () => {
      socket.off(MAIN_TREASURER_PAYMENT_EVENT);
      socket.disconnect();
    };
  }, []);

  const sorted = useMemo(() => buildPaymentGroups(records), [records]);
  const unpaidRows = useMemo(
    () => sorted.filter((row) => row.paymentStatus !== "paid"),
    [sorted],
  );
  const permitOptions = useMemo(
    () =>
      Array.from(
        new Set(
          unpaidRows
            .map((row) => row.permitType.trim())
            .filter((value) => value.length > 0),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [unpaidRows],
  );
  const hasPermitChoices = permitOptions.length > 0;

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const fromTime = dateFrom
      ? new Date(`${dateFrom}T00:00:00`).getTime()
      : Number.NEGATIVE_INFINITY;
    const toTime = dateTo
      ? new Date(`${dateTo}T23:59:59.999`).getTime()
      : Number.POSITIVE_INFINITY;

    return unpaidRows.filter((row) => {
      if (permit && row.permitType !== permit) {
        return false;
      }

      const generatedTime = row.generatedAt
        ? new Date(row.generatedAt).getTime()
        : NaN;
      const hasValidGeneratedTime = Number.isFinite(generatedTime);

      if (dateFrom && (!hasValidGeneratedTime || generatedTime < fromTime)) {
        return false;
      }

      if (dateTo && (!hasValidGeneratedTime || generatedTime > toTime)) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        row.applicantName,
        row.applicantEmail,
        row.permitType,
        formatCurrency(row.totalAmount),
        ...row.assessments.map((assessment) => assessment.departmentName),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [dateFrom, dateTo, permit, search, unpaidRows]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      // Debounce search typing so filter updates feel responsive without rerender thrash.
      const nextSearch = searchInput.trim();

      if (nextSearch === search) {
        return;
      }

      setCurrentPage(1);
      setSearch(nextSearch);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, search]);

  useEffect(() => {
    if (!permit || permitOptions.includes(permit)) {
      return;
    }

    setPermit("");
    setCurrentPage(1);
  }, [permit, permitOptions]);

  useEffect(() => {
    if (!isPermitMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!permitMenuRef.current) return;
      if (!permitMenuRef.current.contains(event.target as Node)) {
        setIsPermitMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isPermitMenuOpen]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!selectedApplicationId) return;

    const selectedStillExists = filteredRows.some(
      (row) => row.applicationId === selectedApplicationId,
    );

    if (!selectedStillExists) {
      setSelectedApplicationId(null);
    }
  }, [filteredRows, selectedApplicationId]);

  useEffect(() => {
    if (!selectedApplicationId) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedApplicationId(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedApplicationId]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredRows]);

  const selectedPayment = useMemo(
    () =>
      selectedApplicationId
        ? filteredRows.find((row) => row.applicationId === selectedApplicationId) ??
          null
        : null,
    [filteredRows, selectedApplicationId],
  );

  const pageStart =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const pageEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length);

  const openDetails = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
  };

  const closeDetails = () => {
    setSelectedApplicationId(null);
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    applicationId: string,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openDetails(applicationId);
    }
  };

  const paginationItems = getPaginationItems(currentPage, totalPages);
  const handleSearchSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const nextSearch = searchInput.trim();
      setCurrentPage(1);
      setSearch(nextSearch);
    },
    [searchInput],
  );

  const showLoadingSkeleton = isLoading && !hasLoadedOnce;

  if (showLoadingSkeleton) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="min-h-screen p-2 md:p-6 flex flex-col gap-4 sm:gap-6 md:overflow-hidden">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0F2942]">
              Payment Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              This queue shows unpaid applications only. Click any row below to
              inspect the full payment details before confirming payment.
            </p>
          </div>

          <Link
            to="/home/main_treasurer/scan-payment"
            className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-[#F2C94C] px-4 py-2.5 text-sm font-bold text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.28)] transition-all duration-200 hover:bg-[#e6bf43]"
          >
            <FiCamera />
            Scan Owner QR
          </Link>
        </div>

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
                placeholder="Search by permit, applicant, amount, department..."
                className="w-full px-2 py-2.5 text-sm outline-none"
              />
            </div>
          </label>

          <label>
            <span className="mb-1 block text-xs font-bold uppercase tracking-[0.16em] text-gray-500">
              Permit
            </span>
            <div className="relative" ref={permitMenuRef}>
              <button
                type="button"
                onClick={() => {
                  if (!hasPermitChoices) return;
                  setIsPermitMenuOpen((prev) => !prev);
                }}
                className={`flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-[#0F2942] outline-none transition ${
                  hasPermitChoices ? "hover:border-gray-300" : "cursor-default"
                }`}
              >
                <span className="truncate">{permit || "All"}</span>
                <FiChevronDown
                  className={`ml-2 text-gray-500 transition-transform ${
                    isPermitMenuOpen && hasPermitChoices ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isPermitMenuOpen && hasPermitChoices && (
                <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                  {["", ...permitOptions].map((option) => {
                    const optionLabel = option || "All";
                    const isActive = option === permit;
                    return (
                      <button
                        key={optionLabel}
                        type="button"
                        onClick={() => {
                          setPermit(option);
                          setCurrentPage(1);
                          setIsPermitMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition ${
                          isActive
                            ? "bg-[#0F2942] text-white"
                            : "text-[#0F2942] hover:bg-gray-50"
                        }`}
                      >
                        <span className="truncate">{optionLabel}</span>
                        {isActive && <FiCheck className="ml-2 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                setCurrentPage(1);
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
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
            />
          </label>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {filteredRows.length === 0 ? (
          <div className="py-16 text-center text-sm font-semibold text-gray-500">
            No unpaid payment records in the queue.
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {paginatedRows.map((row) => (
                <article
                  key={row.applicationId}
                  tabIndex={0}
                  role="button"
                  aria-label={`View payment details for ${row.applicantName}`}
                  onClick={() => openDetails(row.applicationId)}
                  onKeyDown={(event) =>
                    handleRowKeyDown(event, row.applicationId)
                  }
                  className="space-y-4 p-4 transition-colors hover:bg-[#FFF9E8] focus-visible:bg-[#FFF9E8] focus-visible:outline-none sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-[#0F2942]">
                        {row.applicantName}
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-gray-500">
                        {row.applicantEmail}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] ${
                        getPaymentStatusBadge(row.paymentStatus).className
                      }`}
                    >
                      {getPaymentStatusBadge(row.paymentStatus).label}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                        Permit
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                        {row.permitType}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                        Total Amount
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#0F2942]">
                        {formatCurrency(row.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                      Departments
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                      {row.assessments.length} department
                      {row.assessments.length > 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {row.assessments
                        .map((assessment) => assessment.departmentName)
                        .join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-gray-500">
                      {row.paidCount}/{row.assessments.length} department
                      payment
                      {row.assessments.length > 1 ? "s" : ""} marked paid
                    </p>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDetails(row.applicationId);
                      }}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-300 px-5 py-2 text-sm font-bold text-[#0F2942] transition-all hover:border-[#0F2942] hover:bg-[#0F2942] hover:text-white"
                    >
                      View Details
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-262.5 border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-white text-xs font-bold uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-5">Applicant</th>
                    <th className="px-6 py-5">Permit</th>
                    <th className="px-6 py-5">Departments</th>
                    <th className="px-6 py-5">Total Amount</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedRows.map((row) => (
                    <tr
                      key={row.applicationId}
                      tabIndex={0}
                      role="button"
                      aria-label={`View payment details for ${row.applicantName}`}
                      onClick={() => openDetails(row.applicationId)}
                      onKeyDown={(event) =>
                        handleRowKeyDown(event, row.applicationId)
                      }
                      className="cursor-pointer transition-colors hover:bg-[#FFF9E8] focus-visible:bg-[#FFF9E8] focus-visible:outline-none"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-[#0F2942]">
                          {row.applicantName}
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-500">
                          {row.applicantEmail}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                        {row.permitType}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-semibold text-[#0F2942]">
                          {row.assessments.length} department
                          {row.assessments.length > 1 ? "s" : ""}
                        </p>
                        <p className="mt-1 max-w-md text-sm leading-relaxed text-gray-500">
                          {row.assessments
                            .map((assessment) => assessment.departmentName)
                            .join(", ")}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-[#0F2942]">
                        {formatCurrency(row.totalAmount)}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${
                            getPaymentStatusBadge(row.paymentStatus).className
                          }`}
                        >
                          {getPaymentStatusBadge(row.paymentStatus).label}
                        </span>
                        <p className="mt-2 text-sm font-medium text-gray-500">
                          {row.paidCount}/{row.assessments.length} department
                          payment
                          {row.assessments.length > 1 ? "s" : ""} marked paid
                        </p>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDetails(row.applicationId);
                          }}
                          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-gray-300 px-5 py-2 text-sm font-bold text-[#0F2942] transition-all hover:border-[#0F2942] hover:bg-[#0F2942] hover:text-white"
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

        {!isLoading && filteredRows.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 p-4 text-sm font-medium text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {pageStart}-{pageEnd} of {filteredRows.length} payment
              {filteredRows.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gray-100 px-5 py-2 text-sm font-bold text-[#0F2942] transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
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

                  const isActive = item === currentPage;

                  return (
                    <button
                      key={item}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setCurrentPage(item)}
                      className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-bold transition-all ${
                        isActive
                          ? "border-transparent bg-[#F2C94C] text-[#0F2942] shadow-[0_8px_20px_rgba(242,201,76,0.25)]"
                          : "border-gray-300 text-[#0F2942] hover:border-[#0F2942]/30 hover:bg-gray-50"
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
                className="inline-flex min-h-10 items-center justify-center rounded-xl bg-gray-100 px-5 py-2 text-sm font-bold text-[#0F2942] transition-all hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedApplicationId && (
        <Suspense fallback={modalFallback}>
          <MainTreasurerPaymentDetailsModal
            selectedPayment={selectedPayment}
            onClose={closeDetails}
          />
        </Suspense>
      )}
    </div>
  );
}
