import type {
  EvaluatorApplicationDetailType,
  EvaluatorApplicationResponseType,
  EvaluatorDecisionType,
} from "@/types/evaluator/evaluator.type";
import { formatTextualDate } from "@/utils/date/date-display.util";

export type SubmittedSectionGroup = {
  id: string;
  title: string;
  layout: "one_column" | "two_column";
  responses: EvaluatorApplicationResponseType[];
};

export const decisionLabelMap: Record<EvaluatorDecisionType, string> = {
  for_inspection: "For Inspection",
  re_submission: "Re-submission",
  for_admin_approval: "For Admin Approval",
};

export const decisionNotificationMessageMap: Record<
  EvaluatorDecisionType,
  string
> = {
  for_inspection: "For inspection",
  re_submission: "Re-submission",
  for_admin_approval: "For admin approval",
};

export const evaluatorDecisionOptions: EvaluatorDecisionType[] = [
  "for_inspection",
  "re_submission",
  "for_admin_approval",
];

export const formatValue = (
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
  selectedApplication: EvaluatorApplicationDetailType | null,
) => {
  if (!selectedApplication) return [];

  const permitSections = selectedApplication.permit?.sections ?? [];
  const permitFields = selectedApplication.permit?.fields ?? [];
  const responses = selectedApplication.responses ?? [];

  if (permitSections.length === 0 || permitFields.length === 0) {
    // Backward-compatibility for older permits without section metadata.
    return [
      {
        id: "section_submitted_values",
        title: "Submitted Form Values",
        layout: "one_column" as const,
        responses,
      },
    ] satisfies SubmittedSectionGroup[];
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
      // Unknown section IDs are still rendered so no submitted value is hidden.
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
      (sectionId) =>
        !permitSections.some((section) => section.id === sectionId),
    ),
  ];

  return orderedSectionIds
    .map((sectionId) => sectionMap.get(sectionId))
    .filter(
      (section): section is SubmittedSectionGroup =>
        !!section && section.responses.length > 0,
    );
};
