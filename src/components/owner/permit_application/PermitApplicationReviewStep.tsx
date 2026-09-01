import type { PermitApplicationFilePayload } from "@/types/permit/permit.type";
import { formatTextualDate } from "@/utils/date/date-display.util";

import type { PermitFormResponse, PermitSectionGroup } from "./shared";

type PermitApplicationReviewStepProps = {
  groupedSections: PermitSectionGroup[];
  responsesByFieldId: Partial<Record<string, PermitFormResponse>>;
  onPrevious: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isResubmission: boolean;
};

const mergeFiles = (
  response?: PermitFormResponse,
): Array<PermitApplicationFilePayload | File> => [
  ...(response?.existingFiles ?? []),
  ...(response?.files ?? []),
];

export default function PermitApplicationReviewStep({
  groupedSections,
  responsesByFieldId,
  onPrevious,
  onSubmit,
  isSubmitting,
  isResubmission,
}: PermitApplicationReviewStepProps) {
  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-xl font-black text-[#0F2942]">Review Information</h2>

      <div className="space-y-6">
        {groupedSections.map(({ section, fields }, sectionIndex) => (
          <div key={`review-${section.id}`} className="space-y-4">
            <h3 className="rounded-2xl bg-[#C8C8C8] px-5 py-3 text-lg font-black uppercase text-black">
              {sectionIndex + 1}. {section.title}
            </h3>
            <div className="space-y-3">
              {fields.map((field) => {
                const response = responsesByFieldId[field.id];
                const allFiles = mergeFiles(response);
                const value = response?.value;

                return (
                  <div
                    key={`review-${field.id}`}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-[0_4px_10px_rgba(0,0,0,0.14)]"
                  >
                    <p className="text-sm font-black text-black">
                      {field.label}
                    </p>
                    {field.type === "file" ? (
                      allFiles.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-sm text-gray-600">
                          {allFiles.map((file, fileIndex) => (
                            <li
                              key={`${field.id}-${file.name}-${file.size}-${fileIndex}`}
                            >
                              {file.name} ({Math.ceil(file.size / 1024)} KB)
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-gray-500">
                          No file selected.
                        </p>
                      )
                    ) : Array.isArray(value) ? (
                      <p className="mt-2 text-sm text-gray-700">
                        {value.join(", ") || "-"}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-gray-700">
                        {field.type === "date"
                          ? formatTextualDate(String(value || ""))
                          : String(value || "-")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={onPrevious}
          className="cursor-pointer rounded-xl border border-gray-200 px-6 py-3 font-bold text-gray-700 transition-all hover:bg-gray-100"
        >
          Back to Sections
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="cursor-pointer rounded-xl bg-[#0F2942] px-6 py-3 font-bold text-white transition-all hover:bg-[#1E3A56] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Submitting..."
            : isResubmission
              ? "Re-submit Application"
              : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
