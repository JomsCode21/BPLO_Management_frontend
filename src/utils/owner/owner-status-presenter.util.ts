import type { OwnerApplicationStatusCode } from "@/types/owner/owner.type";

const titleCase = (value: string) =>
  value
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export const formatOwnerStatusLabel = (
  status: OwnerApplicationStatusCode,
) => {
  switch (status) {
    case "approved":
      return "Complete";
    case "failed":
      return "Denied";
    case "re_submission":
      return "Action Required";
    case "inspection_for_completion":
      return "For Completion";
    case "payment_paid":
    case "payment_confirmed":
      return "Payment Paid";
    default:
      return titleCase(status);
  }
};

export const getOwnerStatusBadgeClass = (
  status: OwnerApplicationStatusCode,
) => {
  switch (status) {
    case "approved":
    case "inspection_approved":
    case "inspection_passed":
    case "payment_paid":
    case "payment_confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "failed":
    case "inspection_failed":
    case "inspection_denied":
      return "bg-red-100 text-red-700";
    case "re_submission":
    case "inspection_for_completion":
    case "inspection_pending":
    case "payment_pending":
      return "bg-amber-100 text-amber-700";
    case "inspection_scheduled":
      return "bg-sky-100 text-sky-700";
    case "inspection_rescheduled":
      return "bg-indigo-100 text-indigo-700";
    case "for_admin_approval":
    case "for_inspection":
    case "payment_breakdown":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-[#F4F8FC] text-[#0F2942]";
  }
};

export const getOwnerStatusContextLabel = (
  status: OwnerApplicationStatusCode,
) => {
  switch (status) {
    case "approved":
    case "inspection_approved":
    case "inspection_passed":
    case "payment_paid":
    case "payment_confirmed":
      return "Complete";
    case "failed":
    case "inspection_failed":
    case "inspection_denied":
      return "Denied";
    case "re_submission":
    case "inspection_for_completion":
      return "Action Required";
    case "inspection_pending":
    case "payment_pending":
      return "Pending";
    case "inspection_scheduled":
      return "Scheduled";
    case "inspection_rescheduled":
      return "Rescheduled";
    case "payment_breakdown":
      return "Ready";
    case "for_admin_approval":
      return "Approval Queue";
    case "for_inspection":
      return "Routing";
    default:
      return "Update";
  }
};

export const getOwnerStatusActionLabel = (
  status: OwnerApplicationStatusCode,
) => {
  switch (status) {
    case "re_submission":
      return "Resume Form";
    case "inspection_scheduled":
    case "inspection_rescheduled":
      return "View Schedule";
    case "payment_breakdown":
      return "View Breakdown";
    case "payment_pending":
      return "View Pending";
    case "payment_paid":
    case "payment_confirmed":
      return "View Paid";
    case "for_admin_approval":
      return "View Approval";
    case "approved":
    case "failed":
    case "inspection_passed":
    case "inspection_failed":
    case "inspection_denied":
    case "inspection_for_completion":
      return "View Result";
    default:
      return "View Update";
  }
};
