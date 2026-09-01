export type InspectorInspectionRequestType = {
  _id: string;
  applicantName: string;
  permitType: string;
  currentDepartment: string;
  currentDepartmentId: string;
  currentSequence: number;
  totalDepartments: number;
  assignedAt?: string | null;
  scheduledInspectionAt?: string | null;
  scheduleStatus?: "unscheduled" | "scheduled" | "rescheduled";
  scheduleRemark?: string;
  submittedAt: string;
};

export type InspectorDashboardType = {
  pendingRequests: number;
  todayInspections: number;
  upcomingInspections: number;
  resultBreakdown: {
    passed: number;
    forCompletion: number;
    failed: number;
  };
  monthlyInspections: Array<{
    key: string;
    label: string;
    count: number;
  }>;
  peakMonth: {
    key: string;
    label: string;
    count: number;
  } | null;
  analytics: {
    activeSchedules: number;
    readyAssessments: number;
    overdueInspections: number;
    rescheduledInspections: number;
    averageMonthlyInspections: number;
    averageTurnaroundDays: number | null;
    nextInspectionAt: string | null;
    busiestWeekday: {
      key: string;
      label: string;
      count: number;
    } | null;
  };
};

export type InspectorInspectionScheduleType = {
  _id: string;
  applicantName: string;
  permitType: string;
  currentDepartment: string;
  currentDepartmentId: string;
  currentSequence: number;
  totalDepartments: number;
  scheduledInspectionAt: string;
  scheduleStatus: "scheduled" | "rescheduled";
  scheduleRemark?: string;
  assignedAt?: string | null;
  submittedAt: string;
};

export type InspectorInspectionAssessmentType = {
  _id: string;
  applicantName: string;
  permitType: string;
  currentDepartment: string;
  currentDepartmentId: string;
  currentSequence: number;
  totalDepartments: number;
  scheduledInspectionAt: string;
  scheduleStatus: "scheduled" | "rescheduled";
  scheduleRemark?: string;
  assignedAt?: string | null;
  submittedAt: string;
};

export type InspectorPermitReleaseApplicationType = {
  _id: string;
  applicantName: string;
  permitType: string;
  generatedAt?: string | null;
  sentToApplicantAt?: string | null;
  releaseStatus: "for_release" | "sent_to_applicant";
  submittedAt: string;
};

export type InspectorInspectionRequestDetailType = {
  _id: string;
  applicantName: string;
  permitType: string;
  permitName: string;
  formTitle: string;
  currentDepartment: string;
  currentDepartmentId: string;
  currentSequence: number;
  totalDepartments: number;
  assignedAt?: string | null;
  scheduledInspectionAt?: string | null;
  scheduleStatus?: "unscheduled" | "scheduled" | "rescheduled";
  scheduleRemark?: string;
  permit?: {
    name: string;
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
};

export type InspectorWorkflowAuditEventType = {
  _id: string;
  applicationId: string;
  permitName: string;
  applicantName: string;
  statusCode: string;
  source: "inspector" | string;
  actorName: string;
  remark: string;
  occurredAt?: string | null;
};

export type InspectorWorkflowAuditPaginationType = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};
