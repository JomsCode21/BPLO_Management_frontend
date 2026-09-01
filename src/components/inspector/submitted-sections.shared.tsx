import type { InspectorInspectionRequestDetailType } from "@/types/inspector/inspector.type";
import { formatTextualDate } from "@/utils/date/date-display.util";
import { FiChevronDown, FiExternalLink } from "react-icons/fi";

export type SubmittedSectionGroup = {
  id: string;
  title: string;
  layout: "one_column" | "two_column";
  responses: InspectorInspectionRequestDetailType["responses"];
};

export const formatSubmittedValue = (
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

export const buildSubmittedSections = (
  application: InspectorInspectionRequestDetailType | null,
) => {
  if (!application) return [] as SubmittedSectionGroup[];

  const permitSections = application.permit?.sections ?? [];
  const permitFields = application.permit?.fields ?? [];
  const responses = application.responses ?? [];

  if (permitSections.length === 0 || permitFields.length === 0) {
    // Backward-compatible fallback for legacy permit payloads.
    return [
      {
        id: "section_submitted_values",
        title: "Submitted Form Values",
        layout: "one_column" as const,
        responses,
      },
    ];
  }

  const fieldOrder = new Map<string, number>();
  const fieldSectionMap = new Map<string, string>();
  permitFields.forEach((field, index) => {
    fieldOrder.set(field.id, index);
    fieldSectionMap.set(field.id, String(field.sectionId ?? "").trim());
  });

  const sectionMap = new Map<string, SubmittedSectionGroup>();
  permitSections.forEach((section) => {
    sectionMap.set(section.id, {
      id: section.id,
      title: section.title,
      layout: section.layout,
      responses: [],
    });
  });

  const fallbackSectionId = permitSections[0]?.id ?? "section_general";
  responses.forEach((response) => {
    const rawSectionId = fieldSectionMap.get(response.fieldId) ?? "";
    const sectionId = rawSectionId || fallbackSectionId;
    if (!sectionMap.has(sectionId)) {
      // Preserve unmatched responses so no submitted value is dropped.
      sectionMap.set(sectionId, {
        id: sectionId,
        title: "Other Information",
        layout: "one_column",
        responses: [],
      });
    }
    sectionMap.get(sectionId)?.responses.push(response);
  });

  sectionMap.forEach((section) => {
    section.responses.sort((a, b) => {
      const indexA = fieldOrder.get(a.fieldId) ?? Number.MAX_SAFE_INTEGER;
      const indexB = fieldOrder.get(b.fieldId) ?? Number.MAX_SAFE_INTEGER;
      return indexA - indexB;
    });
  });

  const orderedSectionIds = [
    ...permitSections.map((section) => section.id),
    ...Array.from(sectionMap.keys()).filter(
      (sectionId) => !permitSections.some((section) => section.id === sectionId),
    ),
  ];

  return orderedSectionIds
    .map((sectionId) => sectionMap.get(sectionId))
    .filter((section): section is SubmittedSectionGroup => !!section);
};

type InspectorSubmittedSectionsAccordionProps = {
  sections: SubmittedSectionGroup[];
  openSectionIds: string[];
  onToggleSection: (sectionId: string) => void;
};

export function InspectorSubmittedSectionsAccordion({
  sections,
  openSectionIds,
  onToggleSection,
}: InspectorSubmittedSectionsAccordionProps) {
  if (sections.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
        No submitted form sections are available for this application.
      </div>
    );
  }

  return (
    <>
      {sections.map((section) => (
        <section
          key={section.id}
          className="rounded-2xl border border-gray-100 p-4 md:p-5"
        >
          <button
            type="button"
            onClick={() => onToggleSection(section.id)}
            className="flex w-full items-start justify-between gap-3 text-left"
            aria-expanded={openSectionIds.includes(section.id)}
          >
            <div>
              <h3 className="text-lg font-black text-[#0F2942]">
                {section.title}
              </h3>
              <p className="mt-1 text-xs font-semibold text-gray-500">
                {section.responses.length} field
                {section.responses.length === 1 ? "" : "s"}
              </p>
            </div>
            <FiChevronDown
              className={`mt-1 text-[#0F2942] transition-transform ${
                openSectionIds.includes(section.id) ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSectionIds.includes(section.id) && (
            <div
              className={`mt-4 ${
                section.layout === "two_column"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-3"
                  : "space-y-3"
              }`}
            >
              {section.responses.map((response) => (
                <div
                  key={response.fieldId}
                  className="rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-600 font-black">
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
                    <p className="text-sm md:text-base text-gray-800 mt-1 font-medium">
                      {formatSubmittedValue(response.value, response.type)}
                    </p>
                  )}
                </div>
              ))}
              {section.responses.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600">
                  No submitted values in this section.
                </div>
              )}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
