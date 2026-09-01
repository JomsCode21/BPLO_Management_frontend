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

import { useEvaluatorWalkthroughStore } from "@/stores/evaluator/evaluator-walkthrough.store";

import { EVALUATOR_WALKTHROUGH_STORAGE_KEY_PREFIX } from "./shared";

type SpotlightStep = {
  id: string;
  route: string;
  selector: string;
  navSelector: string;
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
    route: "/home/evaluator/dashboard",
    selector: '[data-evaluator-tour="dashboard-hero"]',
    navSelector: '[data-super-admin-tour="nav-dashboard"]',
    title: "Evaluator dashboard",
    description:
      "This dashboard summarizes request load, inspection flow progress, and department routing pressure.",
  },
  {
    id: "requests-page",
    route: "/home/evaluator/requests",
    selector: '[data-evaluator-tour="requests-header"]',
    navSelector: '[data-super-admin-tour="nav-requests"]',
    title: "Application requests",
    description:
      "Review submitted applications and record evaluator decisions to route each permit correctly.",
  },
  {
    id: "inspections-page",
    route: "/home/evaluator/inspections",
    selector: '[data-evaluator-tour="inspections-header"]',
    navSelector: '[data-super-admin-tour="nav-inspections"]',
    title: "Inspection review",
    description:
      "Track department inspection outcomes and submit completed flows for BPLO admin approval.",
  },
  {
    id: "audit-history-page",
    route: "/home/evaluator/audit-history",
    selector: '[data-evaluator-tour="audit-history-header"]',
    navSelector: '[data-super-admin-tour="nav-audit-history"]',
    title: "Workflow history",
    description:
      "Filter evaluator workflow events to verify routing decisions and timeline changes across records.",
  },
  {
    id: "account-settings-page",
    route: "/home/evaluator/account",
    selector: '[data-evaluator-tour="account-settings-shell"]',
    navSelector: '[data-super-admin-tour="nav-account-settings"]',
    title: "Account settings",
    description:
      "Keep your evaluator profile and password updated to secure account access.",
  },
];

type EvaluatorSpotlightWalkthroughProps = {
  accountIdentifier: string;
  isEvaluator: boolean;
  isEvaluatorRoute: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const MOBILE_EMPLOYEE_DOCK_OFFSET_PX = 88;
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

const toOverlayCutoutPath = (rect: TargetRect) =>
  `M${rect.left},${rect.top}h${rect.width}v${rect.height}h-${rect.width}Z`;

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
        bottom: `calc(max(10px, env(safe-area-inset-bottom)) + ${MOBILE_EMPLOYEE_DOCK_OFFSET_PX}px)`,
        maxHeight: `min(20rem, calc(100dvh - ${MOBILE_EMPLOYEE_DOCK_OFFSET_PX + 28}px - env(safe-area-inset-bottom)))`,
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

export default function EvaluatorSpotlightWalkthrough({
  accountIdentifier,
  isEvaluator,
  isEvaluatorRoute,
}: EvaluatorSpotlightWalkthroughProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [navRect, setNavRect] = useState<TargetRect | null>(null);
  const [targetReady, setTargetReady] = useState(false);
  const [showPreparingIndicator, setShowPreparingIndicator] = useState(false);
  const spotlightedElementsRef = useRef<HTMLElement[]>([]);
  const scrolledStepRef = useRef<string>("");
  const targetRectRef = useRef<TargetRect | null>(null);
  const navRectRef = useRef<TargetRect | null>(null);
  const targetReadyRef = useRef(false);
  const startSignal = useEvaluatorWalkthroughStore(
    (state) => state.startSignal,
  );

  const storageKey = useMemo(() => {
    const normalizedIdentifier = accountIdentifier.trim();
    if (!normalizedIdentifier) return "";

    return `${EVALUATOR_WALKTHROUGH_STORAGE_KEY_PREFIX}:${normalizedIdentifier}`;
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

  const clearSpotlightedElements = () => {
    for (const element of spotlightedElementsRef.current) {
      delete element.dataset.evaluatorWalkthroughSpotlight;
    }
    spotlightedElementsRef.current = [];
  };

  const markSpotlightedElement = (
    element: HTMLElement | null,
    kind: "target" | "nav",
  ) => {
    if (!element) return;
    if (!spotlightedElementsRef.current.includes(element)) {
      spotlightedElementsRef.current.push(element);
    }
    element.dataset.evaluatorWalkthroughSpotlight = kind;
  };

  const closeWalkthrough = (options?: { completed?: boolean }) => {
    if (options?.completed) {
      markWalkthroughCompleted();
    }

    clearSpotlightedElements();
    setIsOpen(false);
    setTargetRect(null);
    setNavRect(null);
    setTargetReady(false);
    setShowPreparingIndicator(false);
    targetRectRef.current = null;
    navRectRef.current = null;
    targetReadyRef.current = false;
    scrolledStepRef.current = "";
  };

  const startWalkthrough = () => {
    clearSpotlightedElements();
    setActiveStepIndex(0);
    setIsOpen(true);
    setTargetRect(null);
    setNavRect(null);
    setTargetReady(false);
    setShowPreparingIndicator(false);
    targetRectRef.current = null;
    navRectRef.current = null;
    targetReadyRef.current = false;
    scrolledStepRef.current = "";
  };

  useEffect(() => {
    if (!isEvaluator || !isEvaluatorRoute || !storageKey || isOpen) {
      return;
    }

    const hasCompletedWalkthrough =
      window.localStorage.getItem(storageKey) === "1";

    if (!hasCompletedWalkthrough) {
      startWalkthrough();
    }
  }, [isEvaluator, isEvaluatorRoute, storageKey, isOpen]);

  useEffect(() => {
    if (!startSignal) return;
    if (!isEvaluator || !isEvaluatorRoute) return;
    startWalkthrough();
  }, [startSignal, isEvaluator, isEvaluatorRoute]);

  useEffect(() => {
    if (!isOpen || !isEvaluatorRoute) return;

    if (location.pathname !== activeStep.route) {
      navigate(activeStep.route);
      setTargetReady(false);
      setShowPreparingIndicator(false);
      setTargetRect(null);
      setNavRect(null);
      targetReadyRef.current = false;
      targetRectRef.current = null;
      navRectRef.current = null;
    }
  }, [activeStep.route, isOpen, isEvaluatorRoute, location.pathname, navigate]);

  useEffect(() => {
    if (!isOpen || !isEvaluatorRoute) return;

    let animationFrameId: number | null = null;
    let mutationObserver: MutationObserver | null = null;
    let retryTimeoutId: number | null = null;

    const updateTargetState = (
      nextRect: TargetRect | null,
      nextNavRect: TargetRect | null,
      ready: boolean,
    ) => {
      if (!areTargetRectsEqual(targetRectRef.current, nextRect)) {
        targetRectRef.current = nextRect;
        setTargetRect(nextRect);
      }

      if (!areTargetRectsEqual(navRectRef.current, nextNavRect)) {
        navRectRef.current = nextNavRect;
        setNavRect(nextNavRect);
      }

      if (targetReadyRef.current !== ready) {
        targetReadyRef.current = ready;
        setTargetReady(ready);
      }
    };

    const toSpotlightRect = (element: HTMLElement, padding: number) => {
      const rawRect = element.getBoundingClientRect();
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
      const computedStyle = window.getComputedStyle(element);

      return {
        left,
        top,
        width,
        height,
        borderRadius: computedStyle.borderRadius || "2rem",
      };
    };

    const refreshTarget = () => {
      if (location.pathname !== activeStep.route) {
        clearSpotlightedElements();
        updateTargetState(null, null, false);
        return;
      }

      const targetElement = findVisibleTarget(activeStep.selector);
      const navElement = findVisibleTarget(activeStep.navSelector);
      if (!targetElement) {
        clearSpotlightedElements();
        markSpotlightedElement(navElement, "nav");
        updateTargetState(
          null,
          navElement ? toSpotlightRect(navElement, 6) : null,
          false,
        );

        if (retryTimeoutId === null) {
          retryTimeoutId = window.setTimeout(() => {
            retryTimeoutId = null;
            scheduleRefresh();
          }, 70);
        }
        return;
      }

      clearSpotlightedElements();
      markSpotlightedElement(targetElement, "target");
      markSpotlightedElement(navElement, "nav");

      const scrollStepKey = `${activeStep.id}:${location.pathname}`;
      if (scrolledStepRef.current !== scrollStepKey) {
        targetElement.scrollIntoView({
          block: "center",
          inline: "center",
          behavior: "auto",
        });
        scrolledStepRef.current = scrollStepKey;
      }

      updateTargetState(
        toSpotlightRect(targetElement, 10),
        navElement ? toSpotlightRect(navElement, 6) : null,
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
    scheduleRefresh();

    window.addEventListener("resize", scheduleRefresh);
    window.addEventListener("scroll", scheduleRefresh, true);
    mutationObserver = new MutationObserver(() => {
      scheduleRefresh();
    });
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearSpotlightedElements();
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
      if (retryTimeoutId !== null) {
        window.clearTimeout(retryTimeoutId);
      }
      mutationObserver?.disconnect();
      window.removeEventListener("resize", scheduleRefresh);
      window.removeEventListener("scroll", scheduleRefresh, true);
    };
  }, [
    activeStep.id,
    activeStep.navSelector,
    activeStep.route,
    activeStep.selector,
    isOpen,
    isEvaluatorRoute,
    location.pathname,
  ]);

  useEffect(() => {
    if (!isOpen || targetReady) {
      setShowPreparingIndicator(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPreparingIndicator(true);
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen, targetReady, activeStepIndex]);

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

  if (!isOpen || !isEvaluator || !isEvaluatorRoute) {
    return null;
  }

  const panelLayout = getWalkthroughPanelLayout(targetRect);
  const progressLabel = `Step ${progressText}`;
  const viewportPath = `M0,0H${window.innerWidth}V${window.innerHeight}H0Z`;
  const cutoutPath = [targetRect, navRect]
    .filter((rect): rect is TargetRect => Boolean(rect))
    .map(toOverlayCutoutPath)
    .join(" ");
  const overlayPath = cutoutPath ? `${viewportPath} ${cutoutPath}` : viewportPath;

  return (
    <>
      <svg
        className="pointer-events-none fixed inset-0 z-118"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <path d={overlayPath} fill="rgba(2, 6, 23, 0.58)" fillRule="evenodd" />
      </svg>

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

      {navRect && (
        <div
          className="pointer-events-none fixed z-119 border-2 border-[#F2C94C] shadow-[0_0_0_1px_rgba(242,201,76,0.1),0_18px_36px_rgba(15,41,66,0.18)] transition-[top,left,width,height,border-radius] duration-300 ease-out"
          style={{
            left: `${navRect.left}px`,
            top: `${navRect.top}px`,
            width: `${navRect.width}px`,
            height: `${navRect.height}px`,
            borderRadius: navRect.borderRadius,
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
                Evaluator Tour
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

            {!targetReady && showPreparingIndicator && (
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

      <style>{`
        [data-evaluator-walkthrough-spotlight="target"] {
          position: relative !important;
          z-index: 119 !important;
          isolation: isolate;
        }

        [data-evaluator-walkthrough-spotlight="nav"] {
          position: relative !important;
          z-index: 121 !important;
          isolation: isolate;
        }

        [data-evaluator-walkthrough-spotlight="nav"] > * {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
