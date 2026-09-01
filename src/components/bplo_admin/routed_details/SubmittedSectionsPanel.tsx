import { formatTextualDate } from "@/utils/date/date-display.util";
import { FiExternalLink } from "react-icons/fi";

type ResponseFile = {
  name: string;
  url: string;
};

type SubmittedResponse = {
  fieldId: string;
  label: string;
  type: string;
  value?: string | string[] | null;
  files?: ResponseFile[];
};

export type SubmittedSectionGroup = {
  id: string;
  title: string;
  layout: "one_column" | "two_column";
  responses: SubmittedResponse[];
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

type SubmittedSectionsPanelProps = {
  sections: SubmittedSectionGroup[];
};

export default function SubmittedSectionsPanel({
  sections,
}: SubmittedSectionsPanelProps) {
  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          className="rounded-2xl border border-gray-100 p-4 md:p-5"
        >
          <div>
            <h3 className="text-lg font-black text-[#0F2942]">{section.title}</h3>
            <p className="mt-1 text-xs font-semibold text-gray-500">
              {section.responses.length} field
              {section.responses.length === 1 ? "" : "s"}
            </p>
          </div>

          <div
            className={`mt-4 ${
              section.layout === "two_column"
                ? "grid grid-cols-1 gap-3 md:grid-cols-2"
                : "space-y-3"
            }`}
          >
            {section.responses.map((response) => (
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
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
