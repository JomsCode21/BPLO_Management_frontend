import { createAuthenticatedSocket } from "./socket-client";

// Namespaced evaluator events emitted by backend realtime gateway.
export const EVALUATOR_APPLICATIONS_EVENT = "evaluator:applications_update";
export const EVALUATOR_INSPECTION_REVIEW_EVENT =
  "evaluator:inspection_review_update";
export const EVALUATOR_DASHBOARD_ANALYTICS_EVENT =
  "evaluator:dashboard_analytics_update";
export const EVALUATOR_WORKFLOW_AUDIT_EVENT =
  "evaluator:workflow_audit_update";

export const createEvaluatorSocket = () => {
  // Shared authenticated connection reused by evaluator pages.
  return createAuthenticatedSocket();
};
