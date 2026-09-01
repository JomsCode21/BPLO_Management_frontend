import {
  getOwnerApplicationByIdApi,
  getOwnerPermitByIdApi,
  resubmitOwnerApplicationApi,
  submitOwnerPermitApplicationApi,
} from "@/api/owner/owner.api";
import StatusModal from "@/components/feedback/StatusModal";
import { HomeFallbackSkeleton } from "@/layouts/home/home-fallback-skeletons";
import PermitApplicationReviewStep from "@/components/owner/permit_application/PermitApplicationReviewStep";
import PermitApplicationSectionStep from "@/components/owner/permit_application/PermitApplicationSectionStep";
import { useOwnerStatusStore } from "@/stores/owner/owner-status.store";
import {
  buildDraftPayload,
  buildSectionGroups,
  fileToPayload,
  getConstraintError,
  getDefaultValue,
  getDraftStorageKey,
  normalizeSections,
  readDraft,
  removeDraft,
  sanitizeByConstraint,
  type ExistingFileState,
  type FileValueState,
  type FormValueState,
  type PermitApplicationStep,
  type PermitFormResponse,
} from "@/components/owner/permit_application/shared";
import type {
  PermitApplicationResponsePayload,
  PermitField,
  PermitType,
} from "@/types/permit/permit.type";
import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function PermitApplicationFormPage() {
  const navigate = useNavigate();
  const { permitId = "" } = useParams();
  const fetchStatuses = useOwnerStatusStore((state) => state.fetchStatuses);
  const [searchParams] = useSearchParams();
  // `applicationId` is present only when the owner is re-submitting an existing
  // application after evaluator feedback.
  const applicationId = searchParams.get("applicationId")?.trim() || "";
  const draftStorageKey = useMemo(
    () => getDraftStorageKey(permitId, applicationId),
    [permitId, applicationId],
  );
  const isResubmission = Boolean(applicationId);

  const [permit, setPermit] = useState<PermitType | null>(null);
  const [values, setValues] = useState<FormValueState>({});
  const [filesByField, setFilesByField] = useState<FileValueState>({});
  const [existingFilesByField, setExistingFilesByField] =
    useState<ExistingFileState>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [redirectPath, setRedirectPath] = useState("/home");
  const [step, setStep] = useState<PermitApplicationStep>("section");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [resubmitRemark, setResubmitRemark] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [isDraftInitialized, setIsDraftInitialized] = useState(false);

  const clearFieldError = (fieldId: string) => {
    setErrors((prev) => {
      if (!prev[fieldId]) return prev;
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  };

  useEffect(() => {
    const fetchPermit = async () => {
      setIsDraftInitialized(false);
      setIsLoading(true);
      setError(null);
      setResubmitRemark(null);
      setDraftMessage(null);

      try {
        const [permitResponse, applicationResponse] = await Promise.all([
          // Keep permit definition and optional existing application in sync
          // before hydrating the form state.
          getOwnerPermitByIdApi(permitId, {
            applicationId: isResubmission ? applicationId : undefined,
          }),
          applicationId ? getOwnerApplicationByIdApi(applicationId) : null,
        ]);

        const permitData = permitResponse.data;
        const sections = normalizeSections(permitData);
        const fallbackSectionId = sections[0].id;
        const normalizedFields = (permitData.fields ?? []).map((field) => ({
          ...field,
          sectionId: field.sectionId || fallbackSectionId,
        }));

        setPermit({
          ...permitData,
          sections,
          fields: normalizedFields,
        });

        const initialValues: FormValueState = {};
        const initialFiles: FileValueState = {};
        const initialExistingFiles: ExistingFileState = {};

        for (const field of normalizedFields) {
          initialValues[field.id] = getDefaultValue(field);
          initialFiles[field.id] = [];
          initialExistingFiles[field.id] = [];
        }

        let nextStep: PermitApplicationStep = "section";
        let nextSectionIndex = 0;

        const applicationData = applicationResponse?.data;
        if (applicationData) {
          setResubmitRemark(applicationData.evaluatorRemark || null);

          for (const response of applicationData.responses ?? []) {
            if (
              !Object.prototype.hasOwnProperty.call(
                initialValues,
                response.fieldId,
              )
            ) {
              continue;
            }

            if (response.type === "file") {
              initialExistingFiles[response.fieldId] = response.files ?? [];
              continue;
            }

            if (Array.isArray(response.value)) {
              initialValues[response.fieldId] = response.value;
              continue;
            }

            initialValues[response.fieldId] = String(response.value ?? "");
          }
        }

        const savedDraft = readDraft(draftStorageKey);
        if (savedDraft) {
          // Local draft data takes precedence so owners can continue where they
          // stopped on this specific device/session.
          for (const field of normalizedFields) {
            const draftValue = savedDraft.values?.[field.id];

            if (field.type === "checkbox") {
              if (Array.isArray(draftValue)) {
                initialValues[field.id] = draftValue;
              }
              continue;
            }

            if (typeof draftValue === "string") {
              initialValues[field.id] = draftValue;
            }

            if (field.type === "file") {
              const draftExistingFiles =
                savedDraft.existingFilesByField?.[field.id];
              if (Array.isArray(draftExistingFiles)) {
                initialExistingFiles[field.id] = draftExistingFiles;
              }
            }
          }

          nextStep = savedDraft.step === "review" ? "review" : "section";
          nextSectionIndex = Math.min(
            Math.max(savedDraft.currentSectionIndex ?? 0, 0),
            Math.max(sections.length - 1, 0),
          );
          setDraftMessage(
            savedDraft.hasPendingFiles
              ? "Draft restored. Re-attach any files you selected before closing the page."
              : "Draft restored from your last session on this device.",
          );
        }

        setValues(initialValues);
        setFilesByField(initialFiles);
        setExistingFilesByField(initialExistingFiles);
        setCurrentSectionIndex(nextSectionIndex);
        setStep(nextStep);
        setIsDraftInitialized(true);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load permit form.";
        const apiMessage = (
          err as Record<string, Record<string, Record<string, unknown>>>
        )?.response?.data?.message;
        setError(String(apiMessage ?? errorMessage));
      } finally {
        setIsLoading(false);
      }
    };

    if (permitId) {
      void fetchPermit();
    }
  }, [permitId, applicationId, draftStorageKey]);

  useEffect(() => {
    if (!permit || !isDraftInitialized || typeof window === "undefined") return;

    // Auto-save on state changes to avoid accidental data loss while navigating
    // between form sections.
    const draftPayload = buildDraftPayload({
      permitFields: permit.fields ?? [],
      values,
      existingFilesByField,
      filesByField,
      currentSectionIndex,
      step,
    });

    window.localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
  }, [
    permit,
    values,
    existingFilesByField,
    filesByField,
    currentSectionIndex,
    step,
    draftStorageKey,
    isDraftInitialized,
  ]);

  useEffect(() => {
    if (!permit || !isDraftInitialized || typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      // Backup save for tab close/refresh; selected `File` objects are not
      // serialized and are intentionally re-attached by the owner.
      const draftPayload = buildDraftPayload({
        permitFields: permit.fields ?? [],
        values,
        existingFilesByField,
        filesByField,
        currentSectionIndex,
        step,
      });

      window.localStorage.setItem(draftStorageKey, JSON.stringify(draftPayload));
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    permit,
    values,
    existingFilesByField,
    filesByField,
    currentSectionIndex,
    step,
    draftStorageKey,
    isDraftInitialized,
  ]);

  const groupedSections = useMemo(
    () => (permit ? buildSectionGroups(permit) : []),
    [permit],
  );

  const currentSectionGroup = groupedSections[currentSectionIndex] ?? null;

  const validateFields = (fieldsToValidate: PermitField[]) => {
    const nextErrors = { ...errors };

    for (const field of fieldsToValidate) {
      if (field.type === "file") {
        const selectedFiles = filesByField[field.id] ?? [];
        const existingFiles = existingFilesByField[field.id] ?? [];

        if (field.required && selectedFiles.length + existingFiles.length === 0) {
          nextErrors[field.id] = "This field is required.";
        } else {
          delete nextErrors[field.id];
        }
        continue;
      }

      const rawValue = values[field.id];
      if (field.type === "checkbox") {
        if (field.required && (!Array.isArray(rawValue) || rawValue.length === 0)) {
          nextErrors[field.id] = "Please select at least one option.";
        } else {
          delete nextErrors[field.id];
        }
        continue;
      }

      if (field.required && !String(rawValue ?? "").trim()) {
        nextErrors[field.id] = "This field is required.";
        continue;
      }

      const constraintError = getConstraintError(field, rawValue);
      if (constraintError) {
        nextErrors[field.id] = constraintError;
      } else {
        delete nextErrors[field.id];
      }
    }

    setErrors(nextErrors);
    return fieldsToValidate.every((field) => !nextErrors[field.id]);
  };

  const validateAllFields = () => {
    if (!permit) return false;
    return validateFields(permit.fields ?? []);
  };

  const handleNext = () => {
    if (!currentSectionGroup) return;
    const isValid = validateFields(currentSectionGroup.fields);
    if (!isValid) return;

    const isLastSection = currentSectionIndex >= groupedSections.length - 1;
    if (isLastSection) {
      setStep("review");
      return;
    }

    setCurrentSectionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (step === "review") {
      setStep("section");
      setCurrentSectionIndex(Math.max(groupedSections.length - 1, 0));
      return;
    }

    setCurrentSectionIndex((prev) => Math.max(prev - 1, 0));
  };

  const formResponses = useMemo<PermitFormResponse[]>(() => {
    if (!permit) return [];

    return (permit.fields ?? []).map((field) => ({
      field,
      value: values[field.id],
      files: filesByField[field.id] ?? [],
      existingFiles: existingFilesByField[field.id] ?? [],
    }));
  }, [permit, values, filesByField, existingFilesByField]);

  const formResponsesByFieldId = useMemo<
    Partial<Record<string, PermitFormResponse>>
  >(() => {
    const next: Partial<Record<string, PermitFormResponse>> = {};

    for (const response of formResponses) {
      next[response.field.id] = response;
    }

    return next;
  }, [formResponses]);

  const buildPayload = async (): Promise<
    PermitApplicationResponsePayload[]
  > => {
    if (!permit) return [];

    const payload: PermitApplicationResponsePayload[] = [];

    for (const field of permit.fields ?? []) {
      if (field.type === "file") {
        // Upload newly selected files first, then merge with preserved existing
        // files to avoid unintentionally dropping attachments during resubmission.
        const files = filesByField[field.id] ?? [];
        const uploadedFiles = await Promise.all(
          files.map((file) => fileToPayload(file)),
        );
        const existingFiles = existingFilesByField[field.id] ?? [];

        payload.push({
          fieldId: field.id,
          files: [...existingFiles, ...uploadedFiles],
        });
        continue;
      }

      const rawValue = values[field.id];
      if (field.type === "checkbox") {
        payload.push({
          fieldId: field.id,
          value: Array.isArray(rawValue) ? rawValue : [],
        });
        continue;
      }

      payload.push({
        fieldId: field.id,
        value: String(rawValue ?? ""),
      });
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!permit) return;
    if (!validateAllFields()) return;

    setIsSubmitting(true);
    setError(null);
    setShowSuccessModal(false);

    try {
      const responses = await buildPayload();

      if (isResubmission) {
        await resubmitOwnerApplicationApi(applicationId, { responses });
      } else {
        await submitOwnerPermitApplicationApi(permit._id, { responses });
      }

      // Successful submit invalidates this local draft and refreshes sidebar/
      // status counters that depend on owner application feed data.
      removeDraft(draftStorageKey);
      setDraftMessage(null);
      void fetchStatuses({ force: true }).catch(() => {
        // Ignore follow-up status refresh failures after a successful submit.
      });
      setSuccessMessage(
        isResubmission
          ? "Application re-submitted successfully."
          : "Application submitted successfully.",
      );
      setRedirectPath("/home");
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please try again.";
      const apiMessage = (
        err as Record<string, Record<string, Record<string, unknown>>>
      )?.response?.data?.message;
      setError(String(apiMessage ?? errorMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFieldValueChange = (fieldId: string, nextValue: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: nextValue }));
    clearFieldError(fieldId);
  };

  const handleCheckboxChange = (
    fieldId: string,
    option: string,
    checked: boolean,
  ) => {
    setValues((prev) => {
      const current = Array.isArray(prev[fieldId])
        ? [...(prev[fieldId] as string[])]
        : [];
      const next = checked
        ? Array.from(new Set([...current, option]))
        : current.filter((item) => item !== option);

      return { ...prev, [fieldId]: next };
    });
    clearFieldError(fieldId);
  };

  const handleTextInputChange = (field: PermitField, nextValue: string) => {
    const sanitizedValue = sanitizeByConstraint(field, nextValue);
    setValues((prev) => ({ ...prev, [field.id]: sanitizedValue }));

    const constraintError = getConstraintError(field, sanitizedValue);
    setErrors((prev) => {
      const next = { ...prev };
      if (constraintError) {
        next[field.id] = constraintError;
      } else {
        delete next[field.id];
      }
      return next;
    });
  };

  const handleFileChange = (fieldId: string, nextFiles: File[]) => {
    setFilesByField((prev) => ({
      ...prev,
      [fieldId]: nextFiles,
    }));

    if (nextFiles.length > 0) {
      setExistingFilesByField((prev) => ({
        ...prev,
        [fieldId]: [],
      }));
      clearFieldError(fieldId);
    }
  };

  const removeExistingFile = (fieldId: string, fileUrl: string) => {
    setExistingFilesByField((prev) => ({
      ...prev,
      [fieldId]: (prev[fieldId] ?? []).filter((file) => file.url !== fileUrl),
    }));
  };

  if (isLoading) {
    return <HomeFallbackSkeleton pathname={window.location.pathname} />;
  }

  if (!permit) {
    return (
      <div className="min-h-screen p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error ?? "Permit not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10 xl:px-12">
      <StatusModal
        isOpen={showSuccessModal}
        type="success"
        title="Application Submitted"
        message={successMessage}
        autoCloseMs={2200}
        onClose={() => {
          setShowSuccessModal(false);
          navigate(redirectPath, { replace: true });
        }}
      />

      <div className="mx-auto max-w-4xl space-y-5">
        <button
          onClick={() =>
            navigate(
              isResubmission
                ? "/home/user/application-status"
                : "/home/user/application-request",
            )
          }
          className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#0F2942] hover:text-[#1E3A56]"
        >
          <FiArrowLeft />
          {isResubmission ? "Back to application status" : "Back to permits"}
        </button>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}
        {isResubmission && resubmitRemark && (
          <div className="rounded-3xl border border-amber-100 bg-amber-50 p-6 sm:p-8">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-800">
              <FiAlertCircle />
              Evaluator Remarks
            </h3>
            <p className="font-medium leading-relaxed text-amber-900">
              {resubmitRemark}
            </p>
          </div>
        )}
        <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">
            {draftMessage ??
              "Your progress is auto-saved on this device while filling out this form."}
          </p>
          <p className="mt-1 text-blue-800/80">
            Newly selected files cannot be restored after the page is closed, so
            you may need to attach them again.
          </p>
        </div>

        <div className="rounded-md border border-gray-300 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-black uppercase tracking-wide text-black md:text-3xl">
            {permit.formTitle || permit.name}
          </h1>
          {!!permit.formDescription && (
            <p className="mt-2 text-gray-700">{permit.formDescription}</p>
          )}

          {step === "section" && currentSectionGroup ? (
            <PermitApplicationSectionStep
              currentSectionGroup={currentSectionGroup}
              currentSectionIndex={currentSectionIndex}
              totalSections={groupedSections.length}
              values={values}
              errors={errors}
              existingFilesByField={existingFilesByField}
              onTextChange={handleTextInputChange}
              onValueChange={handleFieldValueChange}
              onCheckboxChange={handleCheckboxChange}
              onFileChange={handleFileChange}
              onRemoveExistingFile={removeExistingFile}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isFirstSection={currentSectionIndex === 0}
              isLastSection={currentSectionIndex === groupedSections.length - 1}
            />
          ) : (
            <PermitApplicationReviewStep
              groupedSections={groupedSections}
              responsesByFieldId={formResponsesByFieldId}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              isResubmission={isResubmission}
            />
          )}
        </div>
      </div>
    </div>
  );
}
