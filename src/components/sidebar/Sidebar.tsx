import BPLOLogo from "@/assets/BPLOLogo.png";
import LogoutBtn from "@/components/logout/LogoutBtn";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useBrandingStore } from "@/stores/branding/branding.store";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AiOutlineFileSearch } from "react-icons/ai";
import {
  FiActivity,
  FiCalendar,
  FiCamera,
  FiCheckSquare,
  FiChevronsLeft,
  FiChevronsRight,
  FiClipboard,
  FiFileText,
  FiGrid,
  FiMenu,
  FiSearch,
  FiUser,
  FiUserCheck,
  FiX,
} from "react-icons/fi";
import { GrCertificate } from "react-icons/gr";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Dock, { type DockItemData } from "./Dock";

type Viewport = "mobile" | "tablet" | "desktop";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

const getViewport = (width: number): Viewport => {
  if (width < MOBILE_BREAKPOINT) return "mobile";
  if (width < DESKTOP_BREAKPOINT) return "tablet";
  return "desktop";
};

const getMobileNavLabel = (name: string) => {
  switch (name) {
    case "Dashboard":
      return "Home";
    case "Application Request":
    case "Inspection Request":
      return "Requests";
    case "Inspection Review":
      return "Review";
    case "Schedule Inspection":
      return "Schedule";
    case "Inspection Assessment":
      return "Assess";
    case "Permit Validity":
      return "Validity";
    case "Permit Approval":
      return "Approval";
    case "Permit Release":
      return "Release";
    case "List of Payers":
      return "Payers";
    case "Pending Payers":
      return "Pending";
    case "Paid Payers":
      return "Paid";
    case "Fee Assessment":
      return "Fees";
    case "Payments":
      return "Payments";
    case "Payment Received":
      return "Received";
    case "Scan Payment":
      return "Scan";
    case "Certificates":
      return "Certs";
    default:
      return name;
  }
};

const getSidebarLabelTextClassName = (label: string) => {
  const compactLength = label.replace(/\s+/g, "").length;

  if (compactLength >= 18) {
    return "text-xs tracking-[0.08em]";
  }

  if (compactLength >= 14) {
    return "text-[13px] tracking-[0.09em]";
  }

  return "text-sm tracking-widest";
};

const getSuperAdminTourTargetByPath = (path: string) => {
  switch (path) {
    case "/home/super_admin/dashboard":
      return "nav-dashboard";
    case "/home/super_admin/officers":
      return "nav-officers";
    case "/home/super_admin/permits":
      return "nav-permits";
    case "/home/super_admin/permit-templates":
      return "nav-permit-templates";
    case "/home/super_admin/process":
      return "nav-process";
    case "/home/super_admin/audit-history":
      return "nav-audit-history";
    case "/home/super_admin/account":
      return "nav-account-settings";
    case "/home/inspector/dashboard":
      return "nav-dashboard";
    case "/home/inspector/inspection-requests":
      return "nav-inspection-requests";
    case "/home/inspector/schedule-inspection":
      return "nav-schedule-inspection";
    case "/home/inspector/inspection-assessment":
      return "nav-inspection-assessment";
    case "/home/inspector/certificates":
      return "nav-certificates";
    case "/home/inspector/permit-release":
      return "nav-permit-release";
    case "/home/inspector/audit-history":
      return "nav-audit-history";
    case "/home/inspector/account":
      return "nav-account-settings";
    case "/home/evaluator/dashboard":
      return "nav-dashboard";
    case "/home/evaluator/requests":
      return "nav-requests";
    case "/home/evaluator/inspections":
      return "nav-inspections";
    case "/home/evaluator/audit-history":
      return "nav-audit-history";
    case "/home/evaluator/account":
      return "nav-account-settings";
    case "/home/bplo_admin/dashboard":
      return "nav-dashboard";
    case "/home/bplo_admin/permit-validity":
      return "nav-permit-validity";
    case "/home/bplo_admin/fee-assessment":
      return "nav-fee-assessment";
    case "/home/bplo_admin/payment-analytics":
      return "nav-payment-analytics";
    case "/home/bplo_admin/inspection-request":
      return "nav-inspection-request";
    case "/home/bplo_admin/permit-approval":
      return "nav-permit-approval";
    case "/home/bplo_admin/permit-release":
      return "nav-permit-release";
    case "/home/bplo_admin/audit-history":
      return "nav-audit-history";
    case "/home/bplo_admin/account":
      return "nav-account-settings";
    default:
      return undefined;
  }
};

export default function Sidebar() {
  const initialViewport = getViewport(window.innerWidth);
  const [isExpanded, setIsExpanded] = useState(initialViewport === "desktop");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [viewport, setViewport] = useState<Viewport>(initialViewport);
  const viewportRef = useRef<Viewport>(initialViewport);
  const isMobile = viewport !== "desktop";

  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logoUrl = useBrandingStore((s) => s.logoUrl);
  const fetchLogo = useBrandingStore((s) => s.fetchLogo);
  const activeLogo = logoUrl || BPLOLogo;

  useEffect(() => {
    void fetchLogo();
  }, [fetchLogo]);

  useEffect(() => {
    let rafId = 0;

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const nextViewport = getViewport(window.innerWidth);
        const previousViewport = viewportRef.current;

        if (nextViewport === previousViewport) return;

        viewportRef.current = nextViewport;
        setViewport(nextViewport);

        if (nextViewport === "mobile") {
          setIsExpanded(false);
          setIsMobileOpen(false);
          return;
        }

        if (nextViewport === "tablet") {
          setIsExpanded(false);
          setIsMobileOpen(false);
          return;
        }

        if (nextViewport === "desktop") {
          setIsExpanded(true);
          setIsMobileOpen(false);
        }
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isMobile || !isMobileOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isMobile, isMobileOpen]);

  const closeMobileMenu = () => {
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const evaluatorLinks = [
    { name: "Dashboard", path: "/home/evaluator/dashboard", icon: FiGrid },
    {
      name: "Application Request",
      path: "/home/evaluator/requests",
      icon: FiFileText,
    },
    {
      name: "Inspection Review",
      path: "/home/evaluator/inspections",
      icon: FiCheckSquare,
    },
    {
      name: "Audit History",
      path: "/home/evaluator/audit-history",
      icon: FiActivity,
    },
  ];

  const super_adminLinks = [
    { name: "Dashboard", path: "/home/super_admin/dashboard", icon: FiGrid },
    { name: "Officers", path: "/home/super_admin/officers", icon: FiUserCheck },
    { name: "Permits", path: "/home/super_admin/permits", icon: FiClipboard },
    {
      name: "Permit Templates",
      path: "/home/super_admin/permit-templates",
      icon: FiFileText,
    },
    { name: "Process", path: "/home/super_admin/process", icon: FiFileText },
    {
      name: "Audit History",
      path: "/home/super_admin/audit-history",
      icon: FiActivity,
    },
  ];

  const inspectorLinks = [
    { name: "Dashboard", path: "/home/inspector/dashboard", icon: FiGrid },
    {
      name: "Inspection Request",
      path: "/home/inspector/inspection-requests",
      icon: FiSearch,
    },
    {
      name: "Schedule Inspection",
      path: "/home/inspector/schedule-inspection",
      icon: FiCalendar,
    },
    {
      name: "Inspection Assessment",
      path: "/home/inspector/inspection-assessment",
      icon: AiOutlineFileSearch,
    },
    {
      name: "Certificates",
      path: "/home/inspector/certificates",
      icon: GrCertificate,
    },
    {
      name: "Permit Release",
      path: "/home/inspector/permit-release",
      icon: FiClipboard,
    },
    {
      name: "Audit History",
      path: "/home/inspector/audit-history",
      icon: FiActivity,
    },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/home/bplo_admin/dashboard", icon: FiGrid },
    {
      name: "Permit Validity",
      path: "/home/bplo_admin/permit-validity",
      icon: FiSearch,
    },
    {
      name: "Inspection Request",
      path: "/home/bplo_admin/inspection-request",
      icon: FiSearch,
    },
    {
      name: "Permit Approval",
      path: "/home/bplo_admin/permit-approval",
      icon: FiCheckSquare,
    },
    {
      name: "Permit Release",
      path: "/home/bplo_admin/permit-release",
      icon: FiClipboard,
    },
    {
      name: "Payment Received",
      path: "/home/bplo_admin/payment-analytics",
      icon: FiActivity,
    },
    {
      name: "Fee Assessment",
      path: "/home/bplo_admin/fee-assessment",
      icon: FiFileText,
    },
    {
      name: "Audit History",
      path: "/home/bplo_admin/audit-history",
      icon: FiActivity,
    },
  ];

  const departmentTreasurerLinks = [
    {
      name: "Dashboard",
      path: "/home/department_treasurer/dashboard",
      icon: FiGrid,
    },
    {
      name: "Pending Payers",
      path: "/home/department_treasurer/payers-pending",
      icon: FiSearch,
    },
    {
      name: "Paid Payers",
      path: "/home/department_treasurer/payers-paid",
      icon: FiSearch,
    },
    {
      name: "Fee Assessment",
      path: "/home/department_treasurer/fee-assessment",
      icon: FiFileText,
    },
    {
      name: "Audit History",
      path: "/home/department_treasurer/audit-history",
      icon: FiActivity,
    },
  ];

  const mainTreasurerLinks = [
    { name: "Dashboard", path: "/home/main_treasurer/dashboard", icon: FiGrid },
    {
      name: "Payments",
      path: "/home/main_treasurer/payments",
      icon: FiCheckSquare,
    },
    {
      name: "Scan Payment",
      path: "/home/main_treasurer/scan-payment",
      icon: FiCamera,
    },
    {
      name: "Audit History",
      path: "/home/main_treasurer/audit-history",
      icon: FiActivity,
    },
  ];
  const normalizedRole = user?.role?.toUpperCase();

  const linksByRole: Record<string, typeof super_adminLinks> = {
    SUPER_ADMIN: super_adminLinks,
    EVALUATOR: evaluatorLinks,
    INSPECTOR: inspectorLinks,
    BPLO_ADMIN: adminLinks,
    DEPARTMENT_TREASURER: departmentTreasurerLinks,
    MAIN_TREASURER: mainTreasurerLinks,
  };

  const activeLinks = normalizedRole ? (linksByRole[normalizedRole] ?? []) : [];
  const accountPathByRole: Record<string, string> = {
    SUPER_ADMIN: "/home/super_admin/account",
    EVALUATOR: "/home/evaluator/account",
    INSPECTOR: "/home/inspector/account",
    BPLO_ADMIN: "/home/bplo_admin/account",
    DEPARTMENT_TREASURER: "/home/department_treasurer/account",
    MAIN_TREASURER: "/home/main_treasurer/account",
  };
  const accountPath = normalizedRole
    ? (accountPathByRole[normalizedRole] ?? "/home")
    : "/home";
  const canAccessAccount = Boolean(
    normalizedRole && accountPathByRole[normalizedRole],
  );
  const mobileQuickLinks = activeLinks.slice(0, 3);
  const mobileOverflowLinks = activeLinks.slice(3);
  const mobileMenuItems = isMobile
    ? [
        ...mobileOverflowLinks,
        ...(canAccessAccount
          ? [{ name: "Account", path: accountPath, icon: FiUser }]
          : []),
      ]
    : [];
  const drawerLinks = isMobile ? mobileOverflowLinks : activeLinks;
  const isMobileDrawerEmpty = isMobile && mobileMenuItems.length === 0;
  const showSidebarPanel = !isMobile || isMobileOpen;

  const mobileDockItems: DockItemData[] = [
    ...mobileQuickLinks.map((link) => {
      const isActive =
        link.name === "Dashboard"
          ? location.pathname === link.path
          : location.pathname.startsWith(link.path);
      const tourTarget = getSuperAdminTourTargetByPath(link.path);

      return {
        icon: <link.icon size={18} />,
        label: getMobileNavLabel(link.name),
        onClick: () => navigate(link.path),
        isActive,
        tourTarget,
      };
    }),
    {
      icon: <FiMenu size={18} />,
      label: "Menu",
      onClick: () => setIsMobileOpen(true),
      isActive: isMobileOpen,
    },
  ];

  // Framer motion spring configuration for the sliding effect
  const springTransition = {
    type: "spring",
    stiffness: 180,
    damping: 26,
    mass: 0.9,
  } as const;

  return (
    <>
      {isMobile && !isMobileOpen && (
        <Dock
          items={mobileDockItems}
          panelHeight={68}
          baseItemSize={50}
          magnification={70}
          className="fixed bottom-3 left-1/2 z-50 w-[calc(100vw-1rem)] max-w-[24rem] -translate-x-1/2 rounded-[1.7rem] border border-white/10 bg-[#0F2942]/94 p-2 shadow-[0_18px_40px_rgba(15,41,66,0.30)] backdrop-blur-xl"
        />
      )}

      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-[1px] z-30 md:hidden transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {showSidebarPanel && (
        <aside
          className={`
            bg-[#0F2942] flex flex-col shrink-0
            transition-[width,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform
            ${
              isMobile
                ? "fixed inset-x-3 bottom-3 z-40 rounded-4xl border border-white/10 pb-4 shadow-[0_22px_60px_rgba(2,12,27,0.45)]"
                : isExpanded
                  ? "fixed lg:relative left-0 top-0 h-full translate-x-0 w-64 lg:w-72 xl:w-75 justify-between"
                  : "fixed lg:relative left-0 top-0 h-full translate-x-0 w-21.5 justify-between"
            }
          `}
        >
          {isMobile && (
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1 rounded-full bg-white/35" />
            </div>
          )}

          <div
            className={
              isMobile
                ? "overflow-hidden"
                : "flex-1 overflow-y-auto overflow-x-hidden no-scrollbar"
            }
          >
            <div
              className={`${
                isMobile
                  ? "px-5 pb-4 pt-3 border-b border-white/10"
                  : "p-4 md:p-6 h-20 md:h-24"
              } flex items-center text-white ${
                isExpanded || isMobile ? "justify-between" : "justify-center"
              }`}
            >
              {(isExpanded || isMobile) && (
                <div className="flex items-center gap-3 pl-2">
                  {isMobile && (
                    <img
                      src={activeLogo}
                      alt="BPLO logo"
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <h2 className="text-2xl md:text-3xl font-black tracking-widest">
                    BPLO
                  </h2>
                </div>
              )}

              {!isMobile && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-white hover:text-[#00A3FF] transition-colors cursor-pointer z-50 relative"
                  aria-label="Toggle sidebar"
                >
                  {isExpanded ? (
                    <FiChevronsLeft className="text-2xl text-[#F2C94C]" />
                  ) : (
                    <FiChevronsRight className="text-2xl text-[#F2C94C]" />
                  )}
                </button>
              )}

              {isMobile && (
                <button
                  onClick={closeMobileMenu}
                  className="text-white hover:text-[#00A3FF] bg-white/10 hover:bg-white/15 transition-colors cursor-pointer md:hidden z-50 relative rounded-full w-10 h-10 flex items-center justify-center"
                  aria-label="Close sidebar"
                >
                  <FiX className="text-2xl" />
                </button>
              )}
            </div>

            {isMobile ? (
              <div className="pt-4 px-4">
                {isMobileDrawerEmpty && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-white/80">
                    All main pages are already available in the bottom
                    navigation.
                  </div>
                )}

                {!isMobileDrawerEmpty && (
                  <div className="grid grid-cols-2 gap-3">
                    {mobileMenuItems.map((link) => (
                      <NavLink
                        key={link.name}
                        to={link.path}
                        data-super-admin-tour={getSuperAdminTourTargetByPath(
                          link.path,
                        )}
                        end={
                          link.name === "Dashboard" || link.name === "Account"
                        }
                        onClick={closeMobileMenu}
                        className={
                          mobileMenuItems.length === 1 ? "col-span-2" : "block"
                        }
                      >
                        {({ isActive }) => (
                          <div
                            className={`flex min-h-30 flex-col justify-between rounded-[1.4rem] border px-3.5 py-3.5 transition-all duration-300 ${
                              isActive
                                ? "bg-[#FAFAF8] text-[#0A2236] border-transparent shadow-[0_12px_28px_rgba(0,0,0,0.16)]"
                                : "bg-white/5 text-white border-white/10"
                            }`}
                          >
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                                isActive
                                  ? "bg-[#0A2236]/10 text-[#0A2236]"
                                  : "bg-[#0A2236] text-[#F2C94C]"
                              }`}
                            >
                              <link.icon className="text-xl" />
                            </div>
                            <div className="mt-4">
                              <span
                                className={`block text-[10px] font-black uppercase tracking-[0.18em] ${
                                  isActive
                                    ? "text-[#0A2236]/55"
                                    : "text-white/50"
                                }`}
                              >
                                More
                              </span>
                              <span className="mt-1 block text-sm font-semibold leading-snug">
                                {link.name}
                              </span>
                            </div>
                          </div>
                        )}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                {drawerLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    end={link.name === "Dashboard"}
                    data-super-admin-tour={getSuperAdminTourTargetByPath(
                      link.path,
                    )}
                    onClick={closeMobileMenu}
                    className="flex items-center w-full group relative"
                  >
                    {({ isActive }) => (
                      <>
                        {/* ICON CONTAINER */}
                        <div
                          className={`relative flex items-center justify-center shrink-0 transition-all duration-500 ${
                            isExpanded || isMobile ? "w-18" : "w-full py-3"
                          }`}
                        >
                          {/* Collapsed Magic Sliding Background */}
                          {!isExpanded && !isMobile && isActive && (
                            <motion.div
                              layoutId="collapsedNavBg"
                              transition={springTransition}
                              className="absolute inset-y-0 right-0 left-3 bg-[#FAFAF8] rounded-l-full z-0"
                            />
                          )}
                          <link.icon className="text-3xl text-[#F2C94C] relative z-10" />
                        </div>

                        {/* TEXT PILL CONTAINER */}
                        {(isExpanded || isMobile) && (
                          <div
                            className={`flex-1 relative flex items-center h-13 pl-5 pr-3 transition-colors duration-300 ${
                              isActive
                                ? "text-[#0A2236]"
                                : "text-gray-200 hover:text-white"
                            }`}
                          >
                            {/* Expanded Magic Sliding Background */}
                            {isActive && (
                              <motion.div
                                layoutId="expandedNavBg"
                                transition={springTransition}
                                className="absolute inset-0 bg-[#FAFAF8] rounded-l-full shadow-[inset_0_3px_8px_rgba(0,0,0,0.06)] z-0"
                              >
                                {/* Cutout curves */}
                                <div className="absolute -top-4 right-0 w-4 h-4 bg-transparent rounded-br-full shadow-[4px_4px_0_4px_#FAFAF8]"></div>
                                <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent rounded-tr-full shadow-[4px_-4px_0_4px_#FAFAF8]"></div>
                              </motion.div>
                            )}

                            <span
                              className={`${getSidebarLabelTextClassName(link.name)} uppercase relative z-10 whitespace-nowrap transition-all duration-300 ${
                                isActive ? "font-black" : "font-semibold"
                              }`}
                            >
                              {link.name}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* --- BOTTOM SECTION --- */}
          <div
            className={`shrink-0 flex flex-col ${
              isMobile ? "px-4 pt-4" : "mb-6 md:mb-8 pt-4"
            }`}
          >
            {!isMobile && canAccessAccount && (
              <div className="flex flex-col mb-4 border-t border-white/10 pt-4">
                <NavLink
                  to={accountPath}
                  data-super-admin-tour={getSuperAdminTourTargetByPath(
                    accountPath,
                  )}
                  onClick={closeMobileMenu}
                  className="w-full group relative flex items-center"
                >
                  {({ isActive }) => (
                    <>
                      {/* ICON CONTAINER */}
                      <div
                        className={`relative flex items-center justify-center shrink-0 transition-all duration-500 ${
                          isExpanded || isMobile ? "w-18" : "w-full py-3"
                        }`}
                      >
                        {/* Collapsed Magic Sliding Background */}
                        {!isExpanded && !isMobile && isActive && (
                          <motion.div
                            layoutId="collapsedNavBg"
                            transition={springTransition}
                            className="absolute inset-y-0 right-0 left-3 bg-[#FAFAF8] rounded-l-full z-0"
                          />
                        )}
                        <FiUser className="text-3xl text-[#F2C94C] relative z-10" />
                      </div>

                      {/* TEXT PILL CONTAINER */}
                      {(isExpanded || isMobile) && (
                        <div
                          className={`flex-1 relative flex items-center h-13 pl-5 pr-3 transition-colors duration-300 ${
                            isActive
                              ? "text-[#0A2236]"
                              : "text-gray-200 hover:text-white"
                          }`}
                        >
                          {/* Expanded Magic Sliding Background */}
                          {isActive && (
                            <motion.div
                              layoutId="expandedNavBg"
                              transition={springTransition}
                              className="absolute inset-0 bg-[#FAFAF8] rounded-l-full shadow-[inset_0_3px_8px_rgba(0,0,0,0.06)] z-0"
                            >
                              {/* Cutout curves */}
                              <div className="absolute -top-4 right-0 w-4 h-4 bg-transparent rounded-br-full shadow-[4px_4px_0_4px_#FAFAF8]"></div>
                              <div className="absolute -bottom-4 right-0 w-4 h-4 bg-transparent rounded-tr-full shadow-[4px_-4px_0_4px_#FAFAF8]"></div>
                            </motion.div>
                          )}

                          <span
                            className={`${getSidebarLabelTextClassName("Account")} uppercase relative z-10 whitespace-nowrap transition-all duration-300 ${
                              isActive ? "font-black" : "font-semibold"
                            }`}
                          >
                            Account
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            )}

            {/* Profile & Logout */}
            <div
              className={`${
                isMobile
                  ? "rounded-2xl border border-white/10 bg-white/6 px-4 py-4"
                  : "px-4 md:px-6 flex flex-col gap-5"
              } ${isExpanded || isMobile ? "" : "items-center"}`}
            >
              <LogoutBtn
                onLoggedOut={closeMobileMenu}
                iconSize={20}
                className={`${
                  isExpanded || isMobile
                    ? `w-full px-4 text-sm ${isMobile ? "mt-4 rounded-2xl py-3.5" : "py-3 rounded-2xl"}`
                    : "w-11 h-11 rounded-2xl px-0"
                }`}
                labelClassName={isExpanded || isMobile ? "" : "sr-only"}
              />
            </div>
          </div>
        </aside>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
