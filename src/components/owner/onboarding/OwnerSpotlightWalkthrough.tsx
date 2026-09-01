/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiLoader,
  FiX,
} from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";

import { useOwnerWalkthroughStore } from "@/stores/owner/owner-walkthrough.store";
import { OWNER_WALKTHROUGH_STORAGE_KEY_PREFIX } from "./shared";

type SpotlightStep = {
  id: string;
  route: string;
  selector: string;
  title: string;
  description: string;
};

type TargetRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  borderRadius: string;
};

type WalkthroughPanelLayout = {
  isMobile: boolean;
  style: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    width?: string;
    maxWidth?: string;
    maxHeight?: string;
  };
};

const spotlightSteps: SpotlightStep[] = [
  {
    id: "dashboard-hero",
    route: "/home/user/dashboard",
    selector: '[data-owner-tour="dashboard-hero"]',
    title: "Owner dashboard",
    description:
      "This is your main workspace where you can quickly monitor permit progress and updates.",
  },
  {
    id: "application-request-page",
    route: "/home/user/application-request",
    selector: '[data-owner-tour="application-request-header"]',
    title: "Create a new permit request",
    description:
      "Pick the permit type and submit your details to start your application flow.",
  },
  {
    id: "application-status-page",
    route: "/home/user/application-status",
    selector: '[data-owner-tour="status-application-header"]',
    title: "Track evaluation status",
    description:
      "Use this page to monitor evaluation results and check the next action for each permit.",
  },
  {
    id: "inspection-status-page",
    route: "/home/user/inspection-status",
    selector: '[data-owner-tour="status-inspection-header"]',
    title: "Inspection milestones",
    description:
      "Check inspection schedules, inspector feedback, and inspection outcomes here.",
  },
  {
    id: "payment-status-page",
    route: "/home/user/payment-status",
    selector: '[data-owner-tour="status-payment-header"]',
    title: "Payment updates",
    description:
      "Track fee assessment and payment confirmation before final permit release.",
  },
  {
    id: "account-settings-page",
    route: "/home/user/account",
    selector: '[data-owner-tour="account-settings-shell"]',
    title: "Account settings",
    description:
      "Keep your profile and password updated here to secure and maintain your owner account.",
  },
];

type OwnerSpotlightWalkthroughProps = {
  accountIdentifier: string;
  isBusinessOwner: boolean;
  isBusinessOwnerRoute: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const MOBILE_OWNER_DOCK_OFFSET_PX = 88;
const TARGET_RECT_EPSILON = 0.75;
const DESKTOP_PANEL_WIDTH_PX = 420;

const areTargetRectsEqual = (
  left: TargetRect | null,
  right: TargetRect | null,
) => {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return (
    Math.abs(left.top - right.top) < TARGET_RECT_EPSILON &&
    Math.abs(left.left - right.left) < TARGET_RECT_EPSILON &&
    Math.abs(left.width - right.width) < TARGET_RECT_EPSILON &&
    Math.abs(left.height - right.height) < TARGET_RECT_EPSILON &&
    left.borderRadius === right.borderRadius
  );
};

const getWalkthroughPanelLayout = (
  targetRect: TargetRect | null,
): WalkthroughPanelLayout => {
  const viewportWidth = window.innerWidth;
  const isMobile = viewportWidth < 1024;

  if (isMobile || !targetRect) {
    return {
      isMobile: true,
      style: {
        left: "14px",
        right: "14px",
        bottom: `calc(max(10px, env(safe-area-inset-bottom)) + ${MOBILE_OWNER_DOCK_OFFSET_PX}px)`,
        maxHeight: `min(20rem, calc(100dvh - ${MOBILE_OWNER_DOCK_OFFSET_PX + 28}px - env(safe-area-inset-bottom)))`,
      },
    };
  }

  return {
    isMobile: false,
    style: {
      top: "50%",
      right: "1.75rem",
      width: `min(${DESKTOP_PANEL_WIDTH_PX}px, calc(100vw - 3.5rem))`,
      maxWidth: `${DESKTOP_PANEL_WIDTH_PX}px`,
      maxHeight: "calc(100dvh - 3.5rem)",
    },
  };
};

const findVisibleTarget = (selector: string) => {
  const candidates = Array.from(
    document.querySelectorAll<HTMLElement>(selector),
  );

  for (const candidate of candidates) {
    const rect = candidate.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(candidate);

    if (
      rect.width <= 2 ||
      rect.height <= 2 ||
      computedStyle.display === "none" ||
      computedStyle.visibility === "hidden" ||
      computedStyle.opacity === "0"
    ) {
      continue;
    }

    return candidate;
  }

  return null;
};

export default function OwnerSpotlightWalkthrough({
  accountIdentifier,
  isBusinessOwner,
  isBusinessOwnerRoute,
}: OwnerSpotlightWalkthroughProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const scrolledStepRef = useRef<string>("");
  const targetRectRef = useRef<TargetRect | null>(null);
  const targetReadyRef = useRef(false);
  const startSignal = useOwnerWalkthroughStore((state) => state.startSignal);

  const storageKey = useMemo(() => {
    const normalizedIdentifier = accountIdentifier.trim();
    if (!normalizedIdentifier) return "";

    return `${OWNER_WALKTHROUGH_STORAGE_KEY_PREFIX}:${normalizedIdentifier}`;
  }, [accountIdentifier]);

  const activeStep = spotlightSteps[activeStepIndex];
  const isLastStep = activeStepIndex >= spotlightSteps.length - 1;
  const progressText = `${activeStepIndex + 1} / ${spotlightSteps.length}`;
  const progressPercent = Math.round(
    ((activeStepIndex + 1) / spotlightSteps.length) * 100,
  );

  const markWalkthroughCompleted = () => {
    if (storageKey) {
      window.localStorage.setItem(storageKey, "1");
    }
  };

  const closeWalkthrough = (options?: { completed?: boolean }) => {
    if (options?.completed) {
      markWalkthroughCompleted();
    }
    setIsOpen(false);
    setTargetRect(null);
    setTargetReady(false);
    targetRectRef.current = null;
    targetReadyRef.current = false;
    scrolledStepRef.current = "";
  };

  const startWalkthrough = () => {
    setActiveStepIndex(0);
    setIsOpen(true);
    setTargetRect(null);
    setTargetReady(false);
    targetRectRef.current = null;
    targetReadyRef.current = false;
    scrolledStepRef.current = "";
  };

  useEffect(() => {
    if (!isBusinessOwner || !isBusinessOwnerRoute || !storageKey || isOpen) {
      return;
    }

    const hasCompletedWalkthrough =
      window.localStorage.getItem(storageKey) === "1";

    if (!hasCompletedWalkthrough) {
      startWalkthrough();
    }
  }, [isBusinessOwner, isBusinessOwnerRoute, storageKey, isOpen]);

  useEffect(() => {
    if (!startSignal) return;
    if (!isBusinessOwner || !isBusinessOwnerRoute) return;
    startWalkthrough();
  }, [startSignal, isBusinessOwner, isBusinessOwnerRoute]);

  useEffect(() => {
    if (!isOpen || !isBusinessOwnerRoute) return;

    if (location.pathname !== activeStep.route) {
      navigate(activeStep.route);
      setTargetReady(false);
      setTargetRect(null);
      targetReadyRef.current = false;
      targetRectRef.current = null;
    }
  }, [
    activeStep.route,
    isBusinessOwnerRoute,
    isOpen,
    location.pathname,
    navigate,
  ]);

  useEffect(() => {
    if (!isOpen || !isBusinessOwnerRoute) return;

    let animationFrameId: number | null = null;

    const updateTargetState = (nextRect: TargetRect | null, ready: boolean) => {
      if (!areTargetRectsEqual(targetRectRef.current, nextRect)) {
        targetRectRef.current = nextRect;
        setTargetRect(nextRect);
      }

      if (targetReadyRef.current !== ready) {
        targetReadyRef.current = ready;
        setTargetReady(ready);
      }
    };

    const refreshTarget = () => {
      if (location.pathname !== activeStep.route) {
        updateTargetState(null, false);
        return;
      }

      const targetElement = findVisibleTarget(activeStep.selector);
      if (!targetElement) {
        updateTargetState(null, false);
        return;
      }

      const scrollStepKey = `${activeStep.id}:${location.pathname}`;
      if (scrolledStepRef.current !== scrollStepKey) {
        targetElement.scrollIntoView({
          block: "center",
          inline: "center",
          behavior: targetRectRef.current ? "auto" : "smooth",
        });
        scrolledStepRef.current = scrollStepKey;
      }

      const rawRect = targetElement.getBoundingClientRect();
      const padding = 10;
      const left = clamp(rawRect.left - padding, 8, window.innerWidth - 8);
      const top = clamp(rawRect.top - padding, 8, window.innerHeight - 8);
      const width = clamp(
        rawRect.width + padding * 2,
        8,
        window.innerWidth - 16,
      );
      const height = clamp(
        rawRect.height + padding * 2,
        8,
        window.innerHeight - 16,
      );
      const computedStyle = window.getComputedStyle(targetElement);
      const borderRadius = computedStyle.borderRadius || "2rem";

      updateTargetState(
        {
          left,
          top,
          width,
          height,
          borderRadius,
        },
        true,
      );
    };

    const scheduleRefresh = () => {
      if (animationFrameId !== null) return;

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        refreshTarget();
      });
    };

    refreshTarget();

    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("scroll", scheduleRefresh, true);

    return () => {
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("scroll", scheduleRefresh, true);
    };
  }, [
    activeStep.id,
    activeStep.route,
    activeStep.selector,
    isBusinessOwnerRoute,
    isOpen,
    location.pathname,
  ]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeWalkthrough();
        return;
      }

      if (event.key === "ArrowLeft") {
        setActiveStepIndex((previous) => Math.max(previous - 1, 0));
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveStepIndex((previous) =>
          Math.min(previous + 1, spotlightSteps.length - 1),
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !isBusinessOwner || !isBusinessOwnerRoute) {
    return null;
  }

  const targetRight = targetRect ? targetRect.left + targetRect.width : 0;
  const targetBottom = targetRect ? targetRect.top + targetRect.height : 0;
  const panelLayout = getWalkthroughPanelLayout(targetRect);
  const progressLabel = `Step ${progressText}`;

  return (
    <>
      {targetRect ? (
        <>
          <div
            className="fixed z-118 bg-slate-950/58"
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: `${targetRect.top}px`,
            }}
          />
          <div
            className="fixed z-118 bg-slate-950/58"
            style={{
              top: `${targetRect.top}px`,
              left: 0,
              width: `${targetRect.left}px`,
              height: `${targetRect.height}px`,
            }}
          />
          <div
            className="fixed z-118 bg-slate-950/58"
            style={{
              top: `${targetRect.top}px`,
              left: `${targetRight}px`,
              right: 0,
              height: `${targetRect.height}px`,
            }}
          />
          <div
            className="fixed z-118 bg-slate-950/58"
            style={{
              top: `${targetBottom}px`,
              left: 0,
              width: "100%",
              bottom: 0,
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-118 bg-slate-950/58" />
      )}

      {targetRect && (
        <div
          className="pointer-events-none fixed z-119 border-2 border-[#F2C94C] shadow-[0_0_0_1px_rgba(242,201,76,0.1),0_24px_48px_rgba(15,41,66,0.14)] transition-[top,left,width,height,border-radius] duration-300 ease-out"
          style={{
            left: `${targetRect.left}px`,
            top: `${targetRect.top}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            borderRadius: targetRect.borderRadius,
          }}
        />
      )}

      <section
        className={`fixed z-120 mx-auto overflow-hidden border border-[#D8E1EB] bg-white shadow-[0_20px_56px_rgba(2,12,27,0.3)] ${
          panelLayout.isMobile
            ? "rounded-[1.5rem]"
            : "-translate-y-1/2 rounded-[2rem]"
        }`}
        style={panelLayout.style}
      >
        <div className="border-b border-[#E8EEF5] bg-[#173654] px-3.5 py-3 text-white sm:px-5 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#F2C94C] sm:text-[10px]">
                Owner Guided Tour
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-white/78 sm:mt-1 sm:text-xs">
                {progressLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={() => closeWalkthrough({ completed: true })}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/28 bg-white/16 text-white transition-colors hover:bg-white/24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F2C94C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#173654] sm:h-9 sm:w-9"
              aria-label="Close guided walkthrough"
            >
              <FiX />
            </button>
          </div>

          <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/16 sm:mt-3">
            <div
              className="h-full rounded-full bg-[#F2C94C] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="max-h-[inherit] overflow-y-auto px-3.5 py-3.5 sm:px-5 sm:py-5">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <h3 className="text-[1.05rem] font-black leading-[1.05] tracking-[-0.03em] text-[#18314C] sm:text-[2rem]">
                {activeStep.title}
              </h3>
              <p className="mt-2 text-[13px] leading-7 text-slate-600 sm:mt-3 sm:text-base sm:leading-8">
                {activeStep.description}
              </p>
            </div>

            {!targetReady && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E7EDF4] bg-[#F8FBFF] px-3 py-1.5 text-[11px] font-semibold text-slate-600 sm:px-3 sm:py-2 sm:text-xs">
                <FiLoader className="animate-spin" />
                Preparing focus target...
              </div>
            )}

            <div className="flex flex-col gap-2.5 border-t border-[#E8EEF5] pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <button
                type="button"
                onClick={() => closeWalkthrough({ completed: true })}
                className="order-2 inline-flex min-h-10 items-center rounded-[0.95rem] border border-[#D6DFE9] px-3.5 py-2 text-left text-sm font-semibold text-[#4A5D74] transition-colors hover:bg-[#F6FAFD] hover:text-[#21364E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173654]/35 sm:order-1 sm:min-h-11 sm:px-4 sm:text-base"
              >
                Skip tour
              </button>

              <div className="order-1 flex w-full items-center gap-2 sm:order-2 sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    setActiveStepIndex((previous) => Math.max(previous - 1, 0))
                  }
                  disabled={activeStepIndex === 0}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-[1rem] border border-[#D6DFE9] px-3 py-2 text-sm font-semibold text-[#0F2942] transition-colors hover:bg-[#F4F8FC] disabled:cursor-not-allowed disabled:opacity-45 sm:min-h-11 sm:min-w-28 sm:flex-none sm:px-4 sm:py-2.5 sm:text-base"
                >
                  <FiArrowLeft />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isLastStep) {
                      closeWalkthrough({ completed: true });
                      return;
                    }

                    setActiveStepIndex((previous) =>
                      Math.min(previous + 1, spotlightSteps.length - 1),
                    );
                  }}
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-[1rem] bg-[#173654] px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-[#0F2942] sm:min-h-11 sm:min-w-28 sm:flex-none sm:px-4 sm:py-2.5 sm:text-base"
                >
                  {isLastStep ? (
                    <>
                      <FiCheckCircle />
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <FiArrowRight />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
