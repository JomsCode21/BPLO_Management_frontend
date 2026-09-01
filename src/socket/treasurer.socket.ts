import { createAuthenticatedSocket } from "./socket-client";

// Namespaced realtime channels shared by main and department treasurer pages.
export const DEPARTMENT_TREASURER_PAYMENT_EVENT =
  "department_treasurer:payment_update";
export const MAIN_TREASURER_PAYMENT_EVENT = "main_treasurer:payment_update";
export const DEPARTMENT_TREASURER_WORKFLOW_AUDIT_EVENT =
  "department_treasurer:workflow_audit_update";
export const MAIN_TREASURER_WORKFLOW_AUDIT_EVENT =
  "main_treasurer:workflow_audit_update";

export const createTreasurerSocket = () => {
  // Reuses authenticated socket transport for treasurer roles.
  return createAuthenticatedSocket();
};
