import type { PermitFieldType } from "@/types/permit/permit.type";
import type { InspectionDepartmentType } from "@/types/process/process.type";

export type EvaluatorDecisionType =
  | "for_inspection"
  | "re_submission"
  | "for_admin_approval";

export type EvaluatorTableStatus = "for_review" | "re_submission";

export type EvaluatorInspectionReviewStepStatus =
  | "pending"
  | "scheduled"
  | "rescheduled"
  | "in_progress"
  | "for_reinspection"
  | "done";

export type EvaluatorInspectionReviewSummaryType = {
  statusLabel: string;
  completedDepartments: number;
  totalDepartments: number;
  hasReinspection: boolean;
  whereNow: string;
  isPaymentSettled: boolean;
  waitingForPayment: boolean;
  canSubmitForAdminApproval: boolean;
};

export type EvaluatorInspectionReviewStepType = {
  processId: string;
  processName: string;
  sequence: number;
  status: EvaluatorInspectionReviewStepStatus;
  isDone: boolean;
  hasReinspection: boolean;
  inspectionDate?: string | null;
  completedAt?: string | null;
  assignedInspectorName?: string;
  completionRemark?: string;
};

export type EvaluatorInspectionReviewDetailType = {
  evaluatorName: string;
  currentStage: string;
  statusLabel: string;
  completedDepartments: number;
  totalDepartments: number;
  hasReinspection: boolean;
  whereNow: string;
  isPaymentSettled: boolean;
  waitingForPayment: boolean;
  canSubmitForAdminApproval: boolean;
  steps: EvaluatorInspectionReviewStepType[];
};

export type EvaluatorApplicationListItemType = {
  _id: string;
  applicantName: string;
  permitType: string;
  tableStatus: EvaluatorTableStatus;
  submittedAt: string;
};

export type EvaluatorInspectionReviewListItemType = {
  _id: string;
  applicantName: string;
  permitType: string;
  submittedAt: string;
  inspectionReview: EvaluatorInspectionReviewSummaryType;
};

export type EvaluatorApplicationResponseType = {
  fieldId: string;
  label: string;
  type: PermitFieldType;
  value?: string | string[] | null;
  files?: Array<{
    name: string;
    mimeType: string;
    size: number;
    url: string;
  }>;
};

export type EvaluatorProcessDecisionType = {
  processId: string;
  processName: string;
  sequence: number;
  notRequired: boolean;
};

export type EvaluatorApplicationDetailType = {
  _id: string;
  applicantName: string;
  permitType: string;
  permitName: string;
  formTitle: string;
  permit?: {
    name: string;
    sections: Array<{
      id: string;
      title: string;
      layout: "one_column" | "two_column";
    }>;
    fields: Array<{
      id: string;
      type: PermitFieldType;
      label: string;
      placeholder?: string;
      required: boolean;
      options?: string[];
      sectionId?: string;
    }>;
  };
  responses: EvaluatorApplicationResponseType[];
  tableStatus: EvaluatorTableStatus;
  evaluatorResult?: {
    decision: EvaluatorDecisionType;
    processDecisions: EvaluatorProcessDecisionType[];
    remark?: string;
    decidedAt: string;
  };
  inspectionReview?: EvaluatorInspectionReviewDetailType;
  businessRegistrationHistory?: {
    businessName: string;
    normalizedBusinessName: string;
    totalApplicationsForApplicantAndBusiness: number;
    attemptCount: number;
    successfulCount: number;
    approvedCount: number;
    deniedFinalCount: number;
    deniedCount: number;
    reSubmissionCount: number;
    lastApprovedAt?: string | null;
    recentApplications: Array<{
      applicationId: string;
      permitType: string;
      tableStatus: EvaluatorTableStatus;
      currentStage: string;
      evaluatorDecision: string;
      adminDecision: string;
      submittedAt?: string | null;
      isCurrent: boolean;
    }>;
  } | null;
  submittedAt: string;
};

export type EvaluatorInspectionProcessType = {
  _id: string;
  key: "inspection_process";
  name: string;
  departments: InspectionDepartmentType[];
};

export type EvaluatorDashboardQueueItemType = {
  departmentId: string;
  departmentName: string;
  queue: number;
  overdueQueue: number;
  averageQueueAgeDays: number | null;
  oldestQueueAgeDays: number | null;
};

export type EvaluatorDashboardType = {
  applicationRequests: number;
  ongoingInspections: number;
  completeInspections: number;
  departmentInspectionQueue: EvaluatorDashboardQueueItemType[];
  requestBreakdown: {
    forReview: number;
    reSubmission: number;
  };
  inspectionBreakdown: {
    waitingInspectionRouting: number;
    underDepartmentInspection: number;
    waitingForPayment: number;
    readyForEvaluatorSubmission: number;
    forAdminApproval: number;
    forReinspection: number;
  };
  analytics: {
    totalInspectionFlow: number;
    totalQueueItems: number;
    overdueQueueItems: number;
    departmentsInQueue: number;
    departmentsWithOverdueQueue: number;
    configuredDepartments: number;
    busiestDepartment: EvaluatorDashboardQueueItemType | null;
    oldestQueueAgeDays: number | null;
    averageQueueAgeDays: number | null;
    queueHealth: "clear" | "stable" | "attention";
    workflowPressure: "light" | "moderate" | "heavy";
  };
  generatedAt: string;
};

export type EvaluatorWorkflowAuditEventType = {
  _id: string;
  applicationId: string;
  permitName: string;
  applicantName: string;
  statusCode: string;
  source: "evaluator" | string;
  actorName: string;
  remark: string;
  inspectionInspectorName?: string;
  inspectionDepartmentName?: string;
  approvalDate?: string | null;
  occurredAt?: string | null;
};

export type EvaluatorWorkflowAuditPaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
