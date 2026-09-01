import React from "react";
import type { RouteObject } from "react-router-dom";

// Layouts & Guards
import ProtectedRoute from "@/guards/ProtectedRoute";
import HomeLayout from "@/layouts/home/HomeLayout";

const createLazyRouteComponent = <T extends React.ComponentType<object>>(
  importer: () => Promise<{ default: T }>,
) => {
  const LazyComponent = React.lazy(importer);

  return (props: React.ComponentProps<T>) =>
    React.createElement(LazyComponent, props as React.ComponentProps<typeof LazyComponent>);
};

const BploAdminAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminAccountSettingsPage"),
);
const BploAdminDashboard = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminDashboard"),
);
const BploAdminInspectionRequestPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminInspectionRequestPage"),
);
const BploAdminPermitApprovalPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminPermitApprovalPage"),
);
const BploAdminPermitReleasePage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminPermitReleasePage"),
);
const BploAdminPermitValidityPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminPermitValidityPage"),
);
const BploAdminFeeAssessmentPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminFeeAssessmentPage"),
);
const BploAdminAuditHistoryPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminAuditHistoryPage"),
);
const BploAdminPaymentAnalyticsPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminPaymentAnalyticsPage"),
);
const BploAdminPermitPaymentPayersPage = createLazyRouteComponent(
  () => import("@/pages/home/bplo_admin/BploAdminPermitPaymentPayersPage"),
);
const DepartmentTreasurerAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/department_treasurer/DepartmentTreasurerAccountSettingsPage"),
);
const DepartmentTreasurerDashboard = createLazyRouteComponent(
  () => import("@/pages/home/department_treasurer/DepartmentTreasurerDashboard"),
);
const DepartmentTreasurerFeeAssessmentPage = createLazyRouteComponent(
  () => import("@/pages/home/department_treasurer/DepartmentTreasurerFeeAssessmentPage"),
);
const DepartmentTreasurerPaidPayersPage = createLazyRouteComponent(
  () => import("@/pages/home/department_treasurer/DepartmentTreasurerPaidPayersPage"),
);
const DepartmentTreasurerPendingPayersPage = createLazyRouteComponent(
  () => import("@/pages/home/department_treasurer/DepartmentTreasurerPendingPayersPage"),
);
const DepartmentTreasurerAuditHistoryPage = createLazyRouteComponent(
  () => import("@/pages/home/department_treasurer/DepartmentTreasurerAuditHistoryPage"),
);
const EvaluatorAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/evaluator/EvaluatorAccountSettingsPage"),
);
const EvaluatorDashboard = createLazyRouteComponent(
  () => import("@/pages/home/evaluator/EvaluatorDashboard"),
);
const EvaluatorInspectionsPage = createLazyRouteComponent(
  () => import("@/pages/home/evaluator/EvaluatorInspectionsPage"),
);
const EvaluatorRequestsPage = createLazyRouteComponent(
  () => import("@/pages/home/evaluator/EvaluatorRequestsPage"),
);
const EvaluatorAuditHistoryPage = createLazyRouteComponent(
  () => import("@/pages/home/evaluator/EvaluatorAuditHistoryPage"),
);
const HomePage = createLazyRouteComponent(() => import("@/pages/home/HomePage"));
const InspectorAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorAccountSettingsPage"),
);
const InspectorInspectionAssessmentPage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorInspectionAssessmentPage"),
);
const InspectorDashboard = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorDashboard"),
);
const InspectorInspectionRequestsPage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorInspectionRequestsPage"),
);
const InspectorSchedulePage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorSchedulePage"),
);
const InspectorCertificatesPage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorCertificatesPage"),
);
const InspectorPermitReleasePage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorPermitReleasePage"),
);
const InspectorAuditHistoryPage = createLazyRouteComponent(
  () => import("@/pages/home/inspector/InspectorAuditHistoryPage"),
);
const MainTreasurerAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/main_treasurer/MainTreasurerAccountSettingsPage"),
);
const MainTreasurerDashboard = createLazyRouteComponent(
  () => import("@/pages/home/main_treasurer/MainTreasurerDashboard"),
);
const MainTreasurerPaymentsPage = createLazyRouteComponent(
  () => import("@/pages/home/main_treasurer/MainTreasurerPaymentsPage"),
);
const MainTreasurerScanPaymentPage = createLazyRouteComponent(
  () => import("@/pages/home/main_treasurer/MainTreasurerScanPaymentPage"),
);
const MainTreasurerAuditHistoryPage = createLazyRouteComponent(
  () => import("@/pages/home/main_treasurer/MainTreasurerAuditHistoryPage"),
);
const OfficersPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/OfficersPage"),
);
const PermitBuilderPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/PermitBuilderPage"),
);
const PermitsPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/PermitsPage"),
);
const ProcessPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/ProcessPage"),
);
const PermitTemplatesPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/PermitTemplatesPage"),
);
const SuperAdminAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/SuperAdminAccountSettingsPage"),
);
const SuperAdminDashboard = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/SuperAdminDashboard"),
);
const SuperAdminAuditHistoryPage = createLazyRouteComponent(
  () => import("@/pages/home/super_admin/SuperAdminAuditHistoryPage"),
);
const ApplicationRequestPage = createLazyRouteComponent(
  () => import("@/pages/home/user/ApplicationRequestPage"),
);
const UserAccountSettingsPage = createLazyRouteComponent(
  () => import("@/pages/home/user/UserAccountSettingsPage"),
);
const UserGeneratedPermitsPage = createLazyRouteComponent(
  () => import("@/pages/home/user/UserGeneratedPermitsPage"),
);
const ApplicationStatusDetailPage = createLazyRouteComponent(
  () => import("@/pages/home/user/ApplicationStatusDetailPage"),
);
const ApplicationStatusPage = createLazyRouteComponent(
  () => import("@/pages/home/user/ApplicationStatusPage"),
);
const InspectionStatusDetailPage = createLazyRouteComponent(
  () => import("@/pages/home/user/InspectionStatusDetailPage"),
);
const InspectionStatusPage = createLazyRouteComponent(
  () => import("@/pages/home/user/InspectionStatusPage"),
);
const OnGoingPage = createLazyRouteComponent(
  () => import("@/pages/home/user/OnGoingPage"),
);
const PaymentStatusPage = createLazyRouteComponent(
  () => import("@/pages/home/user/PaymentStatusPage"),
);
const PermitApplicationFormPage = createLazyRouteComponent(
  () => import("@/pages/home/user/PermitApplicationFormPage"),
);
const UserDashboard = createLazyRouteComponent(
  () => import("@/pages/home/user/UserDashboard"),
);

export const homeRoutes: RouteObject = {
  path: "home",
  Component: HomeLayout,
  children: [
    {
      index: true,
      Component: HomePage,
    },

    // SUPER ADMIN
    {
      path: "super_admin",
      Component: () =>
        React.createElement(ProtectedRoute, { allowedRoles: ["super_admin"] }),
      children: [
        { index: true, Component: SuperAdminDashboard },
        { path: "dashboard", Component: SuperAdminDashboard },
        { path: "officers", Component: OfficersPage },
        { path: "account", Component: SuperAdminAccountSettingsPage },
        { path: "permits", Component: PermitsPage },
        { path: "permits/:permitId", Component: PermitBuilderPage },
        { path: "permit-templates", Component: PermitTemplatesPage },
        { path: "process", Component: ProcessPage },
        { path: "audit-history", Component: SuperAdminAuditHistoryPage },
        { path: "*", Component: OnGoingPage },
      ],
    },

    // BPLO ADMIN
    {
      path: "bplo_admin",
      Component: () =>
        React.createElement(ProtectedRoute, { allowedRoles: ["bplo_admin"] }),
      children: [
        { index: true, Component: BploAdminDashboard },
        { path: "dashboard", Component: BploAdminDashboard },
        { path: "permit-validity", Component: BploAdminPermitValidityPage },
        { path: "fee-assessment", Component: BploAdminFeeAssessmentPage },
        { path: "inspection-request", Component: BploAdminInspectionRequestPage },
        { path: "permit-approval", Component: BploAdminPermitApprovalPage },
        { path: "permit-release", Component: BploAdminPermitReleasePage },
        { path: "payment-analytics", Component: BploAdminPaymentAnalyticsPage },
        {
          path: "payment-analytics/:permitId",
          Component: BploAdminPermitPaymentPayersPage,
        },
        { path: "audit-history", Component: BploAdminAuditHistoryPage },
        { path: "account", Component: BploAdminAccountSettingsPage },
        { path: "*", Component: OnGoingPage },
      ],
    },

    // BUSINESS OWNER
    {
      path: "user",
      Component: () =>
        React.createElement(ProtectedRoute, { allowedRoles: ["business_owner"] }),
      children: [
        { index: true, Component: UserDashboard },
        { path: "dashboard", Component: UserDashboard },
        { path: "account", Component: UserAccountSettingsPage },
        { path: "generated-permits", Component: UserGeneratedPermitsPage },
        { path: "application-request", Component: ApplicationRequestPage },
        { path: "application-status", Component: ApplicationStatusPage },
        { path: "inspection-status", Component: InspectionStatusPage },
        { path: "payment-status", Component: PaymentStatusPage },
        { path: "on-going", Component: OnGoingPage },
        {
          path: "application-status/:applicationId",
          Component: ApplicationStatusDetailPage,
        },
        {
          path: "payment-status/:applicationId",
          Component: ApplicationStatusDetailPage,
        },
        {
          path: "inspection-status/:applicationId",
          Component: InspectionStatusDetailPage,
        },
        {
          path: "application-request/:permitId",
          Component: PermitApplicationFormPage,
        },
        { path: "*", Component: OnGoingPage },
      ],
    },

    // EVALUATOR
    {
      path: "evaluator",
      Component: () =>
        React.createElement(ProtectedRoute, { allowedRoles: ["evaluator"] }),
      children: [
        { index: true, Component: EvaluatorDashboard },
        { path: "dashboard", Component: EvaluatorDashboard },
        { path: "account", Component: EvaluatorAccountSettingsPage },
        { path: "requests", Component: EvaluatorRequestsPage },
        { path: "inspections", Component: EvaluatorInspectionsPage },
        { path: "audit-history", Component: EvaluatorAuditHistoryPage },
        { path: "*", Component: OnGoingPage },
      ],
    },

    // INSPECTOR
    {
      path: "inspector",
      Component: () =>
        React.createElement(ProtectedRoute, { allowedRoles: ["inspector"] }),
      children: [
        { index: true, Component: InspectorDashboard },
        { path: "dashboard", Component: InspectorDashboard },
        {
          path: "inspection-requests",
          Component: InspectorInspectionRequestsPage,
        },
        {
          path: "schedule-inspection",
          Component: InspectorSchedulePage,
        },
        {
          path: "inspection-assessment",
          Component: InspectorInspectionAssessmentPage,
        },
        {
          path: "certificates",
          Component: InspectorCertificatesPage,
        },
        {
          path: "permit-release",
          Component: InspectorPermitReleasePage,
        },
        {
          path: "audit-history",
          Component: InspectorAuditHistoryPage,
        },
        { path: "account", Component: InspectorAccountSettingsPage },
        { path: "*", Component: OnGoingPage },
      ],
    },

    // DEPARTMENT TREASURER
    {
      path: "department_treasurer",
      Component: () =>
        React.createElement(ProtectedRoute, {
          allowedRoles: ["department_treasurer"],
        }),
      children: [
        { index: true, Component: DepartmentTreasurerDashboard },
        { path: "dashboard", Component: DepartmentTreasurerDashboard },
        { path: "payers-pending", Component: DepartmentTreasurerPendingPayersPage },
        { path: "payers-paid", Component: DepartmentTreasurerPaidPayersPage },
        { path: "payment-list", Component: DepartmentTreasurerPendingPayersPage },
        { path: "fee-assessment", Component: DepartmentTreasurerFeeAssessmentPage },
        { path: "audit-history", Component: DepartmentTreasurerAuditHistoryPage },
        { path: "account", Component: DepartmentTreasurerAccountSettingsPage },
        { path: "*", Component: OnGoingPage },
      ],
    },

    // MAIN TREASURER
    {
      path: "main_treasurer",
      Component: () =>
        React.createElement(ProtectedRoute, { allowedRoles: ["main_treasurer"] }),
      children: [
        { index: true, Component: MainTreasurerDashboard },
        { path: "dashboard", Component: MainTreasurerDashboard },
        { path: "payments", Component: MainTreasurerPaymentsPage },
        { path: "scan-payment", Component: MainTreasurerScanPaymentPage },
        { path: "audit-history", Component: MainTreasurerAuditHistoryPage },
        { path: "account", Component: MainTreasurerAccountSettingsPage },
        { path: "*", Component: OnGoingPage },
      ],
    },

    { path: "*", Component: OnGoingPage },
  ],
};

