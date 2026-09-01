import type { OfficerType } from "@/types/officer/officer.type";
import type { FormEvent } from "react";
import { FiX } from "react-icons/fi";

import {
  getOfficerDisplayName,
  getOfficerRoleBadgeClass,
  getOfficerRoleLabel,
} from "./shared";

type DeleteOfficerModalProps = {
  officer: OfficerType;
  isDeletingOfficer: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function DeleteOfficerModal({
  officer,
  isDeletingOfficer,
  onClose,
  onSubmit,
}: DeleteOfficerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-3">
            <h2 className="text-2xl font-black text-red-700">Delete Officer</h2>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
            >
              <FiX className="text-2xl" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="rounded-2xl border border-red-100 bg-red-50/70 p-4">
              <p className="font-bold text-red-900">
                {getOfficerDisplayName(officer)}
              </p>
              <p className="mt-1 text-sm font-medium text-red-700">
                {officer.email}
              </p>
              <span
                className={`mt-3 inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-black uppercase tracking-wider ${getOfficerRoleBadgeClass(officer.role)}`}
              >
                {getOfficerRoleLabel(officer.role)}
              </span>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              This action will permanently remove the selected officer account
              from the system.
            </div>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 cursor-pointer rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDeletingOfficer}
                className="flex-1 cursor-pointer rounded-xl bg-red-600 px-6 py-3 font-bold text-white transition-all hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeletingOfficer ? "Deleting..." : "Delete Officer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
