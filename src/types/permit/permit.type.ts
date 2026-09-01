export type PermitFieldType =
  | "text"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file";

export type PermitPlaceholderMode = "manual" | "automatic";

export type PermitFieldValidationKind =
  | "none"
  | "letters_only"
  | "numbers_only"
  | "alphanumeric"
  | "custom_regex";

export type PermitFieldValidation = {
  kind: PermitFieldValidationKind;
  regex?: string;
  message?: string;
};

export type PermitField = {
  id: string;
  type: PermitFieldType;
  label: string;
  placeholder?: string;
  placeholderMode?: PermitPlaceholderMode;
  validation?: PermitFieldValidation;
  required: boolean;
  options?: string[];
  sectionId?: string;
};

export type PermitSectionLayout = "one_column" | "two_column";

export type PermitSection = {
  id: string;
  title: string;
  layout: PermitSectionLayout;
};

export type PermitType = {
  _id: string;
  name: string;
  description?: string;
  showInPermitValidity: boolean;
  enablePermitValidityFormDisplay: boolean;
  permitValidityDisplayFieldIds: string[];
  formTitle?: string;
  formDescription?: string;
  sections: PermitSection[];
  fields: PermitField[];
  createdAt?: string;
  updatedAt?: string;
};

export type PermitApplicationFilePayload = {
  name: string;
  mimeType: string;
  size: number;
  url: string;
};

export type PermitApplicationResponsePayload = {
  fieldId: string;
  value?: string | string[] | null;
  files?: PermitApplicationFilePayload[];
};


