import { createAuthenticatedSocket } from "./socket-client";

// Namespaced realtime channels for super admin dashboard/audit updates.
export const DASHBOARD_STATS_EVENT = "super_admin:dashboard_stats";
export const SUPER_ADMIN_WORKFLOW_AUDIT_EVENT =
  "super_admin:workflow_audit_update";

export const createSuperAdminSocket = () => {
  // Uses shared authenticated socket transport.
  return createAuthenticatedSocket();
};
