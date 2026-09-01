import axiosInstance from "@/axios/axios-instance";
import type {
  BploAdminFeeAssessmentPermitType,
  BploAdminPermitPaymentPayersType,
  BploAdminFeeAssessmentTemplateType,
  BploAdminPermitPaymentAnalyticsType,
  BploDashboardAnalyticsType,
  BploInspectionDecisionType,
  BploPermitDecisionType,
  BploPermitReleaseApplicationType,
  BploPermitValidityApplicationType,
  BploRoutedApplicationDetailType,
  BploRoutedApplicationType,
  BploWorkflowAuditEventType,
  BploWorkflowAuditPaginationType,
} from "@/types/bplo_admin/bplo_admin.type";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BploWorkflowAuditResponse = {
  success: boolean;
  message: string;
  data: BploWorkflowAuditEventType[];
  permits?: string[];
  pagination: BploWorkflowAuditPaginationType;
};

export const getBploDashboardAnalyticsApi = async () => {
  const response = await axiosInstance.get("/bplo-admin/dashboard");
  return response.data as ApiResponse<BploDashboardAnalyticsType>;
};

export const getBploWorkflowAuditApi = async (params?: {
  page?: number;
  limit?: number;
  permit?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Build query params explicitly so empty filters are omitted from the URL.
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.permit) query.set("permit", params.permit);
  if (params?.source) query.set("source", params.source);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/bplo-admin/audit/workflow${suffix ? `?${suffix}` : ""}`,
  );
  return response.data as BploWorkflowAuditResponse;
};

export const downloadBploWorkflowAuditPdfApi = async (params?: {
  permit?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Uses the same filter contract as table view to export a matching PDF snapshot.
  const query = new URLSearchParams();
  if (params?.permit) query.set("permit", params.permit);
  if (params?.source) query.set("source", params.source);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/bplo-admin/audit/workflow/download-pdf${suffix ? `?${suffix}` : ""}`,
    {
      responseType: "blob",
    },
  );

  return response.data as Blob;
};

export const getInspectionRequestApplicationsApi = async () => {
  const response = await axiosInstance.get("/bplo-admin/inspection-request");
  return response.data as ApiResponse<BploRoutedApplicationType[]>;
};

export const getPermitApprovalApplicationsApi = async () => {
  const response = await axiosInstance.get("/bplo-admin/permit-approval");
  return response.data as ApiResponse<BploRoutedApplicationType[]>;
};

export const getPermitReleaseApplicationsApi = async () => {
  const response = await axiosInstance.get("/bplo-admin/permit-release");
  return response.data as ApiResponse<BploPermitReleaseApplicationType[]>;
};

export const getRoutedApplicationByIdApi = async (applicationId: string) => {
  // Detail payload can be large (responses/files/assessments), so allow longer timeout.
  const response = await axiosInstance.get(
    `/bplo-admin/${applicationId}/details`,
    {
      timeout: 60000,
    },
  );
  return response.data as ApiResponse<BploRoutedApplicationDetailType>;
};

export const savePermitApprovalDecisionApi = async (
  applicationId: string,
  payload: {
    decision: BploPermitDecisionType;
    remark?: string;
  },
) => {
  const response = await axiosInstance.put(
    `/bplo-admin/${applicationId}/decision`,
    payload,
  );
  return response.data as ApiResponse<BploRoutedApplicationDetailType>;
};

export const saveInspectionRequestDecisionApi = async (
  applicationId: string,
  payload: {
    decision: BploInspectionDecisionType;
    remark?: string;
  },
) => {
  const response = await axiosInstance.put(
    `/bplo-admin/${applicationId}/inspection-decision`,
    payload,
  );
  return response.data as ApiResponse<BploRoutedApplicationDetailType>;
};

export const upsertAdminFeeAssessmentApi = async (
  applicationId: string,
  payload: {
    items: Array<{ feeName: string; amount: number }>;
  },
) => {
  const response = await axiosInstance.put(
    `/bplo-admin/${applicationId}/admin-fee-assessment`,
    payload,
  );
  return response.data as ApiResponse<BploRoutedApplicationDetailType>;
};

export const getBploAdminPermitPaymentAnalyticsApi = async () => {
  const response = await axiosInstance.get("/bplo-admin/payment-analytics");
  return response.data as ApiResponse<BploAdminPermitPaymentAnalyticsType[]>;
};

export const getBploAdminPermitPaymentPayersApi = async (permitId: string) => {
  const response = await axiosInstance.get(
    `/bplo-admin/payment-analytics/${permitId}/payers`,
  );
  return response.data as ApiResponse<BploAdminPermitPaymentPayersType>;
};
export const getBploAdminFeeAssessmentPermitsApi = async () => {
  const response = await axiosInstance.get("/bplo-admin/fee-assessment/permits");
  return response.data as ApiResponse<BploAdminFeeAssessmentPermitType[]>;
};

export const getBploAdminFeeAssessmentTemplateApi = async (permitId: string) => {
  const response = await axiosInstance.get(
    `/bplo-admin/fee-assessment/${permitId}/template`,
  );
  return response.data as ApiResponse<BploAdminFeeAssessmentTemplateType>;
};

export const saveBploAdminFeeAssessmentTemplateApi = async (
  permitId: string,
  payload: {
    items: Array<{ feeName: string; amount: number }>;
  },
) => {
  const response = await axiosInstance.put(
    `/bplo-admin/fee-assessment/${permitId}/template`,
    payload,
  );
  return response.data as ApiResponse<BploAdminFeeAssessmentTemplateType>;
};

export const getPermitValidityApplicationsApi = async () => {
  const response = await axiosInstance.get(
    "/bplo-admin/permit-validity",
    {
      timeout: 60000,
    },
  );
  return response.data as ApiResponse<BploPermitValidityApplicationType[]>;
};

export const generatePermitDocumentApi = async (applicationId: string) => {
  // Generation is server-side PDF rendering; timeout is intentionally higher.
  const response = await axiosInstance.post(
    `/bplo-admin/${applicationId}/permit-document/generate`,
    undefined,
    {
      timeout: 180000,
    },
  );
  return response.data as ApiResponse<
    NonNullable<BploRoutedApplicationDetailType["generatedPermit"]>
  >;
};

export const getGeneratedPermitDocumentApi = async (applicationId: string) => {
  const response = await axiosInstance.get(
    `/bplo-admin/${applicationId}/permit-document`,
  );
  return response.data as ApiResponse<
    NonNullable<BploRoutedApplicationDetailType["generatedPermit"]>
  >;
};

export const sendGeneratedPermitToApplicantApi = async (applicationId: string) => {
  const response = await axiosInstance.post(
    `/bplo-admin/${applicationId}/permit-document/send`,
  );
  return response.data as ApiResponse<
    NonNullable<BploRoutedApplicationDetailType["generatedPermit"]>
  >;
};

