import {
  getImageRenderUrl,
  uploadImageFileWithRandomFolder,
} from "@/api/file_uploader/file_uploader";
import type {
  PermitApplicationFilePayload,
  PermitField,
  PermitFieldValidationKind,
  PermitSection,
  PermitType,
} from "@/types/permit/permit.type";

export type FormValue = string | string[];
export type FormValueState = Record<string, FormValue>;
export type FileValueState = Record<string, File[]>;
export type ExistingFileState = Record<
  string,
  PermitApplicationFilePayload[]
>;
export type PermitApplicationStep = "section" | "review";
export type PermitApplicationDraft = {
  values: FormValueState;
  existingFilesByField: ExistingFileState;
  currentSectionIndex: number;
  step: PermitApplicationStep;
  hasPendingFiles: boolean;
  updatedAt: string;
};
export type PermitSectionGroup = {
  section: PermitSection;
  fields: PermitField[];
};
export type PermitFormResponse = {
  field: PermitField;
  value: FormValue | undefined;
  files: File[];
  existingFiles: PermitApplicationFilePayload[];
};

const DOCUMENT_UPLOAD_FOLDER = "bplo/permit/application/document";
const DRAFT_STORAGE_PREFIX = "bplo_permit_application_draft";

// Draft keys are scoped by permit and application mode (`new` vs resubmission)
// to prevent drafts from different forms from overwriting each other.
export const getDraftStorageKey = (permitId: string, applicationId: string) =>
  `${DRAFT_STORAGE_PREFIX}:${permitId}:${applicationId || "new"}`;

export const readDraft = (
  storageKey: string,
): PermitApplicationDraft | null => {
  if (typeof window === "undefined") return null;

  const rawDraft = window.localStorage.getItem(storageKey);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft) as PermitApplicationDraft;
  } catch {
    window.localStorage.removeItem(storageKey);
    return null;
  }
};

export const removeDraft = (storageKey: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(storageKey);
};

export const buildDraftPayload = (params: {
  permitFields: PermitField[];
  values: FormValueState;
  existingFilesByField: ExistingFileState;
  filesByField: FileValueState;
  currentSectionIndex: number;
  step: PermitApplicationStep;
}): PermitApplicationDraft => {
  const draftValues: FormValueState = {};
  const draftExistingFiles: ExistingFileState = {};

  for (const field of params.permitFields) {
    if (field.type === "checkbox") {
      draftValues[field.id] = Array.isArray(params.values[field.id])
        ? (params.values[field.id] as string[])
        : [];
    } else {
      draftValues[field.id] = String(params.values[field.id] ?? "");
    }

    if (field.type === "file") {
      draftExistingFiles[field.id] = params.existingFilesByField[field.id] ?? [];
    }
  }

  return {
    values: draftValues,
    existingFilesByField: draftExistingFiles,
    currentSectionIndex: params.currentSectionIndex,
    step: params.step,
    // `File` objects are not persisted in localStorage, so we keep a flag that
    // tells the UI to remind users to re-attach files after reload.
    hasPendingFiles: Object.values(params.filesByField).some(
      (files) => files.length > 0,
    ),
    updatedAt: new Date().toISOString(),
  };
};

export const fileToPayload = async (
  file: File,
): Promise<PermitApplicationFilePayload> => {
  const { folder, filename, file: uploadedFile } =
    await uploadImageFileWithRandomFolder(file, DOCUMENT_UPLOAD_FOLDER);

  return {
    name: uploadedFile.name,
    mimeType: uploadedFile.type || "application/octet-stream",
    size: uploadedFile.size,
    url: getImageRenderUrl(folder, filename),
  };
};

export const getDefaultValue = (field: PermitField): FormValue =>
  field.type === "checkbox" ? [] : "";

export const normalizeSections = (permit: PermitType): PermitSection[] => {
  if (Array.isArray(permit.sections) && permit.sections.length > 0) {
    return permit.sections;
  }

  // Backward-compatible fallback for permits created before multi-section forms.
  return [
    {
      id: "section_fallback",
      title: "General Information",
      layout: "one_column",
    },
  ];
};

export const buildSectionGroups = (permit: PermitType): PermitSectionGroup[] =>
  permit.sections.map((section) => ({
    section,
    // Grouping is computed on render so the latest permit field edits are
    // reflected without mutating the source payload.
    fields: permit.fields.filter((field) => field.sectionId === section.id),
  }));

const getConstraintRegex = (
  kind?: PermitFieldValidationKind,
  customRegex?: string,
): RegExp | null => {
  if (!kind || kind === "none") return null;
  if (kind === "letters_only") return /^[A-Za-z\s.'-]+$/;
  if (kind === "numbers_only") return /^\d+$/;
  if (kind === "alphanumeric") return /^[A-Za-z0-9]+$/;

  if (kind === "custom_regex") {
    const pattern = String(customRegex ?? "").trim();
    if (!pattern) return null;
    try {
      return new RegExp(pattern);
    } catch {
      return null;
    }
  }

  return null;
};

export const sanitizeByConstraint = (
  field: PermitField,
  input: string,
): string => {
  const kind = field.validation?.kind;
  // Soft sanitize while typing to reduce invalid keystrokes before full
  // validation runs.
  if (kind === "letters_only") {
    return input.replace(/[^A-Za-z\s.'-]/g, "");
  }
  if (kind === "numbers_only") {
    return input.replace(/\D/g, "");
  }
  if (kind === "alphanumeric") {
    return input.replace(/[^A-Za-z0-9]/g, "");
  }
  return input;
};

export const getConstraintError = (
  field: PermitField,
  value: unknown,
): string | null => {
  if (field.type !== "text" && field.type !== "textarea") {
    return null;
  }

  const rawValue = String(value ?? "");
  if (!rawValue.trim()) {
    return null;
  }

  const regex = getConstraintRegex(
    field.validation?.kind,
    field.validation?.regex,
  );
  if (!regex) {
    return null;
  }

  if (regex.test(rawValue)) {
    return null;
  }

  const customMessage = String(field.validation?.message ?? "").trim();
  if (customMessage) {
    return customMessage;
  }

  if (field.validation?.kind === "letters_only") {
    return "Only letters are allowed.";
  }
  if (field.validation?.kind === "numbers_only") {
    return "Only numbers are allowed.";
  }
  if (field.validation?.kind === "alphanumeric") {
    return "Only letters and numbers are allowed.";
  }
  return "Invalid format.";
};
