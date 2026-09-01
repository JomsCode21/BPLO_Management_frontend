import { motion, type Variants } from "motion/react";

interface InspectionStep {
  processId: string;
  processName: string;
  sequence: number;
  assignedInspectorName?: string;
  stage: "queued" | "current" | "scheduled" | "rescheduled" | "completed";
  feedback?: string;
  scheduledInspectionAt?: string | null;
  scheduleRemark?: string;
}

interface InspectionStepperProps {
  steps: InspectionStep[];
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  const lineVariants: Variants = {
    incomplete: { scaleX: 0 },
    complete: { scaleX: 1 },
  };

  return (
    <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded bg-[#D9DEE6]">
      <motion.div
        className="absolute left-0 top-0 h-full w-full origin-left bg-[#0F2942]"
        variants={lineVariants}
        initial={false}
        animate={isComplete ? "complete" : "incomplete"}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          delay: 0.1,
          type: "tween",
          ease: "easeOut",
          duration: 0.35,
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function StepBadge({
  step,
  status,
}: {
  step: number;
  status: "completed" | "current" | "scheduled" | "rescheduled" | "queued";
}) {
  return (
    <motion.div
      animate={status}
      initial={false}
      className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm"
    >
      <motion.div
        variants={{
          queued: {
            backgroundColor: "#F3F4F6",
            color: "#9CA3AF",
            border: "2px solid #D1D5DB",
          },
          current: {
            backgroundColor: "#0F2942",
            color: "#F2C94C",
            border: "2px solid #0F2942",
          },
          scheduled: {
            backgroundColor: "#1D4ED8",
            color: "#ffffff",
            border: "2px solid #1D4ED8",
          },
          rescheduled: {
            backgroundColor: "#4338CA",
            color: "#ffffff",
            border: "2px solid #4338CA",
          },
          completed: {
            backgroundColor: "#0F2942",
            color: "#ffffff",
            border: "2px solid #0F2942",
          },
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 flex items-center justify-center rounded-full font-bold"
      >
        {status === "completed" ? (
          <CheckIcon className="h-4 w-4 text-[#F2C94C]" />
        ) : status === "current" ? (
          <div className="h-2.5 w-2.5 rounded-full bg-[#F2C94C]" />
        ) : status === "scheduled" || status === "rescheduled" ? (
          <span className="text-xs">S</span>
        ) : (
          <span className="text-xs">{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function InspectionStepper({ steps }: InspectionStepperProps) {
  if (!steps.length) return null;

  // Determine the active step index (first current, or last completed + 1, or 0)
  const currentIndex = steps.findIndex(
    (s) =>
      s.stage === "current" ||
      s.stage === "scheduled" ||
      s.stage === "rescheduled",
  );
  const lastCompleted = steps.reduce(
    (last, s, i) => (s.stage === "completed" ? i : last),
    -1,
  );
  const activeIndex =
    currentIndex !== -1
      ? currentIndex
      : lastCompleted + 1 < steps.length
        ? lastCompleted + 1
        : steps.length - 1;

  return (
    <div className="w-full space-y-6">
      {/* Step indicator row */}
      <div className="flex w-full items-center px-2">
        {steps.map((step, index) => (
          <div key={step.processId} className="flex flex-1 items-center">
            <StepBadge step={step.sequence} status={step.stage} />
            {index < steps.length - 1 && (
              <StepConnector isComplete={step.stage === "completed"} />
            )}
          </div>
        ))}
      </div>

      {/* Step detail card */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isDone = step.stage === "completed";
          const isPending = step.stage === "queued";
          const isScheduled = step.stage === "scheduled";
          const isRescheduled = step.stage === "rescheduled";

          return (
            <motion.div
              key={step.processId}
              initial={false}
              animate={{
                opacity: isPending ? 0.5 : 1,
                scale: isActive ? 1 : 0.99,
              }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl border px-5 py-4 transition-colors ${
                isActive
                  ? "bg-[#F4F8FC] border-[#0F2942]/15 shadow-sm"
                  : isDone
                    ? "bg-white border-gray-100"
                    : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <StepBadge step={step.sequence} status={step.stage} />
                  <p
                    className={`font-black text-sm truncate ${
                      isActive
                        ? "text-[#0F2942]"
                        : isDone
                          ? "text-[#0F2942]/70"
                          : "text-gray-400"
                    }`}
                  >
                    {step.processName}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    isDone
                      ? "bg-[#0F2942] text-[#F2C94C]"
                      : isRescheduled
                        ? "bg-indigo-100 text-indigo-700"
                        : isScheduled
                          ? "bg-sky-100 text-sky-700"
                      : isActive
                        ? "bg-[#F2C94C] text-[#0F2942]"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone
                    ? "Done"
                    : isRescheduled
                      ? "Rescheduled"
                      : isScheduled
                        ? "Scheduled"
                        : isActive
                          ? "In Progress"
                          : "Queued"}
                </span>
              </div>

              {step.assignedInspectorName && (
                <p className="mt-2 text-xs font-semibold text-gray-500 flex items-center gap-1.5 pl-12">
                  <span className="font-bold text-[#0F2942]/60">
                    Inspector:
                  </span>
                  {step.assignedInspectorName}
                </p>
              )}

              {step.feedback && (
                <div className="mt-3 ml-12 rounded-xl bg-amber-50 border border-amber-100 px-4 py-2.5">
                  <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">
                    Feedback
                  </p>
                  <p className="text-sm font-medium text-amber-900 leading-relaxed">
                    {step.feedback}
                  </p>
                </div>
              )}

              {step.scheduledInspectionAt && (
                <p className="mt-2 text-xs font-semibold text-gray-500 pl-12">
                  Scheduled at{" "}
                  {new Date(step.scheduledInspectionAt).toLocaleString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
