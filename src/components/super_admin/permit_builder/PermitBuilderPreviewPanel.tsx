import type { PermitField } from "@/types/permit/permit.type";

import {
  getFieldPlaceholder,
  type PermitBuilderGroupedSection,
} from "./shared";

type PermitBuilderPreviewPanelProps = {
  title: string;
  permitName: string;
  description: string;
  groupedSections: PermitBuilderGroupedSection[];
};

const renderFieldPreviewInput = (field: PermitField) => {
  if (field.type === "textarea") {
    return (
      <textarea
        className="w-full rounded-lg border border-black/70 bg-white px-4 py-3"
        placeholder={getFieldPlaceholder(field)}
        disabled
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        className="w-full rounded-lg border border-black/70 bg-white px-4 py-3"
        disabled
      >
        <option>Select an option</option>
        {(field.options ?? []).map((option, index) => (
          <option key={`${field.id}-option-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex flex-col gap-2">
        {(field.options ?? []).map((option, index) => (
          <label
            key={`${field.id}-check-${index}`}
            className="flex items-center gap-2"
          >
            <input type="checkbox" disabled />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "radio") {
    return (
      <div className="flex flex-col gap-2">
        {(field.options ?? []).map((option, index) => (
          <label
            key={`${field.id}-radio-${index}`}
            className="flex items-center gap-2"
          >
            <input type="radio" name={field.id} disabled />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <input
        type="file"
        className="w-full rounded-lg border border-black/50 bg-white px-3 py-2 text-sm text-gray-700"
        disabled
      />
    );
  }

  const inputType = field.type === "date" ? "date" : "text";

  return (
    <input
      type={inputType}
      className="w-full rounded-lg border border-black/70 bg-white px-4 py-3"
      placeholder={getFieldPlaceholder(field)}
      disabled
    />
  );
};

export default function PermitBuilderPreviewPanel({
  title,
  permitName,
  description,
  groupedSections,
}: PermitBuilderPreviewPanelProps) {
  return (
    <div className="rounded-md border border-gray-300 bg-[#ECECEC] p-4 shadow-sm sm:p-6 md:p-8">
      <h3 className="text-xl font-black uppercase tracking-wide text-black sm:text-2xl">
        {title || permitName}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-gray-700 md:text-base">{description}</p>
      )}

      <div className="mt-6 space-y-8">
        {groupedSections.length === 0 ? (
          <p className="text-sm font-medium text-gray-500">
            No sections yet. Add sections in builder mode.
          </p>
        ) : (
          groupedSections.map(({ section, fields: sectionFields }, sectionIndex) => (
            <div key={section.id} className="space-y-4">
              <h4 className="rounded-2xl bg-[#C8C8C8] px-4 py-3 text-lg font-black uppercase text-black sm:px-6 sm:text-2xl">
                {sectionIndex + 1}. {section.title}
              </h4>
              {sectionFields.length === 0 ? (
                <p className="text-sm text-gray-500">No fields in this section.</p>
              ) : (
                <div
                  className={`grid gap-4 ${
                    section.layout === "two_column"
                      ? "grid-cols-1 md:grid-cols-2"
                      : "grid-cols-1"
                  }`}
                >
                  {sectionFields.map((field) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_4px_10px_rgba(0,0,0,0.14)] md:p-5"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <label className="text-sm font-semibold text-black">
                          {field.label}
                        </label>
                        {field.required && (
                          <span className="text-xs font-black text-red-600">
                            *
                          </span>
                        )}
                      </div>
                      {renderFieldPreviewInput(field)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
