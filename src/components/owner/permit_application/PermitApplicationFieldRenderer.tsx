import type {
  PermitApplicationFilePayload,
  PermitField,
} from "@/types/permit/permit.type";

import type { FormValue } from "./shared";

type PermitApplicationFieldRendererProps = {
  field: PermitField;
  value: FormValue | undefined;
  existingFiles: PermitApplicationFilePayload[];
  onTextChange: (field: PermitField, nextValue: string) => void;
  onValueChange: (fieldId: string, nextValue: string) => void;
  onCheckboxChange: (fieldId: string, option: string, checked: boolean) => void;
  onFileChange: (fieldId: string, nextFiles: File[]) => void;
  onRemoveExistingFile: (fieldId: string, fileUrl: string) => void;
};

const inputClassName =
  "w-full px-4 py-3 border border-black/70 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black/20";

export default function PermitApplicationFieldRenderer({
  field,
  value,
  existingFiles,
  onTextChange,
  onValueChange,
  onCheckboxChange,
  onFileChange,
  onRemoveExistingFile,
}: PermitApplicationFieldRendererProps) {
  if (field.type === "textarea") {
    return (
      <textarea
        rows={4}
        value={String(value ?? "")}
        onChange={(e) => onTextChange(field, e.target.value)}
        placeholder={field.placeholder || "Enter your answer"}
        className={inputClassName}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={String(value ?? "")}
        onChange={(e) => onValueChange(field.id, e.target.value)}
        className={inputClassName}
      >
        <option value="">Select an option</option>
        {(field.options ?? []).map((option, index) => (
          <option key={`${field.id}-option-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2">
        {(field.options ?? []).map((option, index) => (
          <label
            key={`${field.id}-check-${index}`}
            className="flex items-center gap-2"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={(e) =>
                onCheckboxChange(field.id, option, e.target.checked)
              }
            />
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
            <input
              type="radio"
              name={field.id}
              value={option}
              checked={String(value ?? "") === option}
              onChange={(e) => onValueChange(field.id, e.target.value)}
            />
            <span className="text-sm text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className="space-y-3">
        {existingFiles.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-600">
              Existing uploaded files
            </p>
            <ul className="mt-2 space-y-1">
              {existingFiles.map((file) => (
                <li
                  key={`${field.id}-${file.url}`}
                  className="flex items-center justify-between gap-2 text-sm text-gray-700"
                >
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate underline underline-offset-2"
                  >
                    {file.name}
                  </a>
                  <button
                    type="button"
                    onClick={() => onRemoveExistingFile(field.id, file.url)}
                    className="cursor-pointer text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <input
          type="file"
          onChange={(e) => {
            const nextFiles = e.target.files ? Array.from(e.target.files) : [];
            onFileChange(field.id, nextFiles);
          }}
          className="w-full rounded-lg border border-black/50 bg-white px-3 py-2 text-sm text-gray-700"
        />
      </div>
    );
  }

  const inputType = field.type === "date" ? "date" : "text";
  return (
    <input
      type={inputType}
      value={String(value ?? "")}
      onChange={(e) => onTextChange(field, e.target.value)}
      placeholder={field.placeholder || "Enter your answer"}
      className={inputClassName}
    />
  );
}
