import type { PermitField } from "@/types/permit/permit.type";

import PermitApplicationFieldRenderer from "./PermitApplicationFieldRenderer";
import type {
  ExistingFileState,
  FormValueState,
  PermitSectionGroup,
} from "./shared";

type PermitApplicationSectionStepProps = {
  currentSectionGroup: PermitSectionGroup;
  currentSectionIndex: number;
  totalSections: number;
  values: FormValueState;
  errors: Record<string, string>;
  existingFilesByField: ExistingFileState;
  onTextChange: (field: PermitField, nextValue: string) => void;
  onValueChange: (fieldId: string, nextValue: string) => void;
  onCheckboxChange: (fieldId: string, option: string, checked: boolean) => void;
  onFileChange: (fieldId: string, nextFiles: File[]) => void;
  onRemoveExistingFile: (fieldId: string, fileUrl: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isFirstSection: boolean;
  isLastSection: boolean;
};

export default function PermitApplicationSectionStep({
  currentSectionGroup,
  currentSectionIndex,
  totalSections,
  values,
  errors,
  existingFilesByField,
  onTextChange,
  onValueChange,
  onCheckboxChange,
  onFileChange,
  onRemoveExistingFile,
  onPrevious,
  onNext,
  isFirstSection,
  isLastSection,
}: PermitApplicationSectionStepProps) {
  return (
    <div className="mt-8 space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-500">
          Section {currentSectionIndex + 1} of {totalSections}
        </p>
        <h2 className="mt-2 rounded-2xl bg-[#C8C8C8] px-5 py-3 text-xl font-black uppercase text-black">
          {currentSectionIndex + 1}. {currentSectionGroup.section.title}
        </h2>
      </div>

      {currentSectionGroup.fields.length === 0 ? (
        <p className="text-sm text-gray-500">No fields in this section.</p>
      ) : (
        <div
          className={`grid gap-6 ${
            currentSectionGroup.section.layout === "two_column"
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1"
          }`}
        >
          {currentSectionGroup.fields.map((field) => (
            <div
              key={field.id}
              className="space-y-2 rounded-xl border border-gray-200 bg-white p-4 shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
            >
              <label className="text-sm font-semibold text-black">
                {field.label}{" "}
                {field.required && (
                  <span className="text-sm font-black text-red-500">*</span>
                )}
              </label>
              <PermitApplicationFieldRenderer
                field={field}
                value={values[field.id]}
                existingFiles={existingFilesByField[field.id] ?? []}
                onTextChange={onTextChange}
                onValueChange={onValueChange}
                onCheckboxChange={onCheckboxChange}
                onFileChange={onFileChange}
                onRemoveExistingFile={onRemoveExistingFile}
              />
              {errors[field.id] && (
                <p className="text-sm font-semibold text-red-600">
                  {errors[field.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={onPrevious}
          disabled={isFirstSection}
          className="cursor-pointer rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="cursor-pointer rounded-xl bg-[#0F2942] px-6 py-3 font-bold text-white transition-all hover:bg-[#1E3A56]"
        >
          {isLastSection ? "Review Application" : "Next"}
        </button>
      </div>
    </div>
  );
}
