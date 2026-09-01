import {
  getPermitByIdApi,
  savePermitFormApi,
} from "@/api/super_admin/super_admin.api";
import PermitBuilderStructurePanel from "@/components/super_admin/permit_builder/PermitBuilderStructurePanel";
import {
  createField,
  createSection,
  getDraftStorageKey,
  getPlaceholderMode,
  normalizeField,
  normalizeFieldValidation,
  normalizeSections,
  readDraft,
  removeDraft,
  supportsPlaceholder,
  type PermitBuilderDraft,
  type PermitBuilderGroupedSection,
} from "@/components/super_admin/permit_builder/shared";
import {
  LazyModalFallback,
  LazyPanelFallback,
} from "@/components/ui/LazyFallback";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import type {
  PermitField,
  PermitFieldType,
  PermitPlaceholderMode,
  PermitSection,
  PermitType,
} from "@/types/permit/permit.type";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiEye, FiSave } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

const PermitBuilderFieldSettingsPanel = lazy(
  () => import("@/components/super_admin/permit_builder/PermitBuilderFieldSettingsPanel"),
);
const PermitBuilderPreviewPanel = lazy(
  () => import("@/components/super_admin/permit_builder/PermitBuilderPreviewPanel"),
);
const PermitBuilderSuccessModal = lazy(
  () => import("@/components/super_admin/permit_builder/PermitBuilderSuccessModal"),
);

const panelFallback = (
  <LazyPanelFallback
    title="Builder tools"
    description="Preparing field settings, validation controls, and editor actions."
    cardCount={2}
  />
);

const previewFallback = (
  <LazyPanelFallback
    title="Form preview"
    description="Preparing a live preview of the permit form."
    className="p-6"
    cardCount={4}
  />
);

const successModalFallback = (
  <LazyModalFallback
    title="Loading saved form confirmation"
    description="Preparing the permit builder success message."
    compact
    maxWidthClassName="max-w-md"
  />
);

export default function PermitBuilderPage() {
  const { permitId = "" } = useParams();
  const navigate = useNavigate();
  const draftStorageKey = useMemo(
    () => getDraftStorageKey(permitId),
    [permitId],
  );

  const [permit, setPermit] = useState<PermitType | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [sections, setSections] = useState<PermitSection[]>([]);
  const [fields, setFields] = useState<PermitField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [hasLoadedSaveSuccessModal, setHasLoadedSaveSuccessModal] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [isDraftInitialized, setIsDraftInitialized] = useState(false);

  const selectedField = useMemo(
    () => fields.find((field) => field.id === selectedFieldId) ?? null,
    [fields, selectedFieldId],
  );

  const selectedFieldSectionId =
    selectedField?.sectionId ?? sections[0]?.id ?? "";

  const groupedSections = useMemo<PermitBuilderGroupedSection[]>(
    () =>
      sections.map((section) => ({
        section,
        fields: fields.filter(
          (field) => (field.sectionId ?? sections[0]?.id ?? "") === section.id,
        ),
      })),
    [fields, sections],
  );

  const fetchPermit = useCallback(async () => {
    setIsDraftInitialized(false);
    setIsLoading(true);
    setError(null);
    setDraftMessage(null);

    try {
      const response = await getPermitByIdApi(permitId);
      const permitData = response.data;
      const normalized = normalizeSections(permitData);
      const fallbackSectionId = normalized[0].id;
      const normalizedFields = (permitData.fields ?? []).map((field) =>
        normalizeField(field, fallbackSectionId),
      );

      let nextFormTitle = permitData.formTitle || permitData.name;
      let nextFormDescription =
        permitData.formDescription || permitData.description || "";
      let nextSections = normalized;
      let nextFields = normalizedFields;
      let nextSelectedFieldId = normalizedFields[0]?.id ?? null;
      let nextSelectedSectionId = normalized[0]?.id ?? null;
      let nextShowPreview = false;

      const savedDraft = readDraft(draftStorageKey);
      if (savedDraft) {
        // Local builder draft takes precedence so admin can resume unfinished edits.
        nextFormTitle = savedDraft.formTitle;
        nextFormDescription = savedDraft.formDescription;
        nextSections =
          Array.isArray(savedDraft.sections) && savedDraft.sections.length > 0
            ? savedDraft.sections
            : normalized;

        const fallbackDraftSectionId = nextSections[0]?.id ?? fallbackSectionId;
        nextFields = Array.isArray(savedDraft.fields)
          ? savedDraft.fields.map((field) =>
              normalizeField(field, fallbackDraftSectionId),
            )
          : normalizedFields;

        nextSelectedFieldId =
          savedDraft.selectedFieldId &&
          nextFields.some((field) => field.id === savedDraft.selectedFieldId)
            ? savedDraft.selectedFieldId
            : (nextFields[0]?.id ?? null);

        nextSelectedSectionId =
          savedDraft.selectedSectionId &&
          nextSections.some(
            (section) => section.id === savedDraft.selectedSectionId,
          )
            ? savedDraft.selectedSectionId
            : (nextSections[0]?.id ?? null);

        nextShowPreview = Boolean(savedDraft.showPreview);
        setDraftMessage(
          "Draft restored from your last builder session on this device.",
        );
      }

      setPermit(permitData);
      setFormTitle(nextFormTitle);
      setFormDescription(nextFormDescription);
      setSections(nextSections);
      setFields(nextFields);
      setSelectedFieldId(nextSelectedFieldId);
      setSelectedSectionId(nextSelectedSectionId);
      setShowPreview(nextShowPreview);
      setIsDraftInitialized(true);
    } catch (err: unknown) {
      const nextError = err as { response?: { data?: { message?: string } } };
      setError(nextError?.response?.data?.message ?? "Failed to load permit form.");
    } finally {
      setIsLoading(false);
    }
  }, [draftStorageKey, permitId]);

  useEffect(() => {
    if (!permitId) return;
    void fetchPermit();
  }, [permitId, fetchPermit]);

  useEffect(() => {
    if (!permitId || !isDraftInitialized || typeof window === "undefined") {
      return;
    }

    const draftPayload: PermitBuilderDraft = {
      formTitle,
      formDescription,
      sections,
      fields,
      selectedFieldId,
      selectedSectionId,
      showPreview,
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
  }, [
    permitId,
    formTitle,
    formDescription,
    sections,
    fields,
    selectedFieldId,
    selectedSectionId,
    showPreview,
    draftStorageKey,
    isDraftInitialized,
  ]);

  useEffect(() => {
    if (!permitId || !isDraftInitialized || typeof window === "undefined") {
      return;
    }

    const handleBeforeUnload = () => {
      // Backup save for tab close/refresh while builder session is active.
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          formTitle,
          formDescription,
          sections,
          fields,
          selectedFieldId,
          selectedSectionId,
          showPreview,
          updatedAt: new Date().toISOString(),
        } satisfies PermitBuilderDraft),
      );
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    permitId,
    formTitle,
    formDescription,
    sections,
    fields,
    selectedFieldId,
    selectedSectionId,
    showPreview,
    draftStorageKey,
    isDraftInitialized,
  ]);

  const handleAddSection = () => {
    const nextSection = createSection();
    setSections((prev) => [...prev, nextSection]);
    setSelectedSectionId(nextSection.id);
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<PermitSection>,
  ) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section,
      ),
    );
  };

  const deleteSection = (sectionId: string) => {
    setSections((prev) => {
      if (prev.length <= 1) return prev;

      const nextSections = prev.filter((section) => section.id !== sectionId);
      const fallbackSectionId = nextSections[0].id;

      setFields((currentFields) =>
        // Re-home orphaned fields to the next available section.
        currentFields.map((field) =>
          field.sectionId === sectionId
            ? { ...field, sectionId: fallbackSectionId }
            : field,
        ),
      );

      if (selectedSectionId === sectionId) {
        setSelectedSectionId(fallbackSectionId);
      }

      return nextSections;
    });
  };

  const handleAddField = (type: PermitFieldType) => {
    const fallbackSectionId = selectedSectionId || sections[0]?.id;
    if (!fallbackSectionId) return;

    const newField = createField(type, fallbackSectionId);
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  };

  const updateField = (fieldId: string, updates: Partial<PermitField>) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === fieldId
          ? (() => {
              const nextField = { ...field, ...updates };
              const placeholderMode = getPlaceholderMode(nextField);

              return {
                ...nextField,
                placeholderMode,
                placeholder:
                  supportsPlaceholder(nextField.type) &&
                  placeholderMode === "automatic"
                    ? nextField.label
                    : (nextField.placeholder ?? ""),
                validation: normalizeFieldValidation(
                  nextField.type,
                  nextField.validation,
                ),
              };
            })()
          : field,
      ),
    );
  };

  const handlePlaceholderModeChange = (
    fieldId: string,
    mode: PermitPlaceholderMode,
  ) => {
    updateField(fieldId, { placeholderMode: mode });
  };

  const deleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
  };

  const moveField = (fieldId: string, direction: "up" | "down") => {
    setFields((prev) => {
      const index = prev.findIndex((field) => field.id === fieldId);
      if (index < 0) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const next = [...prev];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  };

  const handleSaveForm = async () => {
    if (!permitId) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await savePermitFormApi(permitId, {
        formTitle,
        formDescription,
        sections,
        fields,
      });
      setPermit(response.data);
      removeDraft(draftStorageKey);
      setDraftMessage(null);
      setHasLoadedSaveSuccessModal(true);
      setShowSaveSuccessModal(true);
    } catch (err: unknown) {
      const nextError = err as { response?: { data?: { message?: string } } };
      setError(nextError?.response?.data?.message ?? "Failed to save permit form.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  if (!permit) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
        {error ?? "Permit not found."}
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-4 pb-24 sm:gap-6 md:pb-0">
      {hasLoadedSaveSuccessModal && (
        <Suspense fallback={successModalFallback}>
          <PermitBuilderSuccessModal
            isOpen={showSaveSuccessModal}
            onClose={() => setShowSaveSuccessModal(false)}
          />
        </Suspense>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate("/home/super_admin/permits")}
            className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#0F2942] hover:text-[#1E3A56]"
          >
            <FiArrowLeft />
            Back to permits
          </button>
          <h2 className="text-2xl font-black tracking-wide text-[#0F2942] md:text-3xl">
            {permit.name} Form Builder
          </h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Create sections and arrange dynamic fields per section.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#0F2942] px-5 py-2.5 font-bold text-[#0F2942] transition-all hover:bg-[#0F2942] hover:text-white sm:w-auto"
          >
            <FiEye />
            {showPreview ? "Back to Builder" : "Preview Form"}
          </button>
          <button
            type="button"
            onClick={handleSaveForm}
            disabled={isSaving}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0F2942] px-5 py-2.5 font-bold text-white transition-all hover:bg-[#1E3A56] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <FiSave />
            {isSaving ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <p className="font-semibold">
          {draftMessage ??
            "Your builder changes are auto-saved on this device, including sections, fields, options, and layout changes."}
        </p>
      </div>

      {showPreview ? (
        <Suspense fallback={previewFallback}>
          <PermitBuilderPreviewPanel
            title={formTitle}
            permitName={permit.name}
            description={formDescription}
            groupedSections={groupedSections}
          />
        </Suspense>
      ) : (
        <div className="grid grid-cols-1 items-start gap-4 sm:gap-6 xl:grid-cols-[2fr_1fr]">
          <PermitBuilderStructurePanel
            formTitle={formTitle}
            formDescription={formDescription}
            sections={sections}
            fields={fields}
            selectedFieldId={selectedFieldId}
            onFormTitleChange={setFormTitle}
            onFormDescriptionChange={setFormDescription}
            onAddSection={handleAddSection}
            onUpdateSection={updateSection}
            onDeleteSection={deleteSection}
            onSelectSection={setSelectedSectionId}
            onAddField={handleAddField}
            onMoveField={moveField}
            onSelectField={setSelectedFieldId}
            onDeleteField={deleteField}
          />

          <Suspense fallback={panelFallback}>
            <PermitBuilderFieldSettingsPanel
              selectedField={selectedField}
              selectedFieldSectionId={selectedFieldSectionId}
              sections={sections}
              onUpdateField={updateField}
              onPlaceholderModeChange={handlePlaceholderModeChange}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}
