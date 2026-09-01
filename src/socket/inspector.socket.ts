import { createAuthenticatedSocket } from "./socket-client";

// Namespaced inspector realtime channels emitted by backend gateway.
export const INSPECTOR_INSPECTION_REQUEST_EVENT =
  "inspector:inspection_request_update";
export const INSPECTOR_SCHEDULE_EVENT = "inspector:schedule_update";
export const INSPECTOR_WORKFLOW_AUDIT_EVENT =
  "inspector:workflow_audit_update";

export const createInspectorSocket = () => {
  // Uses shared authenticated socket instance for inspector pages.
  return createAuthenticatedSocket();
};
