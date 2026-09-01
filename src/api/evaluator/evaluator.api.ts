import axiosInstance from "@/axios/axios-instance";
import type {
  EvaluatorApplicationDetailType,
  EvaluatorApplicationListItemType,
  EvaluatorDashboardType,
  EvaluatorDecisionType,
  EvaluatorInspectionProcessType,
  EvaluatorInspectionReviewListItemType,
  EvaluatorWorkflowAuditEventType,
  EvaluatorWorkflowAuditPaginationType,
} from "@/types/evaluator/evaluator.type";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type EvaluatorWorkflowAuditResponse = {
  success: boolean;
  message: string;
  data: EvaluatorWorkflowAuditEventType[];
  permits?: string[];
  pagination: EvaluatorWorkflowAuditPaginationType;
};

export const getEvaluatorApplicationsApi = async () => {
  const response = await axiosInstance.get("/evaluator/applications");
  return response.data as ApiResponse<EvaluatorApplicationListItemType[]>;
};

export const getEvaluatorDashboardApi = async () => {
  const response = await axiosInstance.get("/evaluator/dashboard");
  return response.data as ApiResponse<EvaluatorDashboardType>;
};

export const getEvaluatorWorkflowAuditApi = async (params?: {
  page?: number;
  limit?: number;
  permit?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  // Build query params explicitly so empty filters are omitted from the request URL.
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.permit) query.set("permit", params.permit);
  if (params?.search) query.set("search", params.search);
  if (params?.dateFrom) query.set("dateFrom", params.dateFrom);
  if (params?.dateTo) query.set("dateTo", params.dateTo);

  const suffix = query.toString();
  const response = await axiosInstance.get(
    `/evaluator/audit/workflow${suffix ? `?${suffix}` : ""}`,
  );
  return response.data as EvaluatorWorkflowAuditResponse;
};

export const getEvaluatorInspectionReviewApplicationsApi = async () => {
  const response = await axiosInstance.get("/evaluator/inspections");
  return response.data as ApiResponse<EvaluatorInspectionReviewListItemType[]>;
};

export const getEvaluatorApplicationByIdApi = async (applicationId: string) => {
  const response = await axiosInstance.get(
    `/evaluator/applications/${applicationId}`,
  );
  return response.data as ApiResponse<EvaluatorApplicationDetailType>;
};

export const getEvaluatorInspectionReviewByIdApi = async (
  applicationId: string,
) => {
  const response = await axiosInstance.get(`/evaluator/inspections/${applicationId}`);
  return response.data as ApiResponse<EvaluatorApplicationDetailType>;
};

export const submitEvaluatorInspectionReviewApi = async (
  applicationId: string,
) => {
  const response = await axiosInstance.put(
    `/evaluator/inspections/${applicationId}/submit`,
  );
  return response.data as ApiResponse<EvaluatorApplicationDetailType>;
};

export const getEvaluatorInspectionProcessApi = async () => {
  const response = await axiosInstance.get("/evaluator/process");
  return response.data as ApiResponse<EvaluatorInspectionProcessType>;
};

export const saveEvaluatorDecisionApi = async (
  applicationId: string,
  payload: {
    decision: EvaluatorDecisionType;
    notRequiredProcessIds: string[];
    remark?: string;
  },
) => {
  // `notRequiredProcessIds` is consumed only for `for_inspection` decisions.
  const response = await axiosInstance.put(
    `/evaluator/applications/${applicationId}/evaluation`,
    payload,
  );
  return response.data as ApiResponse<EvaluatorApplicationDetailType>;
};
