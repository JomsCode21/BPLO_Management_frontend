import type {
  OwnerApplicationStatusType,
  OwnerNotificationScope,
} from "@/types/owner/owner.type";

const inspectionSourceSet = new Set(["bplo_admin", "inspector"]);
const paymentSourceSet = new Set(["treasurer"]);

const inspectionStatusSet = new Set([
  "for_inspection",
  "inspection_pending",
  "inspection_approved",
  "inspection_scheduled",
  "inspection_rescheduled",
  "inspection_denied",
  "inspection_passed",
  "inspection_for_completion",
  "inspection_failed",
]);

const paymentStatusSet = new Set([
  "for_admin_approval",
  "payment_breakdown",
  "payment_pending",
  "payment_paid",
  "payment_confirmed",
]);

export const isInspectionNotification = (
  application: OwnerApplicationStatusType,
) => {
  if (application.statusSource && application.statusSource !== "system") {
    return inspectionSourceSet.has(application.statusSource);
  }

  // Backward-compatible fallback for older backend builds.
  return inspectionStatusSet.has(application.status);
};

export const isPaymentNotification = (
  application: OwnerApplicationStatusType,
) => {
  if (application.statusSource && application.statusSource !== "system") {
    return (
      paymentSourceSet.has(application.statusSource) ||
      paymentStatusSet.has(application.status)
    );
  }

  return paymentStatusSet.has(application.status);
};

export const isApplicationNotification = (
  application: OwnerApplicationStatusType,
) =>
  !isInspectionNotification(application) &&
  !isPaymentNotification(application);

export const matchesOwnerNotificationScope = (
  application: OwnerApplicationStatusType,
  scope: OwnerNotificationScope,
) => {
  switch (scope) {
    case "inspection":
      return isInspectionNotification(application);
    case "payment":
      return isPaymentNotification(application);
    case "application":
    default:
      return isApplicationNotification(application);
  }
};
