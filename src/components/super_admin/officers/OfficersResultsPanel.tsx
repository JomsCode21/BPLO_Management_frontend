import type { OfficerType } from "@/types/officer/officer.type";
import { FiEdit2, FiLoader, FiSearch, FiTrash2 } from "react-icons/fi";

import {
  getOfficerDisplayName,
  getOfficerInitial,
  getOfficerRoleBadgeClass,
  getOfficerRoleLabel,
  getScopedOfficerSummaryLabel,
  getTabEmptyLabel,
  type RoleTab,
} from "./shared";

type OfficersResultsPanelProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  officersCount: number;
  filteredOfficers: OfficerType[];
  paginatedOfficers: OfficerType[];
  activeTab: RoleTab;
  currentPage: number;
  totalPages: number;
  pageStart: number;
  pageEnd: number;
  paginationItems: Array<number | string>;
  onRetry: () => void;
  onOpenEdit: (officer: OfficerType) => void;
  onOpenDelete: (officer: OfficerType) => void;
  canEditOfficer: (officer: OfficerType) => boolean;
  canDeleteOfficer: (officer: OfficerType) => boolean;
  getEditOfficerTitle: (officer: OfficerType) => string;
  getDeleteOfficerTitle: (officer: OfficerType) => string;
  onPreviousPage: () => void;
  onNextPage: () => void;
  onSelectPage: (page: number) => void;
};

export default function OfficersResultsPanel({
  searchTerm,
  onSearchTermChange,
  isLoading,
  error,
  officersCount,
  filteredOfficers,
  paginatedOfficers,
  activeTab,
  currentPage,
  totalPages,
  pageStart,
  pageEnd,
  paginationItems,
  onRetry,
  onOpenEdit,
  onOpenDelete,
  canEditOfficer,
  canDeleteOfficer,
  getEditOfficerTitle,
  getDeleteOfficerTitle,
  onPreviousPage,
  onNextPage,
  onSelectPage,
}: OfficersResultsPanelProps) {
  return (
    <div className="flex w-full flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm md:min-h-0 md:flex-1">
      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/50 p-4 sm:p-5">
        <div className="relative w-full sm:max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
          <input
            type="text"
            placeholder="Search officers by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm font-medium transition-all focus:border-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
          />
        </div>
      </div>

      <div className="md:min-h-0 md:flex-1">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-gray-400">
            <FiLoader className="mb-4 animate-spin text-4xl text-[#0F2942]" />
            <p className="font-bold tracking-wide">Loading officers...</p>
          </div>
        ) : error && officersCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-red-500">
            <p className="font-bold tracking-wide">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 text-sm font-bold text-[#0F2942] underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredOfficers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-20 text-gray-400">
            <p className="font-bold tracking-wide">{getTabEmptyLabel(activeTab)}</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100 md:hidden">
              {paginatedOfficers.map((officer) => (
                <article key={officer._id} className="space-y-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0F2942]/10 text-sm font-black text-[#0F2942]">
                      {getOfficerInitial(officer)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-[#0F2942]">
                        {getOfficerDisplayName(officer)}
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-gray-500">
                        {officer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider ${getOfficerRoleBadgeClass(officer.role)}`}
                    >
                      {getOfficerRoleLabel(officer.role)}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                      Active
                    </span>
                    {officer.departmentName && (
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {officer.departmentName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(officer)}
                      disabled={!canEditOfficer(officer)}
                      className={`rounded-xl p-2 transition-all ${
                        canEditOfficer(officer)
                          ? "cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                          : "cursor-not-allowed text-gray-300 opacity-60"
                      }`}
                      title={getEditOfficerTitle(officer)}
                    >
                      <FiEdit2 className="text-lg" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenDelete(officer)}
                      disabled={!canDeleteOfficer(officer)}
                      className={`rounded-xl p-2 transition-all ${
                        canDeleteOfficer(officer)
                          ? "cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-600"
                          : "cursor-not-allowed text-gray-300 opacity-60"
                      }`}
                      title={getDeleteOfficerTitle(officer)}
                    >
                      <FiTrash2 className="text-lg" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-3xl border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-white text-xs font-bold uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-5">Name</th>
                    <th className="px-6 py-5">Email Address</th>
                    <th className="px-6 py-5">Role</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedOfficers.map((officer) => (
                    <tr
                      key={officer._id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F2942]/10 text-sm font-black text-[#0F2942]">
                            {getOfficerInitial(officer)}
                          </div>
                          <span className="font-bold text-[#0F2942]">
                            {getOfficerDisplayName(officer)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-500">
                          {officer.email}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider ${getOfficerRoleBadgeClass(officer.role)}`}
                        >
                          {getOfficerRoleLabel(officer.role)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                          <span className="text-sm font-bold text-gray-600">
                            Active
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 transition-opacity xl:opacity-0 xl:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => onOpenEdit(officer)}
                            disabled={!canEditOfficer(officer)}
                            className={`rounded-xl p-2 transition-all ${
                              canEditOfficer(officer)
                                ? "cursor-pointer text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                                : "cursor-not-allowed text-gray-300 opacity-60"
                            }`}
                            title={getEditOfficerTitle(officer)}
                          >
                            <FiEdit2 className="text-lg" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenDelete(officer)}
                            disabled={!canDeleteOfficer(officer)}
                            className={`rounded-xl p-2 transition-all ${
                              canDeleteOfficer(officer)
                                ? "cursor-pointer text-gray-400 hover:bg-red-50 hover:text-red-600"
                                : "cursor-not-allowed text-gray-300 opacity-60"
                            }`}
                            title={getDeleteOfficerTitle(officer)}
                          >
                            <FiTrash2 className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1 border-t border-gray-100 p-4 text-sm font-medium text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Showing {pageStart}-{pageEnd} of{" "}
          {getScopedOfficerSummaryLabel(activeTab, filteredOfficers.length)}
        </span>
        {filteredOfficers.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
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
                    onClick={() => onSelectPage(item)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-sm font-bold ${
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
              onClick={onNextPage}
              disabled={currentPage === totalPages}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
