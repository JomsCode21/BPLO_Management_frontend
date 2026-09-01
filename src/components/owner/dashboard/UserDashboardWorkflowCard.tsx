import type { OwnerApplicationStatusType } from "@/types/owner/owner.type";
import { Fragment } from "react";

import {
  getDashboardStatusMessage,
  type WorkflowTimelineItem,
  workflowSteps,
} from "./shared";

type UserDashboardWorkflowCardProps = {
  focusApplication: OwnerApplicationStatusType | null;
  workflowTimeline: WorkflowTimelineItem[];
  realtimeConnected: boolean;
  realtimeStatusNote: string;
  isFocusApproved: boolean;
  isFocusDenied: boolean;
  focusWorkflowLabel: string;
  workflowRenderStageIndex: number;
};

export default function UserDashboardWorkflowCard({
  focusApplication,
  workflowTimeline,
  realtimeConnected,
  realtimeStatusNote,
  isFocusApproved,
  isFocusDenied,
  focusWorkflowLabel,
  workflowRenderStageIndex,
}: UserDashboardWorkflowCardProps) {
  return (
    <section className="rounded-4xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-gray-500">
            Workflow Progress
          </p>
          <h2 className="mt-2 text-xl font-black text-[#0F2942] sm:text-2xl">
            {focusApplication
              ? `${focusApplication.permitType} workflow`
              : "Track every permit stage here"}
          </h2>
          <p
            className={`mt-2 hidden items-center gap-2 text-xs font-semibold sm:inline-flex ${
              realtimeConnected ? "text-emerald-600" : "text-amber-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                realtimeConnected ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {realtimeStatusNote}
          </p>
        </div>

        {focusApplication && (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
              isFocusApproved
                ? "bg-emerald-50 text-emerald-700"
                : isFocusDenied
                  ? "bg-red-50 text-red-700"
                  : "bg-[#F4F8FC] text-[#0F2942]"
            }`}
          >
            {focusWorkflowLabel}
          </span>
        )}
      </div>

      <div className="mt-5 md:hidden">
        <div className="space-y-3">
          {[workflowTimeline.slice(0, 3), workflowTimeline.slice(3, 6)].map(
            (row, rowIndex) => (
              <div
                key={`workflow-row-${rowIndex}`}
                className="rounded-[1.35rem] border border-gray-100 bg-[#FCFDFF] px-3 py-3"
              >
                <div className="flex items-start">
                  {row.map((step, stepIndex) => {
                    const isConnectorActive =
                      Boolean(focusApplication) &&
                      stepIndex < row.length - 1 &&
                      row[stepIndex + 1].index <= workflowRenderStageIndex;

                    return (
                      <Fragment key={step.step}>
                        <div className="flex min-w-0 flex-1 flex-col items-center text-center">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                              step.isDone
                                ? "bg-emerald-600 text-white"
                                : step.isDanger
                                  ? "bg-red-600 text-white"
                                  : step.isFocusedStep && isFocusApproved
                                    ? "bg-emerald-600 text-white"
                                    : step.isFocusedStep
                                      ? "bg-[#0F2942] text-[#F2C94C]"
                                      : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {step.index + 1}
                          </div>
                          <p className="mt-2 text-[11px] font-black uppercase leading-4 tracking-[0.06em] text-[#0F2942]">
                            {step.step}
                          </p>
                          <p className="mt-1 text-[10px] font-medium leading-4 text-gray-500">
                            {step.note}
                          </p>
                        </div>

                        {stepIndex < row.length - 1 && (
                          <div className="mt-4 flex w-4 items-center justify-center px-1">
                            <span
                              className={`h-0.5 w-full rounded-full ${
                                isConnectorActive
                                  ? isFocusApproved
                                    ? "bg-emerald-500"
                                    : "bg-[#0F2942]"
                                  : "bg-gray-200"
                              }`}
                            />
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </div>
            ),
          )}
        </div>

        {focusApplication && (
          <div className="mt-4 rounded-[1.35rem] border border-[#DCE7F3] bg-[#F8FBFF] px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
                Current Step
              </p>
              <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#0F2942]">
                Step {workflowRenderStageIndex + 1} / {workflowSteps.length}
              </span>
            </div>
            <p className="mt-2 text-base font-black leading-5 text-[#0F2942]">
              {focusWorkflowLabel}
            </p>
            <p className="mt-1 text-sm leading-5 text-gray-600">
              {getDashboardStatusMessage(focusApplication.status)}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 hidden gap-3 md:grid md:grid-cols-3 xl:grid-cols-6">
        {workflowTimeline.map((step) => (
          <div
            key={step.step}
            className={`rounded-3xl border px-4 py-4 transition-colors ${
              step.isDone
                ? "border-emerald-100 bg-emerald-50"
                : step.isDanger
                  ? "border-red-100 bg-red-50"
                  : step.isFocusedStep
                    ? "border-[#DCE7F3] bg-[#F8FBFF]"
                    : "border-gray-100 bg-[#FCFDFF]"
            }`}
          >
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
                step.isDone
                  ? "bg-emerald-600 text-white"
                  : step.isDanger
                    ? "bg-red-600 text-white"
                    : step.isFocusedStep && isFocusApproved
                      ? "bg-emerald-600 text-white"
                      : step.isFocusedStep
                        ? "bg-[#0F2942] text-[#F2C94C]"
                        : "bg-gray-100 text-gray-400"
              }`}
            >
              {step.index + 1}
            </div>
            <p className="mt-3 text-sm font-black leading-5 text-[#0F2942]">
              {step.label}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-gray-500">
              {step.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 hidden rounded-3xl border border-dashed border-gray-200 bg-[#FCFDFF] px-4 py-4 md:block">
        <p className="text-sm font-semibold leading-6 text-gray-600">
          {focusApplication
            ? getDashboardStatusMessage(focusApplication.status)
            : "Once you submit an application, this timeline will highlight where it currently sits in the permit process."}
        </p>
      </div>
    </section>
  );
}
