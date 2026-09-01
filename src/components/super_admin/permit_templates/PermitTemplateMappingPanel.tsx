import type {
  PermitTemplate,
  PermitTemplateMapping,
  PermitTemplateMappingOption,
  PermitTemplateMappingSource,
} from "@/api/super_admin/super_admin.api";
import { isMappingComplete } from "@/components/super_admin/permit_templates/shared";
import { FiEdit2, FiLoader, FiRefreshCw, FiSave } from "react-icons/fi";

type AutoIncrementField = "prefix" | "suffix" | "paddingLength" | "resetRule";

type PermitTemplateMappingPanelProps = {
  selectedTemplate: PermitTemplate;
  draftMappings: PermitTemplateMapping[];
  fieldMappingOptions: PermitTemplateMappingOption[];
  systemMappingOptions: PermitTemplateMappingOption[];
  isEditMode: boolean;
  isSavingMappings: boolean;
  isReplacing: boolean;
  watermarkTextDraft: string;
  watermarkFontSizeDraft: number;
  onWatermarkTextChange: (value: string) => void;
  onWatermarkFontSizeChange: (value: number) => void;
  onToggleEditMode: () => void;
  onSaveMappings: () => void;
  onChangeSourceType: (
    placeholder: string,
    sourceType: PermitTemplateMappingSource,
  ) => void;
  onChangePermitFieldMapping: (placeholder: string, sourceKey: string) => void;
  onChangeSystemFieldMapping: (placeholder: string, sourceKey: string) => void;
  onChangeFixedValue: (placeholder: string, value: string) => void;
  onChangeAutoIncrement: (
    placeholder: string,
    field: AutoIncrementField,
    value: string,
  ) => void;
  onReplaceFileChange: (file: File | null) => void;
  onReplaceTemplate: () => void;
};

export default function PermitTemplateMappingPanel({
  selectedTemplate,
  draftMappings,
  fieldMappingOptions,
  systemMappingOptions,
  isEditMode,
  isSavingMappings,
  isReplacing,
  watermarkTextDraft,
  watermarkFontSizeDraft,
  onWatermarkTextChange,
  onWatermarkFontSizeChange,
  onToggleEditMode,
  onSaveMappings,
  onChangeSourceType,
  onChangePermitFieldMapping,
  onChangeSystemFieldMapping,
  onChangeFixedValue,
  onChangeAutoIncrement,
  onReplaceFileChange,
  onReplaceTemplate,
}: PermitTemplateMappingPanelProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-[#0F2942]">
            Placeholder Mapping: {selectedTemplate.linkedPermitName}
          </h2>
          <p className="text-sm text-gray-500">
            Map each placeholder to fields from the linked permit only.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleEditMode}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0F2942] bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942]"
          >
            <FiEdit2 />
            {isEditMode ? "Cancel Edit" : "Edit"}
          </button>
          <button
            type="button"
            onClick={onSaveMappings}
            disabled={isSavingMappings || !isEditMode}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0F2942] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingMappings ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiSave />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-slate-50 p-3 md:grid-cols-[1fr_220px]">
        <input
          type="text"
          value={watermarkTextDraft}
          onChange={(event) => onWatermarkTextChange(event.target.value)}
          placeholder="Template watermark text"
          disabled={!isEditMode}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
        />
        <input
          type="number"
          min={12}
          max={200}
          value={watermarkFontSizeDraft}
          onChange={(event) =>
            onWatermarkFontSizeChange(Number(event.target.value || 48))
          }
          placeholder="Size (pt)"
          disabled={!isEditMode}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full min-w-264 border-collapse text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Placeholder</th>
              <th className="px-4 py-3">Source Type</th>
              <th className="px-4 py-3">Mapped Source</th>
              <th className="px-4 py-3">Source Key</th>
              <th className="px-4 py-3">Review</th>
            </tr>
          </thead>
          <tbody>
            {draftMappings.map((mapping) => (
              <tr
                key={mapping.placeholder}
                className="border-t border-gray-100"
              >
                <td className="px-4 py-3 font-mono text-sm font-bold text-[#0F2942]">
                  {mapping.placeholder}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={mapping.sourceType}
                    onChange={(event) =>
                      onChangeSourceType(
                        mapping.placeholder,
                        event.target.value as PermitTemplateMappingSource,
                      )
                    }
                    disabled={!isEditMode}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
                  >
                    <option value="field">Permit Field</option>
                    <option value="fixed_value">Fixed Value</option>
                    <option value="auto_increment">Auto Increment</option>
                    <option value="system">System Field</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {mapping.sourceType === "field" && (
                    <select
                      value={mapping.sourceKey}
                      onChange={(event) =>
                        onChangePermitFieldMapping(
                          mapping.placeholder,
                          event.target.value,
                        )
                      }
                      disabled={!isEditMode}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
                    >
                      <option value="">Select linked permit field</option>
                      {fieldMappingOptions.map((option) => (
                        <option key={option.sourceKey} value={option.sourceKey}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {mapping.sourceType === "system" && (
                    <select
                      value={mapping.sourceKey}
                      onChange={(event) =>
                        onChangeSystemFieldMapping(
                          mapping.placeholder,
                          event.target.value,
                        )
                      }
                      disabled={!isEditMode}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
                    >
                      <option value="">Select system field</option>
                      {systemMappingOptions.map((option) => (
                        <option key={option.sourceKey} value={option.sourceKey}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {mapping.sourceType === "fixed_value" && (
                    <input
                      value={mapping.fixedValue ?? ""}
                      onChange={(event) =>
                        onChangeFixedValue(
                          mapping.placeholder,
                          event.target.value,
                        )
                      }
                      disabled={!isEditMode}
                      placeholder="Enter fixed value"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-[#0F2942] outline-none focus:border-[#0F2942]"
                    />
                  )}
                  {mapping.sourceType === "auto_increment" && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <input
                          value={mapping.autoIncrement?.prefix ?? ""}
                          onChange={(event) =>
                            onChangeAutoIncrement(
                              mapping.placeholder,
                              "prefix",
                              event.target.value,
                            )
                          }
                          disabled={!isEditMode}
                          placeholder="Prefix"
                          className="rounded-lg border border-gray-200 px-2 py-2 text-xs text-[#0F2942] outline-none focus:border-[#0F2942]"
                        />
                        <input
                          value={mapping.autoIncrement?.suffix ?? ""}
                          onChange={(event) =>
                            onChangeAutoIncrement(
                              mapping.placeholder,
                              "suffix",
                              event.target.value,
                            )
                          }
                          disabled={!isEditMode}
                          placeholder="Suffix"
                          className="rounded-lg border border-gray-200 px-2 py-2 text-xs text-[#0F2942] outline-none focus:border-[#0F2942]"
                        />
                        <input
                          type="number"
                          min={1}
                          max={12}
                          value={Number(mapping.autoIncrement?.paddingLength ?? 4)}
                          onChange={(event) =>
                            onChangeAutoIncrement(
                              mapping.placeholder,
                              "paddingLength",
                              event.target.value,
                            )
                          }
                          disabled={!isEditMode}
                          placeholder="Pad"
                          className="rounded-lg border border-gray-200 px-2 py-2 text-xs text-[#0F2942] outline-none focus:border-[#0F2942]"
                        />
                        <select
                          value={mapping.autoIncrement?.resetRule ?? "yearly"}
                          onChange={(event) =>
                            onChangeAutoIncrement(
                              mapping.placeholder,
                              "resetRule",
                              event.target.value,
                            )
                          }
                          disabled={!isEditMode}
                          className="rounded-lg border border-gray-200 px-2 py-2 text-xs text-[#0F2942] outline-none focus:border-[#0F2942]"
                        >
                          <option value="yearly">Yearly Reset</option>
                          <option value="monthly">Monthly Reset</option>
                          <option value="no_reset">No Reset</option>
                        </select>
                      </div>
                      <p className="text-xs font-semibold text-gray-600">
                        Latest Assigned Number:{" "}
                        <span className="font-bold text-[#0F2942]">
                          {mapping.latestAssignedValue?.trim() || "-"}
                        </span>
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                  {mapping.sourceKey || "-"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      !isMappingComplete(mapping)
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {!isMappingComplete(mapping) ? "Needs Review" : "Ready"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditMode && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-slate-50 p-3">
          <p className="text-sm font-bold text-[#0F2942]">Replace Template File</p>
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(event) =>
                onReplaceFileChange(event.target.files?.[0] ?? null)
              }
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#0F2942] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F2942] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white"
            />
            <button
              type="button"
              onClick={onReplaceTemplate}
              disabled={isReplacing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0F2942] px-4 py-2.5 text-sm font-bold text-[#0F2942] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isReplacing ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiRefreshCw />
              )}
              Replace File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
