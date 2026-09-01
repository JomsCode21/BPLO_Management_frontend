import type {
  PermitTemplate,
  PermitTemplateMapping,
} from "@/api/super_admin/super_admin.api";

export const DEFAULT_WATERMARK_TEXT =
  "BPLO GENERATED DOCUMENT - REVIEW COPY";

export const DEFAULT_WATERMARK_FONT_SIZE = 48;

export const buildDefaultMapping = (
  placeholder: string,
): PermitTemplateMapping => ({
  placeholder,
  label: "",
  sourceType: "field",
  sourceKey: "",
  fixedValue: "",
  autoIncrement: {
    prefix: "",
    suffix: "",
    paddingLength: 4,
    resetRule: "yearly",
  },
  confidence: "low",
  needsReview: true,
});

export const isMappingComplete = (mapping: PermitTemplateMapping) => {
  if (mapping.sourceType === "field") {
    return Boolean(mapping.sourceKey);
  }
  if (mapping.sourceType === "system") {
    return Boolean(mapping.sourceKey);
  }
  if (mapping.sourceType === "fixed_value") {
    return Boolean(String(mapping.fixedValue ?? "").trim());
  }
  if (mapping.sourceType === "auto_increment") {
    const padding = Number(mapping.autoIncrement?.paddingLength ?? 0);
    const resetRule = String(mapping.autoIncrement?.resetRule ?? "");
    return (
      Number.isInteger(padding) &&
      padding >= 1 &&
      padding <= 12 &&
      ["no_reset", "yearly", "monthly"].includes(resetRule)
    );
  }
  return false;
};

export const buildDraftMappings = (
  template: PermitTemplate | null,
): PermitTemplateMapping[] =>
  template?.placeholders.map((placeholder) => {
    const existing = template.mappings.find(
      (mapping) => mapping.placeholder === placeholder,
    );
    const mapping = existing ?? buildDefaultMapping(placeholder);
    return {
      ...mapping,
      needsReview: !isMappingComplete(mapping),
    };
  }) ?? [];

export const getTemplateWatermarkText = (template: PermitTemplate | null) =>
  template?.watermarkText || DEFAULT_WATERMARK_TEXT;

export const getTemplateWatermarkFontSize = (template: PermitTemplate | null) =>
  Number(template?.watermarkFontSizePt ?? DEFAULT_WATERMARK_FONT_SIZE);
