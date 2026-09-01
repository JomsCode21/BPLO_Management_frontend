export type OwnerApplicationStatusCode =
  | "submitted"
  | "for_inspection"
  | "inspection_pending"
  | "inspection_approved"
  | "inspection_scheduled"
  | "inspection_rescheduled"
  | "inspection_denied"
  | "inspection_passed"
  | "inspection_for_completion"
  | "inspection_failed"
  | "for_admin_approval"
  | "payment_breakdown"
  | "payment_pending"
  | "payment_paid"
  | "payment_confirmed"
  | "re_submission"
  | "approved"
  | "failed";

export type OwnerApplicationStatusSource =
  | "system"
  | "evaluator"
  | "bplo_admin"
  | "inspector"
  | "treasurer";

export type OwnerNotificationScope =
  | "application"
  | "inspection"
  | "payment";

export type OwnerGeneratedDocumentKind =
  | "permit"
  | "inspection_certificate";

export type OwnerApplicationStatusType = {
  _id: string;
  applicationRefId?: string;
  permitId: string;
  permitType: string;
  status: OwnerApplicationStatusCode;
  statusSource?: OwnerApplicationStatusSource;
  canResubmit?: boolean;
  canRequestReassessment?: boolean;
  reassessmentRequestedAt?: string | null;
  evaluatorRemark: string;
  adminDecision?: "approved" | "denied";
  adminRemark?: string;
  submittedAt: string;
  updatedAt?: string;
  decidedAt?: string | null;
  readAt?: string | null;
  unreadCount?: number;
  isRead?: boolean;
};

export type OwnerApplicationResponseType = {
  fieldId: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "file";
  value?: string | string[] | null;
  files?: Array<{
    name: string;
    mimeType: string;
    size: number;
    url: string;
  }>;
};

export type OwnerApplicationDetailType = {
  _id: string;
  permitId: string;
  tableStatus: "for_review" | "re_submission";
  evaluatorRemark: string;
  responses: OwnerApplicationResponseType[];
};

export type OwnerApplicationStatusDetailType = {
  _id: string;
  applicationRefId?: string;
  permitId: string;
  permitType: string;
  status: OwnerApplicationStatusCode;
  remark: string;
  decidedAt?: string | null;
  canRequestReassessment?: boolean;
  reassessmentRequestedAt?: string | null;
  combinedPaymentQrValue?: string;
  paymentAssessments?: Array<{
    departmentId: string;
    departmentName: string;
    generatedAt?: string | null;
    totalAmount: number;
    paymentStatus: "pending" | "paid" | string;
    statusUpdatedAt?: string | null;
    statusUpdatedByName?: string;
    paymentReference?: string;
    qrValue?: string;
    items: Array<{
      feeName: string;
      amount: number;
    }>;
  }>;
  inspectionUpdates?: Array<{
    processId: string;
    processName: string;
    sequence: number;
    assignedInspectorName?: string;
    assignedAt?: string | null;
    scheduledInspectionAt?: string | null;
    scheduleRemark?: string;
    completedAt?: string | null;
    stage:
      | "queued"
      | "current"
      | "scheduled"
      | "rescheduled"
      | "completed";
    feedback?: string;
  }>;
  generatedPermit?: OwnerGeneratedDocumentMetadataType | null;
  generatedInspectionCertificate?: OwnerGeneratedDocumentMetadataType | null;
};

export type OwnerGeneratedDocumentMetadataType = {
  templateName: string;
  templateVersion: number;
  sentToApplicantAt?: string | null;
  file: {
    fileName: string;
    mimeType: string;
    generatedAt?: string | null;
    pdf?: {
      mimeType: string;
      generatedAt?: string | null;
      available: boolean;
    } | null;
  };
};

export type OwnerGeneratedDocumentType = {
  id: string;
  statusId: string;
  applicationRefId?: string;
  permitType: string;
  documentKind: OwnerGeneratedDocumentKind;
  templateName: string;
  templateVersion: number;
  sentToApplicantAt?: string | null;
  generatedAt?: string | null;
  fileName: string;
  mimeType: string;
};


