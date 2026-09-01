import { createAuthenticatedSocket } from "./socket-client";

// Namespaced BPLO admin realtime channels pushed by the backend.
export const ADMIN_DASHBOARD_ANALYTICS_EVENT =
  "admin:dashboard_analytics_update";
export const ADMIN_INSPECTION_REQUEST_EVENT = "admin:inspection_request_update";
export const ADMIN_PERMIT_APPROVAL_EVENT = "admin:permit_approval_update";
export const ADMIN_PERMIT_VALIDITY_EVENT = "admin:permit_validity_update";
export const ADMIN_WORKFLOW_AUDIT_EVENT = "admin:workflow_audit_update";

export const createBploAdminSocket = () => {
  // Reuses authenticated socket client used across officer roles.
  return createAuthenticatedSocket();
};
