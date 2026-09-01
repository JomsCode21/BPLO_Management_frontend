import type {
  PermitField,
  PermitFieldType,
  PermitFieldValidation,
  PermitFieldValidationKind,
  PermitPlaceholderMode,
  PermitSection,
  PermitSectionLayout,
  PermitType,
} from "@/types/permit/permit.type";

export const fieldTypeOptions: { label: string; value: PermitFieldType }[] = [
  { label: "Text Input", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Dropdown / Select", value: "select" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Radio Button", value: "radio" },
  { label: "Date", value: "date" },
  { label: "File Upload", value: "file" },
];

export const sectionLayoutOptions: {
  label: string;
  value: PermitSectionLayout;
}[] = [
  { label: "One Column", value: "one_column" },
  { label: "Two Column", value: "two_column" },
];

export const fieldTypesWithOptions: PermitFieldType[] = [
  "select",
  "checkbox",
  "radio",
];

export const fieldTypesWithPlaceholder: PermitFieldType[] = [
  "text",
  "textarea",
  "date",
];

export const fieldTypesWithValidation: PermitFieldType[] = ["text", "textarea"];

export const fieldValidationOptions: Array<{
  label: string;
  value: PermitFieldValidationKind;
}> = [
  { label: "No Constraint", value: "none" },
  { label: "Letters only", value: "letters_only" },
  { label: "Numbers only", value: "numbers_only" },
  { label: "Alphanumeric", value: "alphanumeric" },
  { label: "Custom regex", value: "custom_regex" },
];

export type PermitBuilderDraft = {
  formTitle: string;
  formDescription: string;
  sections: PermitSection[];
  fields: PermitField[];
  selectedFieldId: string | null;
  selectedSectionId: string | null;
  showPreview: boolean;
  updatedAt: string;
};

export type PermitBuilderGroupedSection = {
  section: PermitSection;
  fields: PermitField[];
};

const DRAFT_STORAGE_PREFIX = "bplo_permit_builder_draft";

export const getDraftStorageKey = (permitId: string) =>
  `${DRAFT_STORAGE_PREFIX}:${permitId}`;

export const readDraft = (storageKey: string): PermitBuilderDraft | null => {
  if (typeof window === "undefined") return null;

  const rawDraft = window.localStorage.getItem(storageKey);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as PermitBuilderDraft;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const removeDraft = (storageKey: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
};

export const createSection = (title = "Untitled Section"): PermitSection => ({
  id: crypto.randomUUID(),
  title,
  layout: "one_column",
});

export const createField = (
  type: PermitFieldType,
  sectionId: string,
): PermitField => ({
  id: crypto.randomUUID(),
  type,
  label: "Untitled field",
  placeholder: "Untitled field",
  placeholderMode: fieldTypesWithPlaceholder.includes(type)
    ? "automatic"
    : "manual",
  validation: fieldTypesWithValidation.includes(type)
    ? { kind: "none", regex: "", message: "" }
    : undefined,
  required: false,
  options: fieldTypesWithOptions.includes(type) ? ["Option 1"] : [],
  sectionId,
});

export const supportsPlaceholder = (type: PermitFieldType) =>
  fieldTypesWithPlaceholder.includes(type);

export const supportsValidation = (type: PermitFieldType) =>
  fieldTypesWithValidation.includes(type);

export const normalizeFieldValidation = (
  type: PermitFieldType,
  rawValidation?: PermitFieldValidation,
): PermitFieldValidation | undefined => {
  if (!supportsValidation(type)) {
    return undefined;
  }

  const rawKind = rawValidation?.kind ?? "none";
  const kind = fieldValidationOptions.some((item) => item.value === rawKind)
    ? rawKind
    : "none";
  const regex = String(rawValidation?.regex ?? "").trim();
  const message = String(rawValidation?.message ?? "").trim();

  if (kind !== "custom_regex") {
    return { kind, regex: "", message };
  }

  return { kind, regex, message };
};

export const getPlaceholderMode = (
  field: PermitField,
): PermitPlaceholderMode => {
  if (!supportsPlaceholder(field.type)) {
    return "manual";
  }

  if (
    field.placeholderMode === "automatic" ||
    field.placeholderMode === "manual"
  ) {
    return field.placeholderMode;
  }

  return field.placeholder === field.label ? "automatic" : "manual";
};

export const normalizeField = (
  field: PermitField,
  fallbackSectionId: string,
): PermitField => {
  const placeholderMode = getPlaceholderMode(field);

  return {
    ...field,
    sectionId: field.sectionId || fallbackSectionId,
    placeholderMode,
    placeholder:
      supportsPlaceholder(field.type) && placeholderMode === "automatic"
        ? field.label
        : (field.placeholder ?? ""),
    validation: normalizeFieldValidation(field.type, field.validation),
  };
};

export const getFieldPlaceholder = (field: PermitField) => {
  const placeholderMode = getPlaceholderMode(field);
  if (supportsPlaceholder(field.type) && placeholderMode === "automatic") {
    return field.label;
  }

  return field.placeholder || "Enter your answer";
};

export const normalizeSections = (permitData: PermitType): PermitSection[] => {
  if (Array.isArray(permitData.sections) && permitData.sections.length > 0) {
    return permitData.sections;
  }

  return [createSection("General Information")];
};
