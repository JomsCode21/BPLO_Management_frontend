import type { InspectionDepartmentType } from "@/types/process/process.type";
import type { FormEvent } from "react";
import { FiChevronDown, FiLoader, FiX } from "react-icons/fi";

import {
  genderOptions,
  getDepartmentHelpText,
  getDepartmentPlaceholder,
  roleOptions,
  type OfficerFormState,
} from "./shared";

type EditOfficerModalProps = {
  editFormData: OfficerFormState;
  editingOfficerOriginalRole: string;
  isEditLoading: boolean;
  isUpdatingOfficer: boolean;
  isDepartmentLoading: boolean;
  isEditDepartmentScopedRole: boolean;
  departments: InspectionDepartmentType[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof OfficerFormState, value: string) => void;
};

export default function EditOfficerModal({
  editFormData,
  editingOfficerOriginalRole,
  isEditLoading,
  isUpdatingOfficer,
  isDepartmentLoading,
  isEditDepartmentScopedRole,
  departments,
  onClose,
  onSubmit,
  onFormChange,
}: EditOfficerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-[#0F2942]">
                Edit Officer Role
              </h2>
              <p className="mt-1 text-sm font-medium text-gray-500">
                Officer details are locked. Only the role can be changed here.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="transition-colors hover:text-gray-600"
            >
              <FiX className="text-2xl text-gray-400" />
            </button>
          </div>

          {isEditLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FiLoader className="mb-4 animate-spin text-4xl text-[#0F2942]" />
              <p className="font-bold tracking-wide">
                Loading officer details...
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    First Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editFormData.firstName}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editFormData.middleName}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Last Name
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editFormData.lastName}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Suffix
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editFormData.suffix}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  value={editFormData.email}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      disabled
                      value={editFormData.gender}
                      className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 focus:outline-none"
                    >
                      <option value="">Select Gender</option>
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Role *
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={editFormData.role}
                      onChange={(e) => onFormChange("role", e.target.value)}
                      className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    >
                      {roleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>

              {isEditDepartmentScopedRole && (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Department *
                  </label>
                  <div className="relative">
                    <select
                      required={isEditDepartmentScopedRole}
                      value={editFormData.departmentId}
                      onChange={(e) => onFormChange("departmentId", e.target.value)}
                      disabled={isDepartmentLoading}
                      className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <option value="">
                        {getDepartmentPlaceholder(isDepartmentLoading)}
                      </option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>
                          {department.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {getDepartmentHelpText(editingOfficerOriginalRole)}
                  </p>
                </div>
              )}

              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-800">
                  Inspector and Department Treasurer roles require a department
                  assignment. Inspectors with active assigned inspections cannot
                  be switched to another role until those assignments are
                  resolved.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-600 transition-all hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingOfficer}
                  className="flex-1 rounded-xl bg-[#0F2942] px-6 py-3 font-bold text-white transition-all hover:bg-[#1E3A56] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingOfficer ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
