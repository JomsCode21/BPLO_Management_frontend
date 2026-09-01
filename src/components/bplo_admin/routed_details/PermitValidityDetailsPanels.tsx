import type { BploRoutedApplicationDetailType } from "@/types/bplo_admin/bplo_admin.type";
import { formatTextualDate } from "@/utils/date/date-display.util";
import { FiExternalLink } from "react-icons/fi";

type ValidityResponse = {
  fieldId: string;
  label: string;
  type: string;
  value?: string | string[] | null;
  files?: Array<{
    name: string;
    url: string;
  }>;
};

const formatValue = (
  value: string | string[] | null | undefined,
  type?: string,
) => {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "-";
  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) return "-";
    if (type === "date") return formatTextualDate(normalized);
    return normalized;
  }
  return "-";
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

type PermitValidityDetailsPanelsProps = {
  application: BploRoutedApplicationDetailType;
  enabledResponses: ValidityResponse[];
};

export default function PermitValidityDetailsPanels({
  application,
  enabledResponses,
}: PermitValidityDetailsPanelsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="rounded-md border border-gray-300 bg-[#F4F4F4] px-3 py-2 text-center">
          <h3 className="text-sm font-black text-[#0F2942]">Enabled Form Details</h3>
        </div>

        <div className="mt-4 space-y-3">
          {enabledResponses.length === 0 ? (
            <p className="text-sm font-semibold text-gray-500">
              No enabled form fields configured for Permit Validity.
            </p>
          ) : (
            enabledResponses.map((response) => (
              <div
                key={response.fieldId}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500 font-bold">
                  {response.label}
                </p>
                {response.type === "file" ? (
                  <div className="mt-2 space-y-2">
                    {(response.files ?? []).length === 0 ? (
                      <p className="text-sm text-gray-500">No uploaded document.</p>
                    ) : (
                      (response.files ?? []).map((file, index) => (
                        <a
                          key={`${response.fieldId}-${index}`}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F2942] underline underline-offset-2"
                        >
                          <FiExternalLink />
                          {file.name}
                        </a>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm font-medium text-gray-800 md:text-base">
                    {formatValue(response.value, response.type)}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5">
        <div className="rounded-md border border-gray-300 bg-[#F4F4F4] px-3 py-2 text-center">
          <h3 className="text-sm font-black text-[#0F2942]">
            Approval And Inspection Details
          </h3>
        </div>

        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold">
              Permit Approved By Admin
            </p>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {formatDateTime(application.adminResult?.decidedAt)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold">
              Inspection Admin Decision Date
            </p>
            <p className="mt-1 text-sm font-medium text-gray-800">
              {formatDateTime(application.inspectionAdminResult?.decidedAt)}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500 font-bold">
              Inspectors
            </p>
            {(application.inspectionFlow?.steps ?? []).length === 0 ? (
              <p className="mt-1 text-sm font-medium text-gray-500">
                No inspection flow for this application.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {(application.inspectionFlow?.steps ?? []).map((step) => (
                  <div
                    key={`${step.processId}-${step.sequence}`}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2"
                  >
                    <p className="text-xs font-bold text-[#0F2942]">
                      {step.processName}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Inspector: {step.assignedInspectorName?.trim() || "Not assigned"}
                    </p>
                    <p className="mt-1 text-xs text-gray-600">
                      Completed: {formatDateTime(step.completedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
