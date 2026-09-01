import axiosInstance from "@/axios/axios-instance";
import type {
  DepartmentFeeAssessmentTemplateType,
  DepartmentPayerType,
  DepartmentTreasurerWorkflowAuditEventType,
  DepartmentTreasurerWorkflowAuditPaginationType,
  MainTreasurerWorkflowAuditEventType,
  MainTreasurerWorkflowAuditPaginationType,
  MainTreasurerPaymentType,
  TreasurerDashboardType,
} from "@/types/treasurer/treasurer.type";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
type DepartmentTreasurerWorkflowAuditResponse = {
  success: boolean;
  message: string;
  data: DepartmentTreasurerWorkflowAuditEventType[];
  permits?: string[];
  pagination: DepartmentTreasurerWorkflowAuditPaginationType;
};

type MainTreasurerWorkflowAuditResponse = {
  success: boolean;
  message: string;
  data: MainTreasurerWorkflowAuditEventType[];
  permits?: string[];
  pagination: MainTreasurerWorkflowAuditPaginationType;
};

export const getDepartmentTreasurerDashboardApi = async () => {
  const response = await axiosInstance.get("/department-treasurer/dashboard");
  return response.data as ApiResponse<TreasurerDashboardType>;
};

export const getDepartmentTreasurerPayersApi = async (
  paymentStatus?: "pending" | "paid",
) => {
  const response = await axiosInstance.get("/department-treasurer/payers", {
    params: paymentStatus ? { paymentStatus } : undefined,
  });
  return response.data as ApiResponse<DepartmentPayerType[]>;
};

export const getDepartmentFeeAssessmentTemplateApi = async () => {
  const response = await axiosInstance.get(
    "/department-treasurer/fee-assessment",
  );
  return response.data as ApiResponse<DepartmentFeeAssessmentTemplateType>;
};

export const saveDepartmentFeeAssessmentTemplateApi = async (payload: {
  items: Array<{ feeName: string; amount: number }>;
}) => {
  const response = await axiosInstance.put(
    "/department-treasurer/fee-assessment",
    payload,
  );
  return response.data as ApiResponse<DepartmentFeeAssessmentTemplateType>;
};

export const getMainTreasurerDashboardApi = async () => {
  const response = await axiosInstance.get("/main-treasurer/dashboard");
  return response.data as ApiResponse<TreasurerDashboardType>;
};

export const getMainTreasurerPaymentsApi = async () => {
  const response = await axiosInstance.get("/main-treasurer/payments");
  return response.data as ApiResponse<MainTreasurerPaymentType[]>;
};

export const getMainTreasurerWorkflowAuditApi = async (params?: {
  page?: number;
  limit?: number;
  permit?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Build query params explicitly so empty filters are not sent to backend.
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
    `/main-treasurer/audit/workflow${suffix ? `?${suffix}` : ""}`,
  );
  return response.data as MainTreasurerWorkflowAuditResponse;
};

export const downloadMainTreasurerWorkflowAuditPdfApi = async (params?: {
  permit?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Uses the same filter contract as audit table to export matching records.
  const query = new URLSearchParams();
  if (params?.permit) query.set("permit", params.permit);
  if (params?.source) query.set("source", params.source);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/main-treasurer/audit/workflow/download-pdf${suffix ? `?${suffix}` : ""}`,
    {
      responseType: "blob",
    },
  );

  return response.data as Blob;
};

export const confirmMainTreasurerPaymentReceiptApi = async (
  applicationId: string,
  payload: {
    qrValue: string;
    amountReceived: number;
  },
) => {
  // Server validates QR payload and records receipt confirmation atomically.
  const response = await axiosInstance.post(
    `/main-treasurer/payments/${applicationId}/confirm`,
    payload,
  );
  return response.data;
};

export const updateMainTreasurerPaymentStatusApi = async (
  applicationId: string,
  departmentId: string,
  paymentStatus: "pending" | "paid",
) => {
  const response = await axiosInstance.patch(
    `/main-treasurer/payments/${applicationId}/${departmentId}/status`,
    { paymentStatus },
  );
  return response.data;
};

export const updateMainTreasurerPaymentStatusBatchApi = async (
  applicationId: string,
  payload: {
    paymentStatus: "pending" | "paid";
    departmentIds: string[];
  },
) => {
  const response = await axiosInstance.patch(
    `/main-treasurer/payments/${applicationId}/status/batch`,
    payload,
  );
  return response.data;
};

export const getDepartmentTreasurerWorkflowAuditApi = async (params?: {
  page?: number;
  limit?: number;
  permit?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Build query params explicitly so empty filters are omitted.
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
    `/department-treasurer/audit/workflow${suffix ? `?${suffix}` : ""}`,
  );
  return response.data as DepartmentTreasurerWorkflowAuditResponse;
};

export const downloadDepartmentTreasurerWorkflowAuditPdfApi = async (params?: {
  permit?: string;
  source?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Mirrors table filters so exported PDF matches current audit view.
  const query = new URLSearchParams();
  if (params?.permit) query.set("permit", params.permit);
  if (params?.source) query.set("source", params.source);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/department-treasurer/audit/workflow/download-pdf${suffix ? `?${suffix}` : ""}`,
    {
      responseType: "blob",
    },
  );

  return response.data as Blob;
};

