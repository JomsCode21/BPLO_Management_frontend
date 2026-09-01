export type BploRoutedApplicationDecisionType =
  | "for_inspection"
  | "for_admin_approval";

export type BploPermitDecisionType = "approved" | "denied";
export type BploInspectionDecisionType = "approved" | "pending" | "denied";

export type BploRoutedApplicationType = {
  _id: string;
  applicantName: string;
  permitType: string;
  decision: BploRoutedApplicationDecisionType;
  tableStatus:
    | "for_inspection"
    | "for_admin_approval"
    | "approved"
    | "pending"
    | "denied";
  paymentStatus?: "paid" | "pending";
  evaluatorRemark: string;
  decidedAt?: string | null;
  submittedAt: string;
};

export type BploPermitReleaseApplicationType = {
  _id: string;
  applicantName: string;
  permitType: string;
  approvedAt?: string | null;
  generatedAt?: string | null;
  sentToApplicantAt?: string | null;
  releaseStatus: "for_release" | "sent_to_applicant";
  submittedAt: string;
};

export type BploRoutedApplicationDetailType = {
  _id: string;
  applicantName: string;
  permitType: string;
  permitName: string;
  formTitle: string;
  permit?: {
    name: string;
    enablePermitValidityFormDisplay?: boolean;
    permitValidityDisplayFieldIds?: string[];
    sections: Array<{
      id: string;
      title: string;
      layout: "one_column" | "two_column";
    }>;
    fields: Array<{
      id: string;
      type:
        | "text"
        | "textarea"
        | "select"
        | "checkbox"
        | "radio"
        | "date"
        | "file";
      label: string;
      required: boolean;
      options?: string[];
      sectionId?: string;
    }>;
  };
  responses: Array<{
    fieldId: string;
    label: string;
    type:
      | "text"
      | "textarea"
      | "select"
      | "checkbox"
      | "radio"
      | "date"
      | "file";
    value?: string | string[] | null;
    files?: Array<{
      name: string;
      mimeType: string;
      size: number;
      url: string;
    }>;
  }>;
  evaluatorResult?: {
    decision: BploRoutedApplicationDecisionType | "re_submission";
    remark?: string;
    decidedAt: string;
  };
  adminResult?: {
    decision: BploPermitDecisionType;
    remark?: string;
    decidedAt: string;
  };
  inspectionAdminResult?: {
    decision: BploInspectionDecisionType;
    remark?: string;
    decidedAt: string;
  };
  inspectionFlow?: {
    currentStepIndex: number;
    steps: Array<{
      processId: string;
      processName: string;
      sequence: number;
      assignedInspector?: string | null;
      assignedInspectorName?: string;
      assignedAt?: string | null;
      scheduledInspectionAt?: string | null;
      completedAt?: string | null;
      completionRemark?: string;
    }>;
  };
  paymentAssessments?: Array<{
    departmentId: string;
    departmentName: string;
    generatedAt?: string | null;
    totalAmount: number;
    paymentStatus: "pending" | "paid";
    items: Array<{
      feeName: string;
      amount: number;
    }>;
    statusUpdatedAt?: string | null;
    statusUpdatedByName?: string;
  }>;
  generatedPermit?: {
    templateId: string;
    templateName: string;
    templateVersion: number;
    placeholders: string[];
    resolvedValues: Record<string, string>;
    generatedPreview: string;
    status: "generated" | "confirmed";
    confirmedAt?: string | null;
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
  } | null;
  submittedAt: string;
};

export type BploPermitValidityApplicationType = {
  _id: string;
  applicantName: string;
  permitType: string;
  status: "active" | "for_renewal" | "inactive" | "delinquent";
  currentYearApplicationId?: string | null;
  permitYear?: number;
  validFrom?: string | null;
  validUntil?: string | null;
  approvedAt?: string | null;
  submittedAt: string;
  displayedFields?: Array<{
    fieldId: string;
    label: string;
    value: string;
  }>;
};

export type BploDashboardAnalyticsType = {
  summary: {
    validityRecords: number;
    pendingInspectionRequests: number;
    permitApprovalQueue: number;
    totalQueueItems: number;
    permitTypesInView: number;
  };
  validityStatusBreakdown: Array<{
    key: BploPermitValidityApplicationType["status"];
    label: string;
    count: number;
  }>;
  permitTypeBreakdown: Array<{
    permitType: string;
    count: number;
  }>;
  queueBreakdown: Array<{
    key: "inspection_requests" | "permit_approval";
    label: string;
    count: number;
  }>;
  insights: {
    dominantValidityStatus: BploPermitValidityApplicationType["status"] | null;
    leadingPermitType: string | null;
  };
  generatedAt: string;
};

export type BploAdminFeeAssessmentPermitType = {
  permitId: string;
  permitName: string;
};

export type BploAdminPermitPaymentAnalyticsType = {
  permitId: string;
  permitName: string;
  totalCollectedAmount: number;
  paidAssessmentCount: number;
};

export type BploAdminPermitPaymentPayerType = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  paidAmount: number;
  paidAt?: string | null;
  statusUpdatedByName?: string;
};

export type BploAdminPermitPaymentPayersType = {
  permitId: string;
  permitName: string;
  totalCollectedAmount: number;
  paidAssessmentCount: number;
  payers: BploAdminPermitPaymentPayerType[];
};
export type BploAdminFeeAssessmentTemplateType = {
  permitId: string;
  permitName: string;
  items: Array<{
    feeName: string;
    amount: number;
  }>;
  totalAmount: number;
};

export type BploWorkflowAuditEventType = {
  _id: string;
  applicationId: string;
  permitName: string;
  applicantName: string;
  applicantEmail?: string;
  statusCode: string;
  source: "system" | "evaluator" | "bplo_admin" | "inspector" | string;
  actorName: string;
  remark: string;
  totalAmountToSettle: number;
  amountPaid: number;
  occurredAt?: string | null;
};

export type BploWorkflowAuditPaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

