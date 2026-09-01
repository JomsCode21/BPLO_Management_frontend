import axiosInstance from "@/axios/axios-instance";
import type {
  PermitField,
  PermitSection,
  PermitType,
} from "@/types/permit/permit.type";
import type {
  InspectionDepartmentType,
  InspectionProcessType,
} from "@/types/process/process.type";
import type { OfficerType } from "@/types/officer/officer.type";

export type SuperAdminDashboardRoleKey =
  | "evaluators"
  | "inspectors"
  | "admins"
  | "departmentTreasurers"
  | "mainTreasurers";

export type SuperAdminDashboardRoleMetric = {
  key: SuperAdminDashboardRoleKey;
  label: string;
  count: number;
  share: number;
};

export type SuperAdminDashboardAnalytics = {
  totalOfficers: number;
  activeRoles: number;
  treasuryCoverage: number;
  coreOperations: number;
  dominantRole: SuperAdminDashboardRoleMetric | null;
  leanestActiveRole: SuperAdminDashboardRoleMetric | null;
};

export type SuperAdminDashboardWorkflow = {
  totalApplications: number;
  activeApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingEvaluation: number;
  pendingInspectionReview: number;
  activeInspections: number;
  awaitingPermitApproval: number;
  readyForRelease: number;
  applicationsWithPayments: number;
  awaitingPayment: number;
  fullyPaidApplications: number;
};

export type SuperAdminDashboardStats = {
  evaluators: number;
  inspectors: number;
  admins: number;
  departmentTreasurers: number;
  mainTreasurers: number;
  analytics: SuperAdminDashboardAnalytics;
  workflow: SuperAdminDashboardWorkflow;
};

export type SuperAdminWorkflowAuditEvent = {
  _id: string;
  applicationId: string;
  permitName: string;
  applicantName: string;
  applicantEmail?: string;
  statusCode: string;
  source: "system" | "evaluator" | "bplo_admin" | "inspector" | "treasurer" | string;
  actorName: string;
  remark: string;
  occurredAt?: string | null;
};

export type SuperAdminWorkflowAuditPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

type SuperAdminWorkflowAuditResponse = {
  success: boolean;
  message: string;
  data: SuperAdminWorkflowAuditEvent[];
  pagination: SuperAdminWorkflowAuditPagination;
};

export type PermitTemplateMappingSource =
  | "system"
  | "field"
  | "fixed_value"
  | "auto_increment";
export type PermitTemplateMappingConfidence = "high" | "medium" | "low";
export type PermitTemplateAutoIncrementResetRule =
  | "no_reset"
  | "yearly"
  | "monthly";

export type PermitTemplateMapping = {
  placeholder: string;
  label: string;
  sourceType: PermitTemplateMappingSource;
  sourceKey: string;
  fixedValue?: string;
  latestAssignedValue?: string;
  autoIncrement?: {
    prefix?: string;
    suffix?: string;
    paddingLength: number;
    resetRule: PermitTemplateAutoIncrementResetRule;
  } | null;
  confidence: PermitTemplateMappingConfidence;
  needsReview: boolean;
};

export type PermitTemplate = {
  _id: string;
  templateScope?: "permit" | "inspection_certificate";
  name: string;
  linkedPermitId: string;
  linkedPermitName: string;
  fileName: string;
  mimeType: string;
  watermarkText: string;
  watermarkFontSizePt: number;
  status: "active" | "inactive";
  version: number;
  placeholders: string[];
  mappings: PermitTemplateMapping[];
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PermitTemplateMappingOption = {
  label: string;
  sourceType: PermitTemplateMappingSource;
  sourceKey: string;
};

type OfficerApiResponse = {
  success: boolean;
  data: OfficerType;
  message: string;
};

type DashboardApiResponse = {
  success: boolean;
  data: SuperAdminDashboardStats;
};

export const getSuperAdminDashboardStatsApi = async () => {
  const response = await axiosInstance.get("/super-admin/dashboard");
  return response.data as DashboardApiResponse;
};

export const getSuperAdminWorkflowAuditApi = async (params?: {
  page?: number;
  limit?: number;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Build query params explicitly so empty filters are omitted.
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.source) query.set("source", params.source);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/super-admin/audit/workflow${suffix ? `?${suffix}` : ""}`,
  );
  return response.data as SuperAdminWorkflowAuditResponse;
};

export const getAllOfficersApi = async (role?: string) => {
  // Role filter is optional; "ALL" intentionally maps to unfiltered endpoint.
  const queryParam =
    role && role !== "ALL" ? `?role=${role.toLowerCase()}` : "";
  const response = await axiosInstance.get(`/super-admin/officers${queryParam}`);
  return response.data;
};

export const createOfficerApi = async (data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender: string;
  email: string;
  password: string;
  role: string;
  departmentId?: string;
}) => {
  const response = await axiosInstance.post("/super-admin/officers", data);
  return response.data;
};

export const deleteOfficerApi = async (officerId: string) => {
  const response = await axiosInstance.delete(`/super-admin/officers/${officerId}`);
  return response.data;
};

export const getOfficerByIdApi = async (officerId: string) => {
  const response = await axiosInstance.get(`/super-admin/officers/${officerId}`);
  return response.data as OfficerApiResponse;
};

export const updateOfficerRoleApi = async (
  officerId: string,
  data: {
    role: string;
    departmentId?: string;
  },
) => {
  const response = await axiosInstance.patch(
    `/super-admin/officers/${officerId}`,
    data,
  );
  return response.data as OfficerApiResponse;
};

type PermitApiResponse = {
  success: boolean;
  data: PermitType;
  message: string;
};

type PermitsApiResponse = {
  success: boolean;
  data: PermitType[];
  message: string;
};

type PermitTemplatesApiResponse = {
  success: boolean;
  data: PermitTemplate[];
  message: string;
};

type PermitTemplateApiResponse = {
  success: boolean;
  data: PermitTemplate;
  message: string;
};

export const getAllPermitsApi = async () => {
  const response = await axiosInstance.get("/super-admin/permits");
  return response.data as PermitsApiResponse;
};

export const createPermitApi = async (data: {
  name: string;
  description?: string;
}) => {
  const response = await axiosInstance.post("/super-admin/permits", data);
  return response.data as PermitApiResponse;
};

export const getPermitByIdApi = async (permitId: string) => {
  const response = await axiosInstance.get(`/super-admin/permits/${permitId}`);
  return response.data as PermitApiResponse;
};

export const deletePermitApi = async (permitId: string) => {
  const response = await axiosInstance.delete(`/super-admin/permits/${permitId}`);
  return response.data as PermitApiResponse;
};

export const updatePermitValidityVisibilityApi = async (
  permitId: string,
  showInPermitValidity: boolean,
) => {
  const response = await axiosInstance.patch(
    `/super-admin/permits/${permitId}/validity-visibility`,
    { showInPermitValidity },
  );
  return response.data as PermitApiResponse;
};

export const updatePermitValiditySettingsApi = async (
  permitId: string,
  payload: {
    showInPermitValidity: boolean;
    enablePermitValidityFormDisplay: boolean;
    permitValidityDisplayFieldIds: string[];
  },
) => {
  const response = await axiosInstance.patch(
    `/super-admin/permits/${permitId}/validity-settings`,
    payload,
  );
  return response.data as PermitApiResponse;
};

export const savePermitFormApi = async (
  permitId: string,
  payload: {
    formTitle?: string;
    formDescription?: string;
    sections: PermitSection[];
    fields: PermitField[];
  },
) => {
  const response = await axiosInstance.put(
    `/super-admin/permits/${permitId}/form`,
    payload,
  );
  return response.data as PermitApiResponse;
};

type InspectionProcessApiResponse = {
  success: boolean;
  data: InspectionProcessType;
  message: string;
};

export const getInspectionProcessApi = async () => {
  const response = await axiosInstance.get("/super-admin/process");
  return response.data as InspectionProcessApiResponse;
};

export const saveInspectionProcessApi = async (
  departments: InspectionDepartmentType[],
) => {
  const response = await axiosInstance.put("/super-admin/process", {
    departments,
  });
  return response.data as InspectionProcessApiResponse;
};

export const getPermitTemplatesApi = async () => {
  const response = await axiosInstance.get("/super-admin/permit-templates");
  return response.data as PermitTemplatesApiResponse;
};

export const uploadPermitTemplateApi = async (payload: {
  permitId: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  watermarkText: string;
  watermarkFontSizePt: number;
}) => {
  const response = await axiosInstance.post(
    "/super-admin/permit-templates",
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const deletePermitTemplateApi = async (templateId: string) => {
  const response = await axiosInstance.delete(
    `/super-admin/permit-templates/${templateId}`,
  );
  return response.data as PermitTemplateApiResponse;
};

export const replacePermitTemplateFileApi = async (
  templateId: string,
  payload: {
    fileName: string;
    mimeType: string;
    contentBase64: string;
    watermarkText?: string;
    watermarkFontSizePt?: number;
  },
) => {
  const response = await axiosInstance.patch(
    `/super-admin/permit-templates/${templateId}/replace`,
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const updatePermitTemplateWatermarkApi = async (
  templateId: string,
  payload: {
    watermarkText: string;
    watermarkFontSizePt: number;
  },
) => {
  const response = await axiosInstance.patch(
    `/super-admin/permit-templates/${templateId}/watermark`,
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const updatePermitTemplateStatusApi = async (
  templateId: string,
  status: "active" | "inactive",
) => {
  const response = await axiosInstance.patch(
    `/super-admin/permit-templates/${templateId}/status`,
    { status },
  );
  return response.data as PermitTemplateApiResponse;
};

export const savePermitTemplateMappingsApi = async (
  templateId: string,
  payload: {
    mappings: PermitTemplateMapping[];
    watermarkText?: string;
    watermarkFontSizePt?: number;
  },
) => {
  const response = await axiosInstance.patch(
    `/super-admin/permit-templates/${templateId}/mappings`,
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const getPermitTemplateMappingOptionsApi = async (permitId: string) => {
  const response = await axiosInstance.get(
    `/super-admin/permit-templates/options?permitId=${encodeURIComponent(permitId)}`,
  );
  return response.data as {
    success: boolean;
    data: PermitTemplateMappingOption[];
    message: string;
  };
};





