import type {
  PermitField,
  PermitFieldValidationKind,
  PermitPlaceholderMode,
  PermitSection,
} from "@/types/permit/permit.type";

import {
  fieldTypesWithOptions,
  fieldValidationOptions,
  getPlaceholderMode,
  normalizeFieldValidation,
  supportsPlaceholder,
  supportsValidation,
} from "./shared";

type PermitBuilderFieldSettingsPanelProps = {
  selectedField: PermitField | null;
  selectedFieldSectionId: string;
  sections: PermitSection[];
  onUpdateField: (fieldId: string, updates: Partial<PermitField>) => void;
  onPlaceholderModeChange: (
    fieldId: string,
    mode: PermitPlaceholderMode,
  ) => void;
};

export default function PermitBuilderFieldSettingsPanel({
  selectedField,
  selectedFieldSectionId,
  sections,
  onUpdateField,
  onPlaceholderModeChange,
}: PermitBuilderFieldSettingsPanelProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h4 className="text-lg font-black text-[#0F2942]">Field Settings</h4>
      {!selectedField ? (
        <p className="mt-3 text-sm text-gray-500">
          Select a field to edit its settings.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-600">
              Label *
            </label>
            <input
              type="text"
              value={selectedField.label}
              onChange={(e) =>
                onUpdateField(selectedField.id, { label: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
            />
          </div>

          {supportsPlaceholder(selectedField.type) && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="block text-sm font-bold text-gray-600">
                  Placeholder Mode
                </label>
                <div className="flex w-full flex-col rounded-xl border border-gray-200 p-1 sm:inline-flex sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      onPlaceholderModeChange(selectedField.id, "automatic")
                    }
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                      getPlaceholderMode(selectedField) === "automatic"
                        ? "bg-[#0F2942] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Automatic
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onPlaceholderModeChange(selectedField.id, "manual")
                    }
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-semibold transition-all ${
                      getPlaceholderMode(selectedField) === "manual"
                        ? "bg-[#0F2942] text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Manual
                  </button>
                </div>
              </div>

              {getPlaceholderMode(selectedField) === "manual" ? (
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-600">
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={selectedField.placeholder ?? ""}
                    onChange={(e) =>
                      onUpdateField(selectedField.id, {
                        placeholder: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                  />
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  Placeholder will always match the field label exactly.
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-600">
              Section
            </label>
            <select
              value={selectedFieldSectionId}
              onChange={(e) =>
                onUpdateField(selectedField.id, { sectionId: e.target.value })
              }
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.title}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id={`required-${selectedField.id}`}
              type="checkbox"
              checked={selectedField.required}
              onChange={(e) =>
                onUpdateField(selectedField.id, {
                  required: e.target.checked,
                })
              }
            />
            <label
              htmlFor={`required-${selectedField.id}`}
              className="text-sm font-semibold text-gray-700"
            >
              Required field
            </label>
          </div>

          {supportsValidation(selectedField.type) && (
            <div className="space-y-3">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-600">
                  Field Constraint
                </label>
                <select
                  value={
                    normalizeFieldValidation(
                      selectedField.type,
                      selectedField.validation,
                    )?.kind ?? "none"
                  }
                  onChange={(e) =>
                    onUpdateField(selectedField.id, {
                      validation: {
                        kind: e.target.value as PermitFieldValidationKind,
                        regex: "",
                        message:
                          normalizeFieldValidation(
                            selectedField.type,
                            selectedField.validation,
                          )?.message ?? "",
                      },
                    })
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                >
                  {fieldValidationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {normalizeFieldValidation(
                selectedField.type,
                selectedField.validation,
              )?.kind === "custom_regex" && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-600">
                      Regex Pattern
                    </label>
                    <input
                      type="text"
                      value={
                        normalizeFieldValidation(
                          selectedField.type,
                          selectedField.validation,
                        )?.regex ?? ""
                      }
                      onChange={(e) =>
                        onUpdateField(selectedField.id, {
                          validation: {
                            ...(normalizeFieldValidation(
                              selectedField.type,
                              selectedField.validation,
                            ) ?? {
                              kind: "custom_regex",
                              regex: "",
                              message: "",
                            }),
                            kind: "custom_regex",
                            regex: e.target.value,
                          },
                        })
                      }
                      placeholder="Example: ^[A-Za-z\\s.'-]+$"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-600">
                      Error Message (Optional)
                    </label>
                    <input
                      type="text"
                      value={
                        normalizeFieldValidation(
                          selectedField.type,
                          selectedField.validation,
                        )?.message ?? ""
                      }
                      onChange={(e) =>
                        onUpdateField(selectedField.id, {
                          validation: {
                            ...(normalizeFieldValidation(
                              selectedField.type,
                              selectedField.validation,
                            ) ?? {
                              kind: "custom_regex",
                              regex: "",
                              message: "",
                            }),
                            kind: "custom_regex",
                            message: e.target.value,
                          },
                        })
                      }
                      placeholder="Example: Only letters and spaces are allowed."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {fieldTypesWithOptions.includes(selectedField.type) && (
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-600">
                Options (one per line)
              </label>
              <textarea
                rows={6}
                value={(selectedField.options ?? []).join("\n")}
                onChange={(e) =>
                  onUpdateField(selectedField.id, {
                    options: e.target.value
                      .split("\n")
                      .map((item) => item.trim())
                      .filter((item) => item.length > 0),
                  })
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
