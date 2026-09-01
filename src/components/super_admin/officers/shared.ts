import type { InspectionDepartmentType } from "@/types/process/process.type";
import type { OfficerType } from "@/types/officer/officer.type";

export type RoleTab =
  | "ALL"
  | "SUPER_ADMIN"
  | "BPLO_ADMIN"
  | "EVALUATOR"
  | "INSPECTOR"
  | "DEPARTMENT_TREASURER"
  | "MAIN_TREASURER";

export type OfficerFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  gender: string;
  email: string;
  role: string;
  departmentId: string;
};

export type NewOfficerData = {
  email: string;
  password: string;
};

export type ApiError = { response?: { data?: { message?: string } } };

export const initialOfficerFormData: OfficerFormState = {
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  gender: "",
  email: "",
  role: "bplo_admin",
  departmentId: "",
};

export const officerRoleTabs: Array<{ value: RoleTab; label: string }> = [
  { value: "ALL", label: "All Officers" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "BPLO_ADMIN", label: "BPLO Admin" },
  { value: "EVALUATOR", label: "Evaluators" },
  { value: "INSPECTOR", label: "Inspectors" },
  { value: "DEPARTMENT_TREASURER", label: "Dept Treasurers" },
  { value: "MAIN_TREASURER", label: "Main Treasurers" },
];

export const roleOptions = [
  { value: "bplo_admin", label: "BPLO Admin" },
  { value: "evaluator", label: "Evaluator" },
  { value: "inspector", label: "Inspector" },
  { value: "department_treasurer", label: "Department Treasurer" },
  { value: "main_treasurer", label: "Main Treasurer" },
];

export const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer not to say", label: "Prefer not to say" },
];

export const getOfficerDisplayName = (officer: OfficerType) =>
  [officer.firstName, officer.lastName].filter(Boolean).join(" ") || "Unknown";

export const getOfficerInitial = (officer: OfficerType) =>
  officer.firstName?.charAt(0).toUpperCase() || "?";

export const getOfficerRoleLabel = (role: string) => {
  switch (role?.toLowerCase()) {
    case "super_admin":
      return "Super Admin";
    case "bplo_admin":
      return "BPLO Admin";
    case "evaluator":
      return "Evaluator";
    case "inspector":
      return "Inspector";
    case "department_treasurer":
      return "Department Treasurer";
    case "main_treasurer":
      return "Main Treasurer";
    default:
      return role ? role.replace(/_/g, " ") : "N/A";
  }
};

export const getOfficerRoleBadgeClass = (role: string) => {
  switch (role?.toLowerCase()) {
    case "super_admin":
    case "bplo_admin":
      return "bg-purple-100 text-purple-700";
    case "evaluator":
      return "bg-blue-100 text-blue-700";
    case "department_treasurer":
      return "bg-emerald-100 text-emerald-700";
    case "main_treasurer":
      return "bg-teal-100 text-teal-700";
    default:
      return "bg-orange-100 text-orange-700";
  }
};

export const requiresDepartmentRole = (role: string) =>
  role === "inspector" || role === "department_treasurer";

export const ITEMS_PER_PAGE = 7;

export const getPaginationItems = (currentPage: number, totalPages: number) => {
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

export const getApiErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as ApiError;
  return apiError?.response?.data?.message ?? fallback;
};

export const getTabEmptyLabel = (activeTab: RoleTab) =>
  activeTab === "ALL"
    ? "No officers found."
    : `No ${activeTab.toLowerCase().replaceAll("_", " ")}s found.`;

export const getScopedOfficerSummaryLabel = (
  activeTab: RoleTab,
  count: number,
) =>
  `${count} ${
    activeTab === "ALL"
      ? "officers"
      : `${activeTab.toLowerCase().replaceAll("_", " ")}s`
  }`;

export const getDepartmentPlaceholder = (
  isDepartmentLoading: boolean,
) => (isDepartmentLoading ? "Loading departments..." : "Select Department");

export const getDepartmentHelpText = (
  originalRole: string,
) =>
  originalRole === "inspector" || originalRole === "department_treasurer"
    ? "You can move this officer to another department here."
    : "Select the department this officer should be assigned to.";

export const sortDepartmentsBySequence = (
  departments: InspectionDepartmentType[],
) => [...departments].sort((a, b) => a.sequence - b.sequence);
