import type {
  PermitField,
  PermitFieldType,
  PermitSection,
  PermitSectionLayout,
} from "@/types/permit/permit.type";
import {
  FiArrowDown,
  FiArrowUp,
  FiEdit2,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

import {
  fieldTypeOptions,
  sectionLayoutOptions,
} from "./shared";

type PermitBuilderStructurePanelProps = {
  formTitle: string;
  formDescription: string;
  sections: PermitSection[];
  fields: PermitField[];
  selectedFieldId: string | null;
  onFormTitleChange: (value: string) => void;
  onFormDescriptionChange: (value: string) => void;
  onAddSection: () => void;
  onUpdateSection: (sectionId: string, updates: Partial<PermitSection>) => void;
  onDeleteSection: (sectionId: string) => void;
  onSelectSection: (sectionId: string) => void;
  onAddField: (type: PermitFieldType) => void;
  onMoveField: (fieldId: string, direction: "up" | "down") => void;
  onSelectField: (fieldId: string) => void;
  onDeleteField: (fieldId: string) => void;
};

export default function PermitBuilderStructurePanel({
  formTitle,
  formDescription,
  sections,
  fields,
  selectedFieldId,
  onFormTitleChange,
  onFormDescriptionChange,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  onSelectSection,
  onAddField,
  onMoveField,
  onSelectField,
  onDeleteField,
}: PermitBuilderStructurePanelProps) {
  return (
    <div className="space-y-5 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:p-8">
      <div>
        <label className="mb-2 block text-sm font-bold text-gray-600">
          Form Title
        </label>
        <input
          type="text"
          value={formTitle}
          onChange={(e) => onFormTitleChange(e.target.value)}
          placeholder="Permit application title"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-gray-600">
          Form Description
        </label>
        <textarea
          rows={3}
          value={formDescription}
          onChange={(e) => onFormDescriptionChange(e.target.value)}
          placeholder="Describe instructions for business owners."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
        />
      </div>

      <div className="space-y-3 border-t border-gray-100 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-lg font-black text-[#0F2942]">Sections</h4>
          <button
            type="button"
            onClick={onAddSection}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold transition-all hover:border-[#0F2942] hover:text-[#0F2942] sm:w-auto"
          >
            <FiPlus />
            Add Section
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="rounded-xl border border-gray-200 p-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) =>
                    onUpdateSection(section.id, { title: e.target.value })
                  }
                  onFocus={() => onSelectSection(section.id)}
                  placeholder="Section title"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20"
                />
                <select
                  value={section.layout}
                  onChange={(e) =>
                    onUpdateSection(section.id, {
                      layout: e.target.value as PermitSectionLayout,
                    })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0F2942]/20 sm:w-48"
                >
                  {sectionLayoutOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onDeleteSection(section.id)}
                  disabled={sections.length <= 1}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto"
                  title="Delete section"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <div className="flex flex-wrap gap-2">
          {fieldTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAddField(option.value)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold transition-all hover:border-[#0F2942] hover:text-[#0F2942]"
            >
              <FiPlus />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm font-medium text-gray-500">
            No fields yet. Add your first form field.
          </div>
        ) : (
          fields.map((field, index) => {
            const sectionName =
              sections.find((section) => section.id === field.sectionId)?.title ??
              "Unassigned";

            return (
              <div
                key={field.id}
                className={`rounded-2xl border p-4 transition-all ${
                  selectedFieldId === field.id
                    ? "border-[#0F2942] bg-blue-50/40"
                    : "border-gray-200"
                }`}
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <div>
                    <p className="font-bold text-[#0F2942]">
                      {index + 1}. {field.label || "Untitled field"}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                      {field.type} - {sectionName}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMoveField(field.id, "up")}
                      disabled={index === 0}
                      className="cursor-pointer rounded-lg border border-gray-200 p-2 disabled:opacity-30"
                      title="Move up"
                    >
                      <FiArrowUp />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveField(field.id, "down")}
                      disabled={index === fields.length - 1}
                      className="cursor-pointer rounded-lg border border-gray-200 p-2 disabled:opacity-30"
                      title="Move down"
                    >
                      <FiArrowDown />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelectField(field.id)}
                      className="cursor-pointer rounded-lg border border-gray-200 p-2 hover:border-[#0F2942]"
                      title="Edit field"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteField(field.id)}
                      className="cursor-pointer rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                      title="Delete field"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
