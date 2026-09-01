import UserDashboardHero from "@/components/owner/dashboard/UserDashboardHero";
import UserDashboardStatsGrid from "@/components/owner/dashboard/UserDashboardStatsGrid";
import UserDashboardWorkflowCard from "@/components/owner/dashboard/UserDashboardWorkflowCard";
import { useOwnerWalkthroughStore } from "@/stores/owner/owner-walkthrough.store";
import {
  attentionStatusSet,
  buildWorkflowTimeline,
  containerVariants,
  formatDashboardTimestamp,
  getApplicationTimestamp,
  isActivePermitStatus,
  getOwnerRecordKey,
  getPriorityScore,
  getUnreadNotificationCount,
  getWorkflowStageIndex,
  getWorkflowStepDisplayLabel,
  itemVariants,
  type StatCard,
} from "@/components/owner/dashboard/shared";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useOwnerStatusStore } from "@/stores/owner/owner-status.store";
import { isInspectionNotification, isPaymentNotification } from "@/utils/owner/owner-status-routing.util";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();
  const displayName = useAuthStore((s) => s.user?.firstName || "User");
  const requestWalkthroughStart = useOwnerWalkthroughStore(
    (state) => state.requestStart,
  );
  const applications = useOwnerStatusStore((state) => state.applications);
  const hasLoaded = useOwnerStatusStore((state) => state.hasLoaded);
  const fetchStatuses = useOwnerStatusStore((state) => state.fetchStatuses);
  const ensureRealtime = useOwnerStatusStore((state) => state.ensureRealtime);
  const realtimeConnected = useOwnerStatusStore(
    (state) => state.realtimeConnected,
  );
  const lastRealtimeEventAt = useOwnerStatusStore(
    (state) => state.lastRealtimeEventAt,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    ensureRealtime();
  }, [ensureRealtime]);

  useEffect(() => {
    if (hasLoaded) return;

    void fetchStatuses().catch(() => {
      // Keep the dashboard usable even if the first feed request fails.
    });
  }, [fetchStatuses, hasLoaded]);

  const sortedApplications = useMemo(
    () =>
      [...applications].sort((left, right) => {
        return (
          new Date(getApplicationTimestamp(right)).getTime() -
          new Date(getApplicationTimestamp(left)).getTime()
        );
      }),
    [applications],
  );

  const latestPermitRecords = useMemo(() => {
    const recordMap = new Map();

    for (const application of sortedApplications) {
      const key = getOwnerRecordKey(application);
      if (!recordMap.has(key)) {
        recordMap.set(key, application);
      }
    }

    return Array.from(recordMap.values());
  }, [sortedApplications]);

  const totalUnreadCount = useMemo(
    () =>
      applications.reduce(
        (total, application) => total + getUnreadNotificationCount(application),
        0,
      ),
    [applications],
  );

  const nextActionApplication = useMemo(() => {
    if (latestPermitRecords.length === 0) return null;

    return [...latestPermitRecords].sort((left, right) => {
      const priorityDelta =
        getPriorityScore(right.status) - getPriorityScore(left.status);

      if (priorityDelta !== 0) return priorityDelta;

      return (
        new Date(getApplicationTimestamp(right)).getTime() -
        new Date(getApplicationTimestamp(left)).getTime()
      );
    })[0];
  }, [latestPermitRecords]);

  const latestApplication = latestPermitRecords[0] ?? null;
  const focusApplication = nextActionApplication ?? latestApplication;
  const focusStageIndex = focusApplication
    ? getWorkflowStageIndex(focusApplication.status)
    : 0;
  const isFocusApproved = focusApplication?.status === "approved";
  const isFocusDenied =
    focusApplication?.status === "failed" ||
    focusApplication?.status === "inspection_failed" ||
    focusApplication?.status === "inspection_denied";
  const isPaymentSettled =
    focusApplication?.status === "payment_paid" ||
    focusApplication?.status === "payment_confirmed";
  const workflowRenderStageIndex = focusStageIndex;
  const focusWorkflowLabel = focusApplication
    ? getWorkflowStepDisplayLabel(
        focusApplication.status,
        "Workflow",
      )
    : "Workflow";

  const trackedPermitsCount = latestPermitRecords.length;
  const activePermitsCount = latestPermitRecords.filter(
    (application) => isActivePermitStatus(application.status),
  ).length;
  const needsAttentionCount = latestPermitRecords.filter((application) =>
    attentionStatusSet.has(application.status),
  ).length;
  const inspectionPermitCount = latestPermitRecords.filter((application) =>
    isInspectionNotification(application),
  ).length;
  const paymentPermitCount = latestPermitRecords.filter((application) =>
    isPaymentNotification(application),
  ).length;

  const heroSummary =
    trackedPermitsCount > 0
      ? `You currently have ${activePermitsCount} active permit request${activePermitsCount === 1 ? "" : "s"}, ${needsAttentionCount} item${needsAttentionCount === 1 ? "" : "s"} that need attention, and ${totalUnreadCount} unread update${totalUnreadCount === 1 ? "" : "s"} across your owner workspace.`
      : "Start your first permit request and monitor evaluation, inspection, payment, and final release from one dashboard.";
  const realtimeStatusNote = realtimeConnected
    ? lastRealtimeEventAt
      ? `Live backend sync active - Last update ${formatDashboardTimestamp(lastRealtimeEventAt)}`
      : "Live backend sync active"
    : "Realtime sync reconnecting";

  const statCards: StatCard[] = [
    {
      label: "Tracked Permits",
      value: trackedPermitsCount,
      note:
        trackedPermitsCount === 1
          ? "1 permit in your workspace"
          : "Permit requests in your workspace",
      icon: FiShield,
      surfaceClass: "bg-white",
      iconClass: "bg-[#F4F8FC] text-[#0F2942]",
    },
    {
      label: "Needs Attention",
      value: needsAttentionCount,
      note:
        needsAttentionCount > 0
          ? "Items waiting for your action"
          : "Nothing urgent right now",
      icon: FiAlertCircle,
      surfaceClass: "bg-white",
      iconClass: "bg-amber-50 text-amber-700",
    },
    {
      label: "Inspection Updates",
      value: inspectionPermitCount,
      note:
        inspectionPermitCount > 0
          ? "Permits currently in inspection flow"
          : "No inspection items yet",
      icon: FiCalendar,
      surfaceClass: "bg-white",
      iconClass: "bg-sky-50 text-sky-700",
    },
    {
      label: "Payment Updates",
      value: paymentPermitCount,
      note:
        paymentPermitCount > 0
          ? "Permits already in payment flow"
          : "No payment items yet",
      icon: FiCreditCard,
      surfaceClass: "bg-white",
      iconClass: "bg-emerald-50 text-emerald-700",
    },
  ];

  const workflowTimeline = useMemo(
    () =>
      buildWorkflowTimeline({
        focusApplication,
        workflowRenderStageIndex,
        isFocusApproved,
        isPaymentSettled,
      }),
    [
      focusApplication,
      workflowRenderStageIndex,
      isFocusApproved,
      isPaymentSettled,
    ],
  );

  const handleToggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleOpenAccountSettings = () => {
    setIsMobileMenuOpen(false);
    navigate("/home/user/account");
  };

  const handleOpenWalkthrough = () => {
    requestWalkthroughStart();
  };

  return (
    <div className="min-h-full w-full bg-[#F5F7FB]">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <UserDashboardHero
          displayName={displayName}
          heroSummary={heroSummary}
          focusApplication={focusApplication}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={handleToggleMobileMenu}
          onOpenWalkthrough={handleOpenWalkthrough}
          onOpenAccountSettings={handleOpenAccountSettings}
          onCloseMobileMenu={handleCloseMobileMenu}
        />
      </motion.div>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="-mt-16 px-4 pb-12 sm:px-6 md:px-8"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
          <motion.div variants={itemVariants}>
            <UserDashboardStatsGrid statCards={statCards} />
          </motion.div>

          <motion.div variants={itemVariants}>
            <UserDashboardWorkflowCard
              focusApplication={focusApplication}
              workflowTimeline={workflowTimeline}
              realtimeConnected={realtimeConnected}
              realtimeStatusNote={realtimeStatusNote}
              isFocusApproved={isFocusApproved}
              isFocusDenied={isFocusDenied}
              focusWorkflowLabel={focusWorkflowLabel}
              workflowRenderStageIndex={workflowRenderStageIndex}
            />
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
}
