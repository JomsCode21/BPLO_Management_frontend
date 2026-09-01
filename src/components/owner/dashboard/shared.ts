import type {
  OwnerApplicationStatusCode,
  OwnerApplicationStatusType,
} from "@/types/owner/owner.type";
import type { IconType } from "react-icons";

export const getUnreadNotificationCount = (
  application: OwnerApplicationStatusType,
) => {
  if (typeof application.unreadCount === "number") {
    return Math.max(0, application.unreadCount);
  }

  return application.isRead === false ? 1 : 0;
};

export const getApplicationTimestamp = (
  application: OwnerApplicationStatusType,
) => application.decidedAt ?? application.updatedAt ?? application.submittedAt;

export const formatDashboardTimestamp = (value?: string | null) => {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const getOwnerRecordKey = (
  application: OwnerApplicationStatusType,
) => {
  const applicationRefId = String(application.applicationRefId ?? "").trim();
  if (applicationRefId) return applicationRefId;

  return `${application.permitId}:${application.permitType}`;
};

export const attentionStatusSet = new Set<OwnerApplicationStatusCode>([
  "re_submission",
  "inspection_for_completion",
  "inspection_scheduled",
  "inspection_rescheduled",
  "inspection_failed",
  "inspection_denied",
  "payment_breakdown",
  "payment_pending",
  "failed",
]);

export const closedStatusSet = new Set<OwnerApplicationStatusCode>([
  "approved",
  "failed",
  "inspection_failed",
  "inspection_denied",
]);

export const isActivePermitStatus = (status: OwnerApplicationStatusCode) =>
  !closedStatusSet.has(status);

export const getPriorityScore = (status: OwnerApplicationStatusCode) => {
  switch (status) {
    case "re_submission":
      return 110;
    case "inspection_for_completion":
      return 105;
    case "payment_breakdown":
      return 100;
    case "inspection_rescheduled":
      return 96;
    case "inspection_scheduled":
      return 94;
    case "payment_pending":
      return 88;
    case "for_admin_approval":
      return 84;
    case "inspection_pending":
      return 78;
    case "for_inspection":
    case "inspection_approved":
      return 72;
    case "submitted":
      return 64;
    case "payment_paid":
    case "payment_confirmed":
      return 58;
    case "inspection_passed":
      return 54;
    case "approved":
      return 46;
    case "inspection_failed":
    case "inspection_denied":
    case "failed":
      return 42;
    default:
      return 36;
  }
};

export const getDashboardStatusMessage = (
  status: OwnerApplicationStatusCode,
) => {
  switch (status) {
    case "submitted":
      return "Your request is now waiting for evaluator review.";
    case "re_submission":
      return "Update the flagged requirements and submit again to continue processing.";
    case "for_inspection":
      return "Your request has moved into inspection preparation.";
    case "inspection_pending":
      return "BPLO is reviewing your inspection routing details.";
    case "inspection_approved":
      return "Inspection routing is approved and assignment is underway.";
    case "inspection_scheduled":
      return "An inspection schedule is ready for you to review.";
    case "inspection_rescheduled":
      return "Your inspection schedule has changed. Check the updated slot.";
    case "inspection_for_completion":
      return "The inspector needs completion before your application can proceed.";
    case "inspection_passed":
      return "Inspection is cleared and your payment preparation is moving forward.";
    case "inspection_failed":
      return "Inspection ended in a failed state and needs your review.";
    case "inspection_denied":
      return "Inspection routing was denied. Review the remarks for the next step.";
    case "for_admin_approval":
      return "Your application is now waiting for final BPLO admin approval.";
    case "payment_breakdown":
      return "Your fees are building up. Open payment status to review the current breakdown.";
    case "payment_pending":
      return "Your payment QR is ready. Pay first at the main treasurer so the evaluator can forward your permit.";
    case "payment_paid":
    case "payment_confirmed":
      return "Payment is already recorded. Final release updates will appear next.";
    case "approved":
      return "Your permit is complete and ready for final viewing or download.";
    case "failed":
      return "This application ended in a denied state. Review the remarks for details.";
    default:
      return "A new update is available for this permit request.";
  }
};

export const getWorkflowStageIndex = (status: OwnerApplicationStatusCode) => {
  switch (status) {
    case "submitted":
      return 0;
    case "re_submission":
      return 1;
    case "for_inspection":
    case "inspection_pending":
    case "inspection_approved":
    case "inspection_scheduled":
    case "inspection_rescheduled":
    case "inspection_denied":
    case "inspection_passed":
    case "inspection_for_completion":
    case "inspection_failed":
      return 2;
    case "for_admin_approval":
      return 4;
    case "payment_breakdown":
      return 2;
    case "payment_pending":
    case "payment_paid":
    case "payment_confirmed":
      return 3;
    case "approved":
    case "failed":
      return 5;
    default:
      return 1;
  }
};

export const getWorkflowStepDisplayLabel = (
  status: OwnerApplicationStatusCode,
  fallbackLabel: string,
) => {
  switch (status) {
    case "re_submission":
      return "Re-submission";
    case "for_inspection":
      return "For Inspection";
    case "inspection_pending":
      return "Inspection Pending";
    case "inspection_approved":
      return "Inspection Approved";
    case "inspection_scheduled":
      return "Inspection Scheduled";
    case "inspection_rescheduled":
      return "Inspection Rescheduled";
    case "inspection_denied":
      return "Inspection Denied";
    case "inspection_passed":
      return "Inspection Passed";
    case "inspection_for_completion":
      return "For Completion";
    case "inspection_failed":
      return "Inspection Failed";
    case "for_admin_approval":
      return "Admin Review";
    case "payment_breakdown":
      return "Breakdown Ready";
    case "payment_pending":
      return "Payment Pending";
    case "payment_paid":
      return "Payment Paid";
    case "payment_confirmed":
      return "Payment Confirmed";
    case "approved":
      return "Released";
    case "failed":
      return "Denied";
    default:
      return fallbackLabel;
  }
};

export const getWorkflowStepNote = (status: OwnerApplicationStatusCode) => {
  switch (status) {
    case "submitted":
      return "Request filed";
    case "re_submission":
      return "Update required";
    case "for_inspection":
      return "Routing started";
    case "inspection_pending":
      return "Under review";
    case "inspection_approved":
      return "Routing approved";
    case "inspection_scheduled":
      return "Schedule posted";
    case "inspection_rescheduled":
      return "Schedule changed";
    case "inspection_denied":
      return "Routing denied";
    case "inspection_passed":
      return "Inspection passed";
    case "inspection_for_completion":
      return "Needs completion";
    case "inspection_failed":
      return "Inspection failed";
    case "for_admin_approval":
      return "Queued for BPLO admin";
    case "payment_breakdown":
      return "Fees ready";
    case "payment_pending":
      return "Pay at treasurer";
    case "payment_paid":
      return "Paid and waiting";
    case "payment_confirmed":
      return "Payment confirmed";
    case "approved":
      return "Final release";
    case "failed":
      return "Application denied";
    default:
      return "Current focus";
  }
};

export const getWorkflowPostPaymentNote = (
  status: OwnerApplicationStatusCode,
) => {
  switch (status) {
    case "payment_paid":
      return "Payment is posted and waiting for evaluator forwarding.";
    case "payment_confirmed":
      return "Payment is confirmed and waiting for evaluator forwarding.";
    default:
      return "Awaiting final release.";
  }
};

export type StatCard = {
  label: string;
  value: number;
  note: string;
  icon: IconType;
  surfaceClass: string;
  iconClass: string;
};

export type WorkflowTimelineItem = {
  step: string;
  index: number;
  isFocusedStep: boolean;
  isDone: boolean;
  isDanger: boolean;
  label: string;
  note: string;
};

export const workflowSteps = [
  "Submitted",
  "Evaluation",
  "Inspection",
  "Payment",
  "Approval",
  "Decision",
] as const;

export const buildWorkflowTimeline = (params: {
  focusApplication: OwnerApplicationStatusType | null;
  workflowRenderStageIndex: number;
  isFocusApproved: boolean;
  isPaymentSettled: boolean;
}): WorkflowTimelineItem[] =>
  workflowSteps.map((step, index) => {
    const isFocusedStep =
      Boolean(params.focusApplication) && index === params.workflowRenderStageIndex;
    const isDone =
      Boolean(params.focusApplication) &&
      (params.isFocusApproved
        ? index <= params.workflowRenderStageIndex
        : index < params.workflowRenderStageIndex);

    const isDanger =
      isFocusedStep &&
      (params.focusApplication?.status === "failed" ||
        params.focusApplication?.status === "inspection_failed" ||
        params.focusApplication?.status === "inspection_denied");

    const label =
      isFocusedStep && params.focusApplication
        ? getWorkflowStepDisplayLabel(params.focusApplication.status, step)
        : step;

    const note = isDone
      ? "Completed stage"
      : isFocusedStep && params.focusApplication
        ? getWorkflowStepNote(params.focusApplication.status)
        : "Upcoming stage";

    return {
      step,
      index,
      isFocusedStep,
      isDone,
      isDanger,
      label,
      note,
    };
  });

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
};

export const itemVariants = {
  hidden: { y: 18, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 120,
      damping: 14,
    },
  },
};
