import type { InspectionDepartmentType } from "@/types/process/process.type";
import type { FormEvent } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";

import {
  genderOptions,
  getDepartmentPlaceholder,
  roleOptions,
  type OfficerFormState,
} from "./shared";

type AddOfficerModalProps = {
  formData: OfficerFormState;
  isSubmitting: boolean;
  isDepartmentLoading: boolean;
  isDepartmentScopedRole: boolean;
  departments: InspectionDepartmentType[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (field: keyof OfficerFormState, value: string) => void;
};

export default function AddOfficerModal({
  formData,
  isSubmitting,
  isDepartmentLoading,
  isDepartmentScopedRole,
  departments,
  onClose,
  onSubmit,
  onFormChange,
}: AddOfficerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-3">
            <h2 className="text-2xl font-black text-[#0F2942]">
              Add New Officer
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="transition-colors hover:text-gray-600"
            >
              <FiX className="text-2xl text-gray-400" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => onFormChange("firstName", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => onFormChange("middleName", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  placeholder="(Optional)"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => onFormChange("lastName", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Suffix
                </label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => onFormChange("suffix", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  placeholder="Jr. (Optional)"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-600">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => onFormChange("email", e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                placeholder="officer@bplo.com"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Gender *
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => onFormChange("gender", e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
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
                    value={formData.role}
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

            {isDepartmentScopedRole && (
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Department *
                </label>
                <div className="relative">
                  <select
                    required={isDepartmentScopedRole}
                    value={formData.departmentId}
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
              </div>
            )}

            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-800">
                <span className="font-bold">Note:</span> A default password will
                be generated automatically and sent via email to the officer
                along with their login credentials.
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
                disabled={isSubmitting}
                className="flex-1 rounded-xl bg-[#0F2942] px-6 py-3 font-bold text-white transition-all hover:bg-[#1E3A56] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Officer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
