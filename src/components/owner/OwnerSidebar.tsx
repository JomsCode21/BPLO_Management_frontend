/* eslint-disable react-hooks/set-state-in-effect */
import Dock, { type DockItemData } from "@/components/sidebar/Dock";
import LogoutBtn from "@/components/logout/LogoutBtn";
import { useOwnerStatusStore } from "@/stores/owner/owner-status.store";
import type { OwnerApplicationStatusType } from "@/types/owner/owner.type";
import {
  formatOwnerStatusLabel,
  getOwnerStatusContextLabel,
} from "@/utils/owner/owner-status-presenter.util";
import {
  isInspectionNotification,
  isPaymentNotification,
} from "@/utils/owner/owner-status-routing.util";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  FiCalendar,
  FiChevronsLeft,
  FiChevronsRight,
  FiCreditCard,
  FiFile,
  FiFilePlus,
  FiFileText,
  FiGrid,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

type OwnerNavLink = {
  label: string;
  path: string;
  icon: IconType;
  badge?: number;
  end?: boolean;
};

const getUnreadNotificationCount = (
  application: OwnerApplicationStatusType,
) => {
  if (typeof application.unreadCount === "number") {
    return Math.max(0, application.unreadCount);
  }

  return application.isRead === false ? 1 : 0;
};

const formatBadgeValue = (count?: number) => {
  if (!count || count <= 0) return "";
  return count > 99 ? "99+" : String(count);
};

const getOwnerNavIsActive = (
  pathname: string,
  link: Pick<OwnerNavLink, "path" | "end">,
) => {
  if (link.end) {
    return pathname === link.path;
  }

  return pathname.startsWith(link.path);
};

const getOwnerMobileNavLabel = (label: string) => {
  switch (label) {
    case "Dashboard":
      return "Home";
    case "New Application":
      return "Apply";
    case "Application Status":
      return "Status";
    case "Generated Permits":
      return "Permits";
    case "Inspection Status":
      return "Inspect";
    case "Payment Status":
      return "Pay";
    case "Account Settings":
      return "Account";
    default:
      return label;
  }
};

const getOwnerTourTargetByPath = (path: string) => {
  switch (path) {
    case "/home/user/dashboard":
      return "nav-dashboard";
    case "/home/user/application-request":
      return "nav-new-application";
    case "/home/user/application-status":
      return "nav-application-status";
    case "/home/user/inspection-status":
      return "nav-inspection-status";
    case "/home/user/payment-status":
      return "nav-payment-status";
    case "/home/user/generated-permits":
      return "nav-generated-permits";
    case "/home/user/account":
      return "nav-account-settings";
    default:
      return undefined;
  }
};

export default function OwnerSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const applications = useOwnerStatusStore((state) => state.applications);
  const hasLoaded = useOwnerStatusStore((state) => state.hasLoaded);
  const fetchStatuses = useOwnerStatusStore((state) => state.fetchStatuses);
  const ensureRealtime = useOwnerStatusStore((state) => state.ensureRealtime);

  useEffect(() => {
    ensureRealtime();
  }, [ensureRealtime]);

  useEffect(() => {
    if (hasLoaded) return;

    void fetchStatuses().catch(() => {
      // Keep the owner shell usable if the initial feed load fails.
    });
  }, [fetchStatuses, hasLoaded]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const applicationUnreadCount = useMemo(
    () =>
      // Application bucket excludes inspection/payment notifications so each
      // nav badge reflects a distinct workflow stage.
      applications.reduce((total, application) => {
        if (
          isInspectionNotification(application) ||
          isPaymentNotification(application)
        ) {
          return total;
        }

        return total + getUnreadNotificationCount(application);
      }, 0),
    [applications],
  );

  const inspectionUnreadCount = useMemo(
    () =>
      applications.reduce((total, application) => {
        if (!isInspectionNotification(application)) {
          return total;
        }

        return total + getUnreadNotificationCount(application);
      }, 0),
    [applications],
  );

  const paymentUnreadCount = useMemo(
    () =>
      applications.reduce((total, application) => {
        if (!isPaymentNotification(application)) {
          return total;
        }

        return total + getUnreadNotificationCount(application);
      }, 0),
    [applications],
  );

  const totalUnreadCount =
    applicationUnreadCount + inspectionUnreadCount + paymentUnreadCount;
  const latestApplication = useMemo(() => {
    if (applications.length === 0) return null;

    // Sidebar summary uses most recently touched application regardless of
    // current stage to surface the freshest owner update.
    return [...applications].sort((left, right) => {
      const leftTimestamp = new Date(
        left.decidedAt ?? left.updatedAt ?? left.submittedAt,
      ).getTime();
      const rightTimestamp = new Date(
        right.decidedAt ?? right.updatedAt ?? right.submittedAt,
      ).getTime();

      return rightTimestamp - leftTimestamp;
    })[0];
  }, [applications]);

  const latestUpdateTimestamp = latestApplication
    ? new Intl.DateTimeFormat("en-PH", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(
        new Date(
          latestApplication.decidedAt ??
            latestApplication.updatedAt ??
            latestApplication.submittedAt,
        ),
      )
    : "";

  const primaryLinks: OwnerNavLink[] = [
    {
      label: "Dashboard",
      path: "/home/user/dashboard",
      icon: FiGrid,
      end: true,
    },
    {
      label: "New Application",
      path: "/home/user/application-request",
      icon: FiFilePlus,
      end: true,
    },
    {
      label: "Application Status",
      path: "/home/user/application-status",
      icon: FiFileText,
      badge: applicationUnreadCount,
    },
    {
      label: "Inspection Status",
      path: "/home/user/inspection-status",
      icon: FiCalendar,
      badge: inspectionUnreadCount,
    },
    {
      label: "Payment Status",
      path: "/home/user/payment-status",
      icon: FiCreditCard,
      badge: paymentUnreadCount,
    },
    {
      label: "Generated Permits",
      path: "/home/user/generated-permits",
      icon: FiFile,
      end: true,
    },
  ];

  const accountLink: OwnerNavLink = {
    label: "Account Settings",
    path: "/home/user/account",
    icon: FiUser,
    end: true,
  };

  const mobileMenuLinks: OwnerNavLink[] = [...primaryLinks, accountLink];
  const isAccountActive = getOwnerNavIsActive(location.pathname, accountLink);
  const mobileDockLinks = primaryLinks.filter(
    (link) =>
      link.label !== "Inspection Status" &&
      link.label !== "Payment Status" &&
      link.label !== "Generated Permits",
  );
  const hiddenMobileLinks = mobileMenuLinks.filter(
    (link) => !mobileDockLinks.some((dockLink) => dockLink.path === link.path),
  );
  const isHiddenMobileLinkActive = hiddenMobileLinks.some((link) =>
    getOwnerNavIsActive(location.pathname, link),
  );
  const hiddenMobileBadgeCount = hiddenMobileLinks.reduce(
    (total, link) => total + Number(link.badge ?? 0),
    0,
  );

  const mobileDockItems: DockItemData[] = [
    ...mobileDockLinks.map((link) => {
      const Icon = link.icon;
      const badgeLabel = formatBadgeValue(link.badge);

      return {
        icon: (
          <span className="relative inline-flex">
            <Icon size={18} />
            {badgeLabel && (
              <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-[#D93854] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
                {badgeLabel}
              </span>
            )}
          </span>
        ),
        label: getOwnerMobileNavLabel(link.label),
        onClick: () => navigate(link.path),
        isActive: getOwnerNavIsActive(location.pathname, link),
      };
    }),
    {
      icon: (
        <span className="relative inline-flex">
          <FiMenu size={18} />
          {hiddenMobileBadgeCount > 0 && (
            <span className="absolute -right-2 -top-2 inline-flex min-w-4 items-center justify-center rounded-full bg-[#D93854] px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
              {formatBadgeValue(hiddenMobileBadgeCount)}
            </span>
          )}
        </span>
      ),
      label: "Menu",
      onClick: () => setIsMobileMenuOpen(true),
      isActive: isMobileMenuOpen || isHiddenMobileLinkActive || isAccountActive,
    },
  ];

  return (
    <>
      {!isMobileMenuOpen && (
        <Dock
          items={mobileDockItems}
          className="fixed left-1/2 z-121 w-[calc(100vw-1rem)] max-w-120 -translate-x-1/2 rounded-[1.7rem] border border-white/10 bg-[#0F2942]/94 p-2 shadow-[0_18px_40px_rgba(15,41,66,0.30)] backdrop-blur-xl lg:hidden"
          style={{
            bottom: "max(0.75rem, calc(env(safe-area-inset-bottom) + 0.35rem))",
          }}
        />
      )}

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-140 bg-black/45 backdrop-blur-[1px] lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-x-3 bottom-24 z-141 isolate max-h-[calc(100dvh-7.5rem)] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0F2942] shadow-[0_22px_60px_rgba(2,12,27,0.45)] lg:hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#F2C94C]">
                  Business Owner
                </p>
                <p className="mt-1 text-sm font-semibold text-white/75">
                  Owner navigation
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition-colors hover:bg-white/15"
                aria-label="Close owner menu"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto px-4 py-4">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/6 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                      Owner Alerts
                    </p>
                    <p className="mt-1.5 text-sm font-semibold leading-5 text-white/80">
                      New updates across your permit activity.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-[#F2C94C] px-2.5 py-1.5 text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.16)]">
                    <p className="text-[1.25rem] font-black leading-none">
                      {formatBadgeValue(totalUnreadCount) || "0"}
                    </p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em]">
                      New
                    </p>
                  </div>
                </div>

                {latestApplication ? (
                  <div className="mt-3 rounded-[1.2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          Latest Event
                        </p>
                        <p className="mt-1.5 text-sm font-black leading-5 text-white">
                          {formatOwnerStatusLabel(latestApplication.status)}
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 rounded-full border border-[#F2C94C]/20 bg-[#F2C94C]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#F2C94C]">
                        {getOwnerStatusContextLabel(latestApplication.status)}
                      </span>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-white/8 bg-[#0B1D2E]/24 px-2.5 py-2">
                      <p className="line-clamp-1 text-sm font-semibold text-white/78">
                        {latestApplication.permitType}
                      </p>
                      <p className="mt-1.5 text-[11px] font-semibold text-white/52">
                        {latestUpdateTimestamp}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1.2rem] border border-dashed border-white/12 bg-white/4 px-3 py-3">
                    <p className="text-sm font-black text-white">
                      No recent event yet
                    </p>
                    <p className="mt-1.5 text-xs font-medium leading-[1.15rem] text-white/60">
                      Your latest permit milestone will appear here once there is
                      activity.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {hiddenMobileLinks.map((link) => {
                  const Icon = link.icon;
                  const badgeLabel = formatBadgeValue(link.badge);

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      end={link.end}
                      data-owner-tour={getOwnerTourTargetByPath(link.path)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={
                        hiddenMobileLinks.length === 1 ? "col-span-2" : undefined
                      }
                    >
                      {({ isActive }) => (
                        <div
                          className={`flex min-h-32 flex-col justify-between rounded-[1.45rem] border px-3.5 py-3.5 transition-all duration-300 ${
                            isActive
                              ? "border-transparent bg-white text-[#0F2942] shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
                              : "border-white/10 bg-white/6 text-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                isActive
                                  ? "bg-[#0F2942]/8 text-[#0F2942]"
                                  : "bg-[#0B1D2E] text-[#F2C94C]"
                              }`}
                            >
                              <Icon className="text-xl" />
                            </div>

                            {badgeLabel && (
                              <span
                                className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-1 text-[10px] font-black leading-none ${
                                  isActive
                                    ? "bg-[#FCE7EA] text-[#D93854]"
                                    : "bg-[#D93854] text-white"
                                }`}
                              >
                                {badgeLabel}
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            <span
                              className={`block text-[10px] font-black uppercase tracking-[0.18em] ${
                                isActive ? "text-[#0F2942]/48" : "text-white/45"
                              }`}
                            >
                              Owner
                            </span>
                            <span className="mt-1 block text-sm font-semibold leading-snug">
                              {link.label}
                            </span>
                          </div>
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              <div className="mt-4 border-t border-white/10 pt-4">
                <LogoutBtn
                  onLoggedOut={() => setIsMobileMenuOpen(false)}
                  iconSize={18}
                  className="w-full justify-center rounded-2xl px-4 py-3 text-sm"
                  labelClassName="text-sm font-bold tracking-widest uppercase text-[#0F2942]"
                />
              </div>
            </div>
          </div>
        </>
      )}

      <aside
        className={`hidden h-full shrink-0 border-r border-[#D9E1EA] bg-[#0F2942] transition-[width] duration-300 ease-out lg:flex lg:flex-col ${
          isExpanded ? "w-[18rem]" : "w-22"
        }`}
      >
        <div
          className={`border-b border-white/10 px-4 py-3.5 ${
            isExpanded
              ? "flex items-center justify-between gap-3"
              : "flex justify-center"
          }`}
        >
          {isExpanded && (
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F2C94C]">
              Business Owner
            </p>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-[#F2C94C] transition-colors hover:bg-white/16 cursor-pointer"
            aria-label={
              isExpanded ? "Collapse owner sidebar" : "Expand owner sidebar"
            }
            title={
              isExpanded ? "Collapse owner sidebar" : "Expand owner sidebar"
            }
          >
            {isExpanded ? (
              <FiChevronsLeft className="text-xl" />
            ) : (
              <FiChevronsRight className="text-xl" />
            )}
          </button>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden pt-3 pb-3 ${
            isExpanded ? "px-4" : "px-2.5"
          }`}
        >
          <div
            className={`rounded-3xl border border-white/10 bg-white/6 ${
              isExpanded ? "px-3.5 py-3.5" : "mx-auto w-14 px-2 py-3"
            }`}
          >
            {isExpanded ? (
              <>
                <div className="flex items-start justify-between gap-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/45">
                      Owner Alerts
                    </p>
                    <p className="mt-1.5 text-[13px] font-semibold leading-[1.15rem] text-white/78">
                      New updates across your permit activity.
                    </p>
                  </div>

                  <div className="shrink-0 rounded-xl bg-[#F2C94C] px-2.5 py-1.5 text-[#0F2942] shadow-[0_10px_24px_rgba(242,201,76,0.16)]">
                    <p className="text-[1.35rem] font-black leading-none">
                      {formatBadgeValue(totalUnreadCount) || "0"}
                    </p>
                    <p className="mt-0.5 text-[9px] font-black uppercase tracking-[0.16em]">
                      New
                    </p>
                  </div>
                </div>

                {latestApplication ? (
                  <div className="mt-3 rounded-[1.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
                          Latest Event
                        </p>
                        <p className="mt-1.5 text-sm font-black leading-5 text-white">
                          {formatOwnerStatusLabel(latestApplication.status)}
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 rounded-full border border-[#F2C94C]/20 bg-[#F2C94C]/10 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#F2C94C]">
                        {getOwnerStatusContextLabel(latestApplication.status)}
                      </span>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-white/8 bg-[#0B1D2E]/24 px-2.5 py-2">
                      <p className="line-clamp-1 text-sm font-semibold text-white/78">
                        {latestApplication.permitType}
                      </p>
                      <p className="mt-1.5 text-[11px] font-semibold text-white/52">
                        {latestUpdateTimestamp}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1.3rem] border border-dashed border-white/12 bg-white/4 px-3 py-3">
                    <p className="text-sm font-black text-white">
                      No recent event yet
                    </p>
                    <p className="mt-1.5 text-xs font-medium leading-[1.15rem] text-white/60">
                      Your latest permit milestone will appear here once there is
                      activity.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div
                className="flex flex-col items-center gap-2 text-center"
                title={
                  latestApplication
                    ? `${formatOwnerStatusLabel(latestApplication.status)} - ${latestApplication.permitType}`
                    : "Live owner updates"
                }
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/12">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </span>
                <p className="text-2xl font-black text-white">
                  {formatBadgeValue(totalUnreadCount) || "0"}
                </p>
              </div>
            )}
          </div>

          <nav className="mt-4 flex-1 space-y-1.5">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const badgeLabel = formatBadgeValue(link.badge);

              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.end}
                  data-owner-tour={getOwnerTourTargetByPath(link.path)}
                  title={!isExpanded ? link.label : undefined}
                  className={({ isActive }) =>
                    `group relative flex items-center rounded-2xl transition-all ${
                      isActive
                        ? "bg-white text-[#0F2942] shadow-[0_14px_28px_rgba(7,18,31,0.16)]"
                        : "text-white/75 hover:bg-white/8 hover:text-white"
                    } ${isActive ? "z-121" : ""} ${
                      isExpanded
                        ? "gap-3 px-3.5 py-2.5"
                        : "mx-auto h-14 w-14 shrink-0 justify-center px-0 py-0"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-[#0F2942] text-[#F2C94C]"
                            : "bg-white/10 text-white/80 group-hover:bg-white/[0.14]"
                        }`}
                      >
                        <Icon className="text-lg" />
                      </span>

                      {isExpanded && (
                        <span className="min-w-0 flex-1 text-sm font-bold">
                          {link.label}
                        </span>
                      )}

                      {isExpanded && badgeLabel && (
                        <span
                          className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-1 text-[11px] font-black leading-none ${
                            isActive
                              ? "bg-[#FCE7EA] text-[#D93854]"
                              : "bg-[#D93854] text-white"
                          }`}
                        >
                          {badgeLabel}
                        </span>
                      )}

                      {!isExpanded && badgeLabel && (
                        <span className="absolute right-2 top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-[#D93854] px-1.5 py-1 text-[10px] font-black leading-none text-white">
                          {badgeLabel}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="space-y-2.5 border-t border-white/10 pt-4">
            <NavLink
              to={accountLink.path}
              end={accountLink.end}
              data-owner-tour={getOwnerTourTargetByPath(accountLink.path)}
              title={!isExpanded ? "Account Settings" : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-2xl transition-all ${
                  isActive
                    ? "bg-white text-[#0F2942] shadow-[0_14px_28px_rgba(7,18,31,0.16)]"
                    : "text-white/75 hover:bg-white/8 hover:text-white"
                } ${isActive ? "z-121 relative" : ""} ${
                  isExpanded
                    ? "gap-3 px-3.5 py-2.5"
                    : "mx-auto h-14 w-14 shrink-0 justify-center px-0 py-0"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? "bg-[#0F2942] text-[#F2C94C]"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    <FiUser className="text-lg" />
                  </span>

                  {isExpanded && (
                    <span className="text-sm font-bold">Account Settings</span>
                  )}
                </>
              )}
            </NavLink>

            <div title={!isExpanded ? "Log out" : undefined}>
              <LogoutBtn
                iconSize={18}
                className={`${
                  isExpanded
                    ? "w-full justify-center rounded-2xl px-4 py-2.5"
                    : "mx-auto h-14 w-14 shrink-0 justify-center rounded-[1.4rem] px-0 py-0 gap-0 shadow-none"
                }`}
                labelClassName={
                  isExpanded
                    ? "font-bold tracking-widest uppercase text-[#0F2942]"
                    : "sr-only"
                }
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
