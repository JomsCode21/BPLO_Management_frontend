import {
  deletePermitTemplateApi,
  getAllPermitsApi,
  getPermitTemplateMappingOptionsApi,
  getPermitTemplatesApi,
  replacePermitTemplateFileApi,
  savePermitTemplateMappingsApi,
  updatePermitTemplateStatusApi,
  uploadPermitTemplateApi,
  type PermitTemplate,
  type PermitTemplateMapping,
  type PermitTemplateMappingOption,
  type PermitTemplateMappingSource,
} from "@/api/super_admin/super_admin.api";
import {
  buildDraftMappings,
  getTemplateWatermarkFontSize,
  getTemplateWatermarkText,
  isMappingComplete,
} from "@/components/super_admin/permit_templates/shared";
import {
  LazyModalFallback,
  LazyPanelFallback,
} from "@/components/ui/LazyFallback";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type { PermitType } from "@/types/permit/permit.type";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { FiLoader, FiUpload } from "react-icons/fi";

type ApiError = { response?: { data?: { message?: string } } };

const PermitTemplateDeleteModal = lazy(
  () =>
    import(
      "@/components/super_admin/permit_templates/PermitTemplateDeleteModal"
    ),
);
const PermitTemplateMappingPanel = lazy(
  () =>
    import(
      "@/components/super_admin/permit_templates/PermitTemplateMappingPanel"
    ),
);
const PermitTemplateSuccessModal = lazy(
  () =>
    import(
      "@/components/super_admin/permit_templates/PermitTemplateSuccessModal"
    ),
);

const modalFallback = (
  <LazyModalFallback
    title="Loading template action"
    description="Preparing the selected permit template dialog."
    compact
    maxWidthClassName="max-w-lg"
  />
);

const mappingPanelFallback = (
  <LazyPanelFallback
    title="Template mapping tools"
    description="Preparing placeholders, linked fields, and document controls."
    cardCount={4}
  />
);

const successModalFallback = (
  <LazyModalFallback
    title="Loading confirmation"
    description="Preparing the saved mapping confirmation."
    compact
    maxWidthClassName="max-w-md"
  />
);

const toBase64 = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

export default function PermitTemplatesPage() {
  const [permits, setPermits] = useState<PermitType[]>([]);
  const [templates, setTemplates] = useState<PermitTemplate[]>([]);
  const [mappingOptions, setMappingOptions] = useState<
    PermitTemplateMappingOption[]
  >([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isSavingMappings, setIsSavingMappings] = useState(false);
  const [isDeletingTemplate, setIsDeletingTemplate] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [hasLoadedSuccessModal, setHasLoadedSuccessModal] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [draftMappings, setDraftMappings] = useState<PermitTemplateMapping[]>(
    [],
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [uploadWatermarkText, setUploadWatermarkText] = useState(
    "BPLO GENERATED DOCUMENT - REVIEW COPY",
  );
  const [uploadWatermarkFontSizePt, setUploadWatermarkFontSizePt] =
    useState(48);
  const [watermarkTextDraft, setWatermarkTextDraft] = useState("");
  const [watermarkFontSizeDraft, setWatermarkFontSizeDraft] = useState(48);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [templatesResponse, permitsResponse] = await Promise.all([
        getPermitTemplatesApi(),
        getAllPermitsApi(),
      ]);
      // Refresh templates and linked permits together so selectors stay consistent.
      const nextTemplates = templatesResponse.data ?? [];
      const nextPermits = permitsResponse.data ?? [];
      setTemplates(nextTemplates);
      setPermits(nextPermits);
      setSelectedPermitId((current) => {
        if (current && nextPermits.some((permit) => permit._id === current)) {
          return current;
        }
        return nextPermits[0]?._id ?? "";
      });

      setSelectedTemplateId((current) => {
        if (
          current &&
          nextTemplates.some((template) => template._id === current)
        ) {
          return current;
        }
        return nextTemplates[0]?._id ?? "";
      });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError?.response?.data?.message ?? "Failed to load templates.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchAll();
  }, []);

  const selectedTemplate = useMemo(
    () =>
      templates.find((template) => template._id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );
  const fieldMappingOptions = useMemo(
    () => mappingOptions.filter((option) => option.sourceType === "field"),
    [mappingOptions],
  );
  const systemMappingOptions = useMemo(
    () => mappingOptions.filter((option) => option.sourceType === "system"),
    [mappingOptions],
  );

  useEffect(() => {
    const loadPermitScopedOptions = async () => {
      if (!selectedTemplate?.linkedPermitId) {
        setMappingOptions([]);
        return;
      }
      try {
        // Mapping options are permit-scoped and must follow selected template.
        const response = await getPermitTemplateMappingOptionsApi(
          selectedTemplate.linkedPermitId,
        );
        setMappingOptions(response.data ?? []);
      } catch (err: unknown) {
        const apiError = err as ApiError;
        setError(
          apiError?.response?.data?.message ??
            "Failed to load mapping options for the linked permit.",
        );
      }
    };

    void loadPermitScopedOptions();
  }, [selectedTemplate?.linkedPermitId]);

  useEffect(() => {
    const nextMappings =
      buildDraftMappings(selectedTemplate);
    setDraftMappings(nextMappings);
    setReplaceFile(null);
    setWatermarkTextDraft(getTemplateWatermarkText(selectedTemplate));
    setWatermarkFontSizeDraft(getTemplateWatermarkFontSize(selectedTemplate));
    setIsEditMode(false);
  }, [selectedTemplate]);

  const onUploadTemplate = async () => {
    if (!selectedPermitId) {
      setError("Please select a permit before uploading a template.");
      return;
    }
    if (!uploadFile) {
      setError("Please choose a .docx file.");
      return;
    }
    if (!uploadFile.name.toLowerCase().endsWith(".docx")) {
      setError("Only .docx template files are allowed.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const contentBase64 = await toBase64(uploadFile);
      await uploadPermitTemplateApi({
        permitId: selectedPermitId,
        fileName: uploadFile.name,
        mimeType: uploadFile.type,
        contentBase64,
        watermarkText: uploadWatermarkText.trim(),
        watermarkFontSizePt: Math.max(
          12,
          Math.min(200, Number(uploadWatermarkFontSizePt || 48)),
        ),
      });
      setUploadFile(null);
      await fetchAll();
      setSuccess("Template uploaded successfully.");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError?.response?.data?.message ?? "Failed to upload template.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const onReplaceTemplate = async () => {
    if (!selectedTemplate) {
      setError("Select a template to replace.");
      return;
    }
    if (!replaceFile) {
      setError("Choose a replacement .docx file.");
      return;
    }
    if (!replaceFile.name.toLowerCase().endsWith(".docx")) {
      setError("Only .docx template files are allowed.");
      return;
    }

    setIsReplacing(true);
    setError(null);
    setSuccess(null);
    try {
      const contentBase64 = await toBase64(replaceFile);
      await replacePermitTemplateFileApi(selectedTemplate._id, {
        fileName: replaceFile.name,
        mimeType: replaceFile.type,
        contentBase64,
      });
      setReplaceFile(null);
      await fetchAll();
      setSuccess("Template file replaced successfully.");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError?.response?.data?.message ?? "Failed to replace template file.",
      );
    } finally {
      setIsReplacing(false);
    }
  };

  const onSetStatus = async (
    templateId: string,
    status: "active" | "inactive",
  ) => {
    setStatusUpdatingId(templateId);
    setError(null);
    setSuccess(null);
    try {
      await updatePermitTemplateStatusApi(templateId, status);
      await fetchAll();
      setSuccess(
        status === "active"
          ? "Template activated successfully."
          : "Template deactivated successfully.",
      );
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message ?? "Failed to update status.");
    } finally {
      setStatusUpdatingId("");
    }
  };

  const updateMapping = (
    placeholder: string,
    updater: (mapping: PermitTemplateMapping) => PermitTemplateMapping,
  ) => {
    setDraftMappings((previous) =>
      previous.map((mapping) => {
        if (mapping.placeholder !== placeholder) return mapping;
        return updater(mapping);
      }),
    );
  };

  const onChangeSourceType = (
    placeholder: string,
    sourceType: PermitTemplateMappingSource,
  ) => {
    updateMapping(placeholder, (mapping) => ({
      ...mapping,
      sourceType,
      sourceKey: sourceType === "auto_increment" ? "auto_increment" : "",
      label: sourceType === "auto_increment" ? "Auto Increment" : "",
      fixedValue:
        sourceType === "fixed_value" ? (mapping.fixedValue ?? "") : "",
      autoIncrement:
        sourceType === "auto_increment"
          ? (mapping.autoIncrement ?? {
              prefix: "",
              suffix: "",
              paddingLength: 4,
              resetRule: "yearly",
            })
          : null,
      needsReview: true,
      confidence: mapping.confidence === "high" ? "high" : "medium",
    }));
  };

  const onChangePermitFieldMapping = (
    placeholder: string,
    sourceKey: string,
  ) => {
    const option = fieldMappingOptions.find(
      (item) => item.sourceKey === sourceKey,
    );
    updateMapping(placeholder, (mapping) => ({
      ...mapping,
      sourceType: "field",
      sourceKey,
      label: option?.label ?? mapping.label,
      needsReview: !option || !sourceKey,
      confidence: mapping.confidence === "high" ? "high" : "medium",
    }));
  };

  const onChangeSystemFieldMapping = (
    placeholder: string,
    sourceKey: string,
  ) => {
    const option = systemMappingOptions.find(
      (item) => item.sourceKey === sourceKey,
    );
    updateMapping(placeholder, (mapping) => ({
      ...mapping,
      sourceType: "system",
      sourceKey,
      label: option?.label ?? mapping.label,
      needsReview: !option || !sourceKey,
      confidence: mapping.confidence === "high" ? "high" : "medium",
    }));
  };

  const onChangeFixedValue = (placeholder: string, value: string) => {
    updateMapping(placeholder, (mapping) => ({
      ...mapping,
      sourceType: "fixed_value",
      sourceKey: "fixed_value",
      label: mapping.label || "Fixed Value",
      fixedValue: value,
      needsReview: !value.trim(),
      confidence: mapping.confidence === "high" ? "high" : "medium",
    }));
  };

  const onChangeAutoIncrement = (
    placeholder: string,
    field: "prefix" | "suffix" | "paddingLength" | "resetRule",
    value: string,
  ) => {
    updateMapping(placeholder, (mapping) => {
      const current = mapping.autoIncrement ?? {
        prefix: "",
        suffix: "",
        paddingLength: 4,
        resetRule: "yearly" as const,
      };
      const nextPadding =
        field === "paddingLength"
          ? Number.isFinite(Number(value))
            ? Math.max(1, Math.min(12, Number(value)))
            : current.paddingLength
          : current.paddingLength;
      const next = {
        ...current,
        [field]:
          field === "paddingLength"
            ? nextPadding
            : field === "resetRule"
              ? (value as "no_reset" | "yearly" | "monthly")
              : value,
      };
      return {
        ...mapping,
        sourceType: "auto_increment",
        sourceKey: "auto_increment",
        label: mapping.label || "Auto Increment",
        autoIncrement: next,
        needsReview:
          !Number.isInteger(next.paddingLength) ||
          next.paddingLength < 1 ||
          next.paddingLength > 12,
        confidence: mapping.confidence === "high" ? "high" : "medium",
      };
    });
  };

  const onSaveMappings = async () => {
    if (!selectedTemplate) {
      setError("Select a template first.");
      return;
    }
    const invalid = draftMappings.find(
      (mapping) => !isMappingComplete(mapping),
    );
    if (invalid) {
      setError(
        `Incomplete mapping configuration for placeholder: ${invalid.placeholder}`,
      );
      return;
    }
    const nextWatermarkText = watermarkTextDraft.trim();
    const nextWatermarkSize = Number(watermarkFontSizeDraft);
    if (!nextWatermarkText) {
      setError("Watermark text is required.");
      return;
    }
    if (
      !Number.isFinite(nextWatermarkSize) ||
      nextWatermarkSize < 12 ||
      nextWatermarkSize > 200
    ) {
      setError("Watermark size must be between 12 and 200.");
      return;
    }

    setIsSavingMappings(true);
    setError(null);
    setSuccess(null);
    try {
      await savePermitTemplateMappingsApi(selectedTemplate._id, {
        mappings: draftMappings,
        watermarkText: nextWatermarkText,
        watermarkFontSizePt: Math.round(nextWatermarkSize),
      });
      // Reload to reflect server-side mapping normalization/version updates.
      await fetchAll();
      setHasLoadedSuccessModal(true);
      setShowSaveSuccessModal(true);
      setIsEditMode(false);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError?.response?.data?.message ?? "Failed to save mappings.");
    } finally {
      setIsSavingMappings(false);
    }
  };

  const onDeleteTemplate = async () => {
    if (!selectedTemplate) {
      setError("Select a template to delete.");
      return;
    }

    setIsDeletingTemplate(true);
    setError(null);
    setSuccess(null);
    try {
      await deletePermitTemplateApi(selectedTemplate._id);
      setShowDeleteModal(false);
      await fetchAll();
      setSuccess("Template deleted successfully.");
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(
        apiError?.response?.data?.message ?? "Failed to delete template.",
      );
    } finally {
      setIsDeletingTemplate(false);
    }
  };

  const onToggleEditMode = () => {
    setIsEditMode((previous) => {
      const next = !previous;
      if (!next) {
        setDraftMappings(buildDraftMappings(selectedTemplate));
        setReplaceFile(null);
        setWatermarkTextDraft(getTemplateWatermarkText(selectedTemplate));
        setWatermarkFontSizeDraft(getTemplateWatermarkFontSize(selectedTemplate));
      }
      return next;
    });
    setError(null);
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 pb-24 md:pb-0">
      {hasLoadedSuccessModal && (
        <Suspense fallback={successModalFallback}>
          <PermitTemplateSuccessModal
            isOpen={showSaveSuccessModal}
            onClose={() => setShowSaveSuccessModal(false)}
          />
        </Suspense>
      )}

      <div
        className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-6"
        data-super-admin-tour="permit-templates-header"
      >
        <h1 className="text-2xl font-black text-[#0F2942] md:text-3xl">
          Permit Templates
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Super Admin template upload, placeholder mapping, and activation.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-lg font-black text-[#0F2942]">Upload Template</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto]">
          <select
            value={selectedPermitId}
            onChange={(event) => setSelectedPermitId(event.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#0F2942] outline-none focus:border-[#0F2942]"
          >
            <option value="">Select permit (required)</option>
            {permits.map((permit) => (
              <option key={permit._id} value={permit._id}>
                {permit.name}
              </option>
            ))}
          </select>
          <input
            type="file"
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => setUploadFile(event.target.files?.[0] ?? null)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-[#0F2942] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0F2942] file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-white"
          />
          <button
            type="button"
            onClick={() => void onUploadTemplate()}
            disabled={isUploading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? <FiLoader className="animate-spin" /> : <FiUpload />}
            Upload
          </button>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="text"
            value={uploadWatermarkText}
            onChange={(event) => setUploadWatermarkText(event.target.value)}
            placeholder="Watermark text"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#0F2942] outline-none focus:border-[#0F2942]"
          />
          <input
            type="number"
            min={12}
            max={200}
            value={uploadWatermarkFontSizePt}
            onChange={(event) =>
              setUploadWatermarkFontSizePt(Number(event.target.value || 48))
            }
            placeholder="Watermark size (pt)"
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-[#0F2942] outline-none focus:border-[#0F2942]"
          />
        </div>
        <p className="mt-2 text-xs font-semibold text-gray-500">
          Watermark text and size are saved per template and applied to
          downloaded PDF output and permit generation.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white shadow-sm">
        {templates.length === 0 ? (
          <div className="px-5 py-16 text-center text-sm font-semibold text-gray-500">
            No templates uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-208 border-collapse text-left">
              <thead className="bg-[#0F2942] text-xs uppercase tracking-wide text-white">
                <tr>
                  <th className="px-4 py-3">Linked Permit</th>
                  <th className="px-4 py-3">Template File</th>
                  <th className="px-4 py-3">Version</th>
                  <th className="px-4 py-3">Placeholders</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr
                    key={template._id}
                    className={`cursor-pointer border-b border-gray-100 ${
                      selectedTemplateId === template._id
                        ? "bg-slate-50"
                        : "bg-white"
                    }`}
                    onClick={() => setSelectedTemplateId(template._id)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#0F2942]">
                        {template.linkedPermitName || template.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-500">
                        {template.fileName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                      v{template.version}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                      {template.placeholders.length}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          template.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {template.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {template.status === "active" ? (
                          <button
                            type="button"
                            disabled={statusUpdatingId === template._id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void onSetStatus(template._id, "inactive");
                            }}
                            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700"
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={statusUpdatingId === template._id}
                            onClick={(event) => {
                              event.stopPropagation();
                              void onSetStatus(template._id, "active");
                            }}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
                          >
                            Activate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedTemplateId(template._id);
                            setShowDeleteModal(true);
                          }}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTemplate && (
        <Suspense fallback={mappingPanelFallback}>
          <PermitTemplateMappingPanel
            selectedTemplate={selectedTemplate}
            draftMappings={draftMappings}
            fieldMappingOptions={fieldMappingOptions}
            systemMappingOptions={systemMappingOptions}
            isEditMode={isEditMode}
            isSavingMappings={isSavingMappings}
            isReplacing={isReplacing}
            watermarkTextDraft={watermarkTextDraft}
            watermarkFontSizeDraft={watermarkFontSizeDraft}
            onWatermarkTextChange={setWatermarkTextDraft}
            onWatermarkFontSizeChange={setWatermarkFontSizeDraft}
            onToggleEditMode={onToggleEditMode}
            onSaveMappings={() => void onSaveMappings()}
            onChangeSourceType={onChangeSourceType}
            onChangePermitFieldMapping={onChangePermitFieldMapping}
            onChangeSystemFieldMapping={onChangeSystemFieldMapping}
            onChangeFixedValue={onChangeFixedValue}
            onChangeAutoIncrement={onChangeAutoIncrement}
            onReplaceFileChange={setReplaceFile}
            onReplaceTemplate={() => void onReplaceTemplate()}
          />
        </Suspense>
      )}

      {showDeleteModal && selectedTemplate && (
        <Suspense fallback={modalFallback}>
          <PermitTemplateDeleteModal
            permitName={selectedTemplate.linkedPermitName || selectedTemplate.name}
            isDeleting={isDeletingTemplate}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => void onDeleteTemplate()}
          />
        </Suspense>
      )}
    </div>
  );
}
