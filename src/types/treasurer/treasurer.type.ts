export type DepartmentFeeAssessmentItemType = {
  feeName: string;
  amount: number;
};

export type DepartmentFeeAssessmentTemplateType = {
  _id?: string;
  departmentId: string;
  departmentName: string;
  items: DepartmentFeeAssessmentItemType[];
  totalAmount: number;
  updatedAt?: string;
};

export type TreasurerDashboardType = {
  totalAssessments: number;
  totalPending: number;
  totalPaid: number;
  totalAmountDue: number;
};

export type DepartmentPayerType = {
  _id: string;
  applicantName: string;
  applicantEmail: string;
  permitType: string;
  departmentId: string;
  departmentName: string;
  generatedAt?: string | null;
  paymentStatus: "pending" | "paid";
  totalAmount: number;
};

export type MainTreasurerPaymentType = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  permitType: string;
  departmentId: string;
  departmentName: string;
  generatedAt?: string | null;
  totalAmount: number;
  paymentStatus: "pending" | "paid";
  statusUpdatedAt?: string | null;
  statusUpdatedByName?: string;
  combinedQrValue?: string;
};

export type DepartmentTreasurerWorkflowAuditEventType = {
  _id: string;
  applicationId: string;
  permitName: string;
  applicantName: string;
  statusCode: string;
  source: "system" | "treasurer" | string;
  actorName: string;
  remark: string;
  totalAmountToSettle: number;
  amountPaid: number;
  occurredAt?: string | null;
};

export type DepartmentTreasurerWorkflowAuditPaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type MainTreasurerWorkflowAuditEventType = {
  _id: string;
  applicationId: string;
  permitName: string;
  applicantName: string;
  statusCode: string;
  source: "system" | "treasurer" | string;
  actorName: string;
  remark: string;
  totalAmountToSettle: number;
  amountPaid: number;
  paymentBreakdown?: Array<{
    departmentName: string;
    amount: number;
    paymentStatus: "pending" | "paid";
  }>;
  occurredAt?: string | null;
};

export type MainTreasurerWorkflowAuditPaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
