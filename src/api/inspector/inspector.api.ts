import axiosInstance from "@/axios/axios-instance";
import type { PermitType } from "@/types/permit/permit.type";
import type {
  InspectorDashboardType,
  InspectorWorkflowAuditEventType,
  InspectorWorkflowAuditPaginationType,
  InspectorInspectionAssessmentType,
  InspectorInspectionRequestDetailType,
  InspectorPermitReleaseApplicationType,
  InspectorInspectionScheduleType,
  InspectorInspectionRequestType,
} from "@/types/inspector/inspector.type";
import type {
  PermitTemplate,
  PermitTemplateMapping,
  PermitTemplateMappingOption,
  PermitTemplateMappingSource,
} from "@/api/super_admin/super_admin.api";
export type {
  PermitTemplate,
  PermitTemplateMapping,
  PermitTemplateMappingOption,
  PermitTemplateMappingSource,
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type InspectorWorkflowAuditResponse = {
  success: boolean;
  message: string;
  data: InspectorWorkflowAuditEventType[];
  permits?: string[];
  pagination: InspectorWorkflowAuditPaginationType;
};

export const getInspectorInspectionRequestsApi = async () => {
  const response = await axiosInstance.get("/inspector/inspection-requests");
  return response.data as ApiResponse<InspectorInspectionRequestType[]>;
};

export const getInspectorWorkflowAuditApi = async (params?: {
  page?: number;
  limit?: number;
  permit?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Build query params explicitly so empty filters are not sent to backend.
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.permit) query.set("permit", params.permit);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/inspector/audit/workflow${suffix ? `?${suffix}` : ""}`,
  );
  return response.data as InspectorWorkflowAuditResponse;
};

export const downloadInspectorWorkflowAuditPdfApi = async (params?: {
  permit?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Mirrors audit table filters to export a consistent PDF snapshot.
  const query = new URLSearchParams();
  if (params?.permit) query.set("permit", params.permit);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/inspector/audit/workflow/download-pdf${suffix ? `?${suffix}` : ""}`,
    {
      responseType: "blob",
    },
  );

  return response.data as Blob;
};

export const getInspectorDashboardApi = async () => {
  const response = await axiosInstance.get("/inspector/dashboard");
  return response.data as ApiResponse<InspectorDashboardType>;
};

export const getInspectorInspectionRequestByIdApi = async (
  applicationId: string,
) => {
  const response = await axiosInstance.get(
    `/inspector/inspection-requests/${applicationId}/details`,
  );
  return response.data as ApiResponse<InspectorInspectionRequestDetailType>;
};

export const completeInspectorInspectionRequestApi = async (
  applicationId: string,
  payload: { result: "passed" | "for_completion" | "failed"; remark?: string },
) => {
  const response = await axiosInstance.put(
    `/inspector/inspection-requests/${applicationId}/complete`,
    payload,
  );
  return response.data as ApiResponse<InspectorInspectionRequestDetailType>;
};

export const setInspectorInspectionScheduleApi = async (
  applicationId: string,
  payload: { inspectionAt: string },
) => {
  const response = await axiosInstance.put(
    `/inspector/inspection-requests/${applicationId}/schedule`,
    payload,
  );
  return response.data as ApiResponse<InspectorInspectionRequestDetailType>;
};

export const updateInspectorInspectionScheduleApi = async (
  applicationId: string,
  payload: { inspectionAt: string; remark: string },
) => {
  const response = await axiosInstance.patch(
    `/inspector/inspection-requests/${applicationId}/schedule`,
    payload,
  );
  return response.data as ApiResponse<InspectorInspectionRequestDetailType>;
};

export const getInspectorInspectionSchedulesApi = async () => {
  const response = await axiosInstance.get("/inspector/schedules");
  return response.data as ApiResponse<InspectorInspectionScheduleType[]>;
};

export const getInspectorPermitReleaseApplicationsApi = async () => {
  const response = await axiosInstance.get("/inspector/permit-release");
  return response.data as ApiResponse<InspectorPermitReleaseApplicationType[]>;
};

export const getInspectorInspectionAssessmentsApi = async () => {
  const response = await axiosInstance.get("/inspector/schedules");
  return response.data as ApiResponse<InspectorInspectionAssessmentType[]>;
};

export type GeneratedInspectionCertificateType = {
  templateName: string;
  templateVersion: number;
  generatedPreview: string;
  status: "generated" | "confirmed";
  sentToApplicantAt?: string | null;
  file: {
    fileName: string;
    mimeType: string;
    contentBase64: string;
    generatedAt: string;
    watermarkText?: string;
    watermarkFontSizePt?: number;
    pdf?: {
      mimeType: string;
      clearContentBase64: string;
      watermarkedContentBase64: string;
      generatedAt: string;
    } | null;
    pageSizeMm?: {
      width: number;
      height: number;
    } | null;
  };
};

export const generateInspectorInspectionCertificateApi = async (
  applicationId: string,
) => {
  // Certificate generation performs server-side document rendering.
  const response = await axiosInstance.post(
    `/inspector/inspection-requests/${applicationId}/certificate/generate`,
    undefined,
    { timeout: 180000 },
  );
  return response.data as ApiResponse<GeneratedInspectionCertificateType>;
};

export const getInspectorGeneratedInspectionCertificateApi = async (
  applicationId: string,
) => {
  const response = await axiosInstance.get(
    `/inspector/inspection-requests/${applicationId}/certificate`,
  );
  return response.data as ApiResponse<GeneratedInspectionCertificateType>;
};

type PermitTemplatesApiResponse = ApiResponse<PermitTemplate[]>;
type PermitTemplateApiResponse = ApiResponse<PermitTemplate>;
type PermitsApiResponse = ApiResponse<PermitType[]>;

export const getInspectorCertificatePermitsApi = async () => {
  const response = await axiosInstance.get("/inspector/certificate-permits");
  return response.data as PermitsApiResponse;
};

export const getInspectorCertificateTemplatesApi = async () => {
  const response = await axiosInstance.get("/inspector/certificate-templates");
  return response.data as PermitTemplatesApiResponse;
};

export const uploadInspectorCertificateTemplateApi = async (payload: {
  permitId: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  watermarkText: string;
  watermarkFontSizePt: number;
}) => {
  const response = await axiosInstance.post(
    "/inspector/certificate-templates",
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const deleteInspectorCertificateTemplateApi = async (templateId: string) => {
  const response = await axiosInstance.delete(
    `/inspector/certificate-templates/${templateId}`,
  );
  return response.data as PermitTemplateApiResponse;
};

export const replaceInspectorCertificateTemplateFileApi = async (
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
    `/inspector/certificate-templates/${templateId}/replace`,
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const updateInspectorCertificateTemplateStatusApi = async (
  templateId: string,
  status: "active" | "inactive",
) => {
  const response = await axiosInstance.patch(
    `/inspector/certificate-templates/${templateId}/status`,
    { status },
  );
  return response.data as PermitTemplateApiResponse;
};

export const saveInspectorCertificateTemplateMappingsApi = async (
  templateId: string,
  payload: {
    mappings: PermitTemplateMapping[];
    watermarkText?: string;
    watermarkFontSizePt?: number;
  },
) => {
  const response = await axiosInstance.patch(
    `/inspector/certificate-templates/${templateId}/mappings`,
    payload,
  );
  return response.data as PermitTemplateApiResponse;
};

export const getInspectorCertificateTemplateMappingOptionsApi = async (
  permitId: string,
) => {
  const response = await axiosInstance.get(
    `/inspector/certificate-templates/options?permitId=${encodeURIComponent(permitId)}`,
  );
  return response.data as ApiResponse<PermitTemplateMappingOption[]>;
};
