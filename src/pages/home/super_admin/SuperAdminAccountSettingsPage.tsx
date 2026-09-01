import {
  changePasswordApi,
  updateProfileApi,
  verifyCurrentPasswordApi,
} from "@/api/auth/auth.api";
import { updateBrandingLogoApi } from "@/api/branding/branding.api";
import {
  deleteRenderedFileUrl,
  getImageRenderUrl,
  uploadImageFileWithRandomFolder,
} from "@/api/file_uploader/file_uploader";
import savedAnimation from "@/assets/Saved.lottie?url";
import StatusModal from "@/components/feedback/StatusModal";
import SuperAdminAccountSettingsBrandingSection from "@/components/super_admin/account_settings/SuperAdminAccountSettingsBrandingSection";
import SuperAdminAccountSettingsPageSkeleton from "@/components/super_admin/account_settings/SuperAdminAccountSettingsPageSkeleton";
import SuperAdminAccountSettingsProfilePreviewModal from "@/components/super_admin/account_settings/SuperAdminAccountSettingsProfilePreviewModal";
import SuperAdminAccountSettingsProfileSection from "@/components/super_admin/account_settings/SuperAdminAccountSettingsProfileSection";
import SuperAdminAccountSettingsSecuritySection from "@/components/super_admin/account_settings/SuperAdminAccountSettingsSecuritySection";
import {
  buildInitialPasswordForm,
  buildInitialProfile,
  getPasswordStrength,
  getRoleLabel,
  isManagedUploaderImageUrl,
  normalizeProfile,
  validatePasswordForm,
  validateProfile,
  type PasswordErrors,
  type PasswordFormState,
  type PasswordVisibilityState,
  type ProfileErrors,
  type ProfileFormState,
} from "@/components/super_admin/account_settings/shared";
import { useAuthStore } from "@/stores/auth/auth.store";
import { useBrandingStore } from "@/stores/branding/branding.store";
import { getErrorMessage } from "@/utils/error/error.util";
import {
  shouldCleanupUploadedBrandingLogoOnFailure,
  shouldDeletePreviousBrandingLogo,
} from "@/utils/super_admin/branding-logo-replacement.util";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import toast from "react-hot-toast";
import { FiEdit3, FiImage, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

type SuccessStatus = {
  isOpen: boolean;
  title: string;
  message: string;
};

const ENTRY_SKELETON_MS = 650;

export default function SuperAdminAccountSettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);
  const brandingLogoUrl = useBrandingStore((s) => s.logoUrl);
  const fetchBrandingLogo = useBrandingStore((s) => s.fetchLogo);
  const setBrandingLogoUrl = useBrandingStore((s) => s.setLogoUrl);

  const [profile, setProfile] = useState<ProfileFormState>(() =>
    buildInitialProfile(user),
  );
  const [savedProfile, setSavedProfile] = useState<ProfileFormState>(() =>
    buildInitialProfile(user),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>(
    buildInitialPasswordForm,
  );
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [showPasswords, setShowPasswords] = useState<PasswordVisibilityState>({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isCurrentPasswordVerified, setIsCurrentPasswordVerified] =
    useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl ?? "",
  );
  const [savedProfilePictureUrl, setSavedProfilePictureUrl] = useState(
    user?.profilePictureUrl ?? "",
  );
  const [draftProfilePictureUrl, setDraftProfilePictureUrl] = useState("");
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] =
    useState(false);
  const [isUploadingBrandingLogo, setIsUploadingBrandingLogo] = useState(false);
  const [isPageBootstrapping, setIsPageBootstrapping] = useState(true);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
  const [successStatus, setSuccessStatus] = useState<SuccessStatus>({
    isOpen: false,
    title: "",
    message: "",
  });
  const profilePictureInputRef = useRef<HTMLInputElement | null>(null);
  const brandingLogoInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedRole = String(user?.role ?? "")
    .trim()
    .toLowerCase();
  const canManageBranding = normalizedRole === "super_admin";

  useEffect(() => {
    if (!canManageBranding) return;
    // Branding is super-admin scoped; fetch only when role is authorized.
    void fetchBrandingLogo();
  }, [canManageBranding, fetchBrandingLogo]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsPageBootstrapping(false);
    }, ENTRY_SKELETON_MS);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const normalizedCurrentProfile = useMemo(
    () => normalizeProfile(profile),
    [profile],
  );
  const normalizedSavedProfile = useMemo(
    () => normalizeProfile(savedProfile),
    [savedProfile],
  );

  const hasChanges = useMemo(
    () =>
      JSON.stringify(normalizedCurrentProfile) !==
        JSON.stringify(normalizedSavedProfile) ||
      profilePictureUrl.trim() !== savedProfilePictureUrl.trim(),
    [
      normalizedCurrentProfile,
      normalizedSavedProfile,
      profilePictureUrl,
      savedProfilePictureUrl,
    ],
  );

  const userRoleLabel = useMemo(() => getRoleLabel(user?.role), [user?.role]);

  const fullName = useMemo(() => {
    const parts = [profile.firstName, profile.lastName]
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return userRoleLabel;
    return parts.join(" ");
  }, [profile.firstName, profile.lastName, userRoleLabel]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordForm.newPassword),
    [passwordForm.newPassword],
  );
  const passwordsMatch = Boolean(
    passwordForm.newPassword &&
    passwordForm.confirmNewPassword &&
    passwordForm.newPassword === passwordForm.confirmNewPassword,
  );
  const profileCompletionPercent = useMemo(() => {
    const completedFields = [
      profile.firstName,
      profile.lastName,
      profile.email,
      profile.contactNumber,
      profilePictureUrl,
    ].filter((value) => value.trim().length > 0).length;

    return Math.round((completedFields / 5) * 100);
  }, [
    profile.contactNumber,
    profile.email,
    profile.firstName,
    profile.lastName,
    profilePictureUrl,
  ]);

  const setField = <K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
    setErrors((previous) => {
      if (!previous[key]) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[key];
      return nextErrors;
    });
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    const pendingDraftProfilePictureUrl = draftProfilePictureUrl.trim();

    if (
      pendingDraftProfilePictureUrl &&
      pendingDraftProfilePictureUrl !== savedProfilePictureUrl &&
      isManagedUploaderImageUrl(pendingDraftProfilePictureUrl)
    ) {
      // Remove unsaved uploaded draft to avoid orphaning files.
      void deleteRenderedFileUrl(pendingDraftProfilePictureUrl).catch(
        (deleteError) => {
          console.error(
            "Failed to delete unsaved profile picture draft:",
            deleteError,
          );
        },
      );
    }

    setProfile(savedProfile);
    setProfilePictureUrl(savedProfilePictureUrl);
    setDraftProfilePictureUrl("");
    setErrors({});
    setIsEditing(false);
  };

  const showSavedStatusModal = (title: string, message: string) => {
    setSuccessStatus({
      isOpen: true,
      title,
      message,
    });
  };

  const handleSaveProfile = async () => {
    if (!hasChanges) return;

    const normalized = normalizeProfile(profile);
    const validationErrors = validateProfile(normalized);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await updateProfileApi({
        firstName: normalized.firstName,
        middleName: normalized.middleName || undefined,
        lastName: normalized.lastName,
        email: normalized.email,
        contactNumber: normalized.contactNumber || undefined,
        profilePictureUrl: profilePictureUrl.trim() || undefined,
      });

      const previousSavedProfilePictureUrl = savedProfilePictureUrl.trim();
      const nextProfilePictureUrl =
        response.user?.profilePictureUrl ?? profilePictureUrl.trim();

      if (response.user) {
        setUser(response.user);
        if (typeof response.user.profilePictureUrl === "string") {
          setProfilePictureUrl(response.user.profilePictureUrl);
        }
      }

      setSavedProfile(normalized);
      setProfile(normalized);
      setSavedProfilePictureUrl(nextProfilePictureUrl);
      setDraftProfilePictureUrl("");
      setErrors({});
      setIsEditing(false);

      if (
        previousSavedProfilePictureUrl &&
        previousSavedProfilePictureUrl !== nextProfilePictureUrl &&
        isManagedUploaderImageUrl(previousSavedProfilePictureUrl)
      ) {
        // Cleanup replaced uploader-managed image after successful profile save.
        void deleteRenderedFileUrl(previousSavedProfilePictureUrl).catch(
          (deleteError) => {
            console.error(
              "Failed to delete replaced profile picture:",
              deleteError,
            );
          },
        );
      }

      showSavedStatusModal(
        "Profile Updated",
        "Your account settings have been saved successfully.",
      );
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(getErrorMessage(error, "Failed to update account settings."));
    } finally {
      setIsSaving(false);
    }
  };

  const setPasswordField = <K extends keyof PasswordFormState>(
    key: K,
    value: PasswordFormState[K],
  ) => {
    setPasswordForm((previous) => {
      if (key !== "currentPassword") {
        return { ...previous, [key]: value };
      }

      return {
        ...previous,
        currentPassword: value,
        ...(isCurrentPasswordVerified
          ? {
              newPassword: "",
              confirmNewPassword: "",
            }
          : {}),
      };
    });
    setPasswordErrors((previous) => {
      if (key !== "currentPassword" && !previous[key]) return previous;
      const nextErrors = { ...previous };
      delete nextErrors[key];

      if (key === "currentPassword") {
        delete nextErrors.newPassword;
        delete nextErrors.confirmNewPassword;
      }

      return nextErrors;
    });

    if (key === "currentPassword" && isCurrentPasswordVerified) {
      setIsCurrentPasswordVerified(false);
      setShowPasswords((previous) => ({
        ...previous,
        newPassword: false,
        confirmNewPassword: false,
      }));
    }
  };

  const togglePasswordVisibility = (key: keyof PasswordVisibilityState) => {
    setShowPasswords((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const resetVerifiedPasswordState = () => {
    setPasswordForm(buildInitialPasswordForm());
    setPasswordErrors({});
    setShowPasswords({
      currentPassword: false,
      newPassword: false,
      confirmNewPassword: false,
    });
    setIsNewPasswordFocused(false);
    setIsCurrentPasswordVerified(false);
  };

  const handleVerifyCurrentPassword = async () => {
    if (!passwordForm.currentPassword.trim()) {
      setPasswordErrors({ currentPassword: "Current password is required." });
      toast.error("Enter your current password first.");
      return;
    }

    setIsVerifyingPassword(true);

    try {
      const response = await verifyCurrentPasswordApi(
        passwordForm.currentPassword,
      );

      setIsCurrentPasswordVerified(true);
      setPasswordErrors((previous) => {
        const nextErrors = { ...previous };
        delete nextErrors.currentPassword;
        return nextErrors;
      });

      toast.success(response.message ?? "Current password verified.");
    } catch (error) {
      setIsCurrentPasswordVerified(false);
      setPasswordErrors({
        currentPassword: getErrorMessage(
          error,
          "Current password is incorrect.",
        ),
      });
      toast.error(getErrorMessage(error, "Failed to verify current password."));
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handleChangePassword = async () => {
    if (!isCurrentPasswordVerified) {
      setPasswordErrors((previous) => ({
        ...previous,
        currentPassword: "Please verify your current password first.",
      }));
      toast.error("Verify your current password first.");
      return;
    }

    const validationErrors = validatePasswordForm(passwordForm);

    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors);
      toast.error("Please fix the password fields.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await changePasswordApi(
        passwordForm.currentPassword,
        passwordForm.newPassword,
      );

      resetVerifiedPasswordState();

      showSavedStatusModal(
        "Password Updated",
        response.message ?? "Your password has been changed successfully.",
      );

      setTimeout(() => {
        clearSession();
        navigate("/auth/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error(getErrorMessage(error, "Failed to change password."));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleOpenProfilePreview = () => {
    if (!profilePictureUrl) return;
    setIsProfilePreviewOpen(true);
  };

  const handleOpenProfilePicturePicker = () => {
    if (!isEditing || isUploadingProfilePicture) return;
    profilePictureInputRef.current?.click();
  };

  const handleProfilePictureSelected = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!isEditing) {
      event.target.value = "";
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setIsUploadingProfilePicture(true);

    try {
      const existingDraftProfilePictureUrl = draftProfilePictureUrl.trim();

      try {
        if (
          existingDraftProfilePictureUrl &&
          existingDraftProfilePictureUrl !== savedProfilePictureUrl &&
          isManagedUploaderImageUrl(existingDraftProfilePictureUrl)
        ) {
          await deleteRenderedFileUrl(existingDraftProfilePictureUrl);
        }
      } catch (deleteError) {
        console.error(
          "Failed to delete previous profile picture draft:",
          deleteError,
        );
      }

      const { folder, filename } = await uploadImageFileWithRandomFolder(
        selectedFile,
        "bplo/profile/picture/",
      );
      const profilePictureRenderUrl = getImageRenderUrl(folder, filename);

      setProfilePictureUrl(profilePictureRenderUrl);
      setDraftProfilePictureUrl(profilePictureRenderUrl);
      toast.success("Profile picture selected. Click Save Changes to apply.");
    } catch (error) {
      console.error("Failed to update profile picture:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to upload profile picture.");
      } else {
        toast.error("Failed to upload profile picture.");
      }
    } finally {
      setIsUploadingProfilePicture(false);
      event.target.value = "";
    }
  };

  const handleOpenBrandingLogoPicker = () => {
    if (!canManageBranding || isUploadingBrandingLogo) return;
    brandingLogoInputRef.current?.click();
  };

  const handleBrandingLogoSelected = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    if (!canManageBranding) {
      event.target.value = "";
      return;
    }

    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setIsUploadingBrandingLogo(true);
    const existingImageUrl = brandingLogoUrl.trim();
    let uploadedLogoUrl = "";

    try {
      const { folder, filename } = await uploadImageFileWithRandomFolder(
        selectedFile,
        "bplo/branding/logo",
      );
      uploadedLogoUrl = getImageRenderUrl(folder, filename);
      const response = await updateBrandingLogoApi(uploadedLogoUrl);
      const nextLogoUrl = response.data?.logoUrl ?? uploadedLogoUrl;

      setBrandingLogoUrl(nextLogoUrl);

      if (
        shouldDeletePreviousBrandingLogo(
          existingImageUrl,
          nextLogoUrl,
          isManagedUploaderImageUrl,
        )
      ) {
        void deleteRenderedFileUrl(existingImageUrl).catch((deleteError) => {
          console.error(
            "Failed to delete replaced branding logo:",
            deleteError,
          );
        });
      }

      toast.success("BPLO logo updated successfully.");
    } catch (error) {
      if (
        shouldCleanupUploadedBrandingLogoOnFailure(
          uploadedLogoUrl,
          existingImageUrl,
          isManagedUploaderImageUrl,
        )
      ) {
        try {
          await deleteRenderedFileUrl(uploadedLogoUrl);
        } catch (deleteError) {
          console.error(
            "Failed to delete uploaded branding logo after save error:",
            deleteError,
          );
        }
      }

      console.error("Failed to update BPLO logo:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to upload BPLO logo.");
      } else {
        toast.error("Failed to upload BPLO logo.");
      }
    } finally {
      setIsUploadingBrandingLogo(false);
      event.target.value = "";
    }
  };

  if (isPageBootstrapping) {
    return (
      <SuperAdminAccountSettingsPageSkeleton showBranding={canManageBranding} />
    );
  }

  return (
    <div className="mx-auto min-h-full w-full max-w-7xl overflow-x-clip rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#f7fafc_0%,#eef4f7_42%,#f8f9fb_100%)] p-4 pb-[calc(7.5rem+env(safe-area-inset-bottom))] shadow-[0_35px_90px_-48px_rgba(15,41,66,0.45)] sm:p-6 sm:pb-24 md:p-8 md:pb-10 lg:rounded-[30px]">
      <SuperAdminAccountSettingsProfilePreviewModal
        isOpen={isProfilePreviewOpen}
        imageUrl={profilePictureUrl}
        fullName={fullName}
        onClose={() => setIsProfilePreviewOpen(false)}
      />

      <StatusModal
        isOpen={successStatus.isOpen}
        type="success"
        title={successStatus.title}
        message={successStatus.message}
        successAnimationSrc={savedAnimation}
        autoCloseMs={2000}
        onClose={() =>
          setSuccessStatus((previous) => ({
            ...previous,
            isOpen: false,
          }))
        }
      />

      <div className="mx-auto w-full">
        <section
          className="relative overflow-hidden rounded-[30px] border border-[#0F2942]/10 bg-[#0F2942] px-5 py-6 text-white shadow-[0_28px_70px_-45px_rgba(15,41,66,0.9)] sm:px-6 sm:py-6 lg:rounded-[32px] lg:px-8 lg:py-7"
          data-super-admin-tour="account-settings-shell"
          data-evaluator-tour="account-settings-shell"
          data-inspector-tour="account-settings-shell"
          data-bplo-admin-tour="account-settings-shell"
        >
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-[#66D2E2]/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-5 2xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)] 2xl:items-end">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-[#BEEBF1]">
                Super Admin Settings
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-[-0.04em] text-white sm:text-4xl 2xl:text-[3.15rem] 2xl:leading-[1.04]">
                  Shape the account, security, and branding details that power
                  the BPLO experience.
                </h1>
                <p className="max-w-3xl text-sm font-medium leading-7 text-slate-200 sm:text-[15px] 2xl:text-base">
                  Keep your identity details sharp, protect access with a
                  stronger password flow, and manage the public-facing BPLO logo
                  from one polished control center.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-1">
              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-[#BEEBF1]">
                    <FiEdit3 className="text-lg" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#BEEBF1]">
                      Profile readiness
                    </p>
                    <p className="mt-1 text-xl font-black text-white">
                      {profileCompletionPercent}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-[#BEEBF1]">
                    <FiShield className="text-lg" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#BEEBF1]">
                      Security state
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {isCurrentPasswordVerified
                        ? "Password verified"
                        : "Protected"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-[#BEEBF1]">
                    <FiImage className="text-lg" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#BEEBF1]">
                      Branding control
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {canManageBranding ? "Logo access enabled" : "View only"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SuperAdminAccountSettingsProfileSection
          profile={profile}
          errors={errors}
          fullName={fullName}
          userRoleLabel={userRoleLabel}
          profileCompletionPercent={profileCompletionPercent}
          profilePictureUrl={profilePictureUrl}
          isEditing={isEditing}
          isSaving={isSaving}
          isUploadingProfilePicture={isUploadingProfilePicture}
          hasChanges={hasChanges}
          profilePictureInputRef={profilePictureInputRef}
          onStartEditing={handleStartEditing}
          onCancelEditing={handleCancelEditing}
          onSaveProfile={handleSaveProfile}
          onOpenProfilePreview={handleOpenProfilePreview}
          onOpenProfilePicturePicker={handleOpenProfilePicturePicker}
          onProfilePictureSelected={handleProfilePictureSelected}
          onFieldChange={setField}
        />

        <div
          className={`mt-8 grid gap-6 2xl:gap-8 ${
            canManageBranding
              ? "2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.88fr)]"
              : ""
          }`}
        >
          <SuperAdminAccountSettingsSecuritySection
            passwordForm={passwordForm}
            passwordErrors={passwordErrors}
            showPasswords={showPasswords}
            isNewPasswordFocused={isNewPasswordFocused}
            isCurrentPasswordVerified={isCurrentPasswordVerified}
            isVerifyingPassword={isVerifyingPassword}
            isChangingPassword={isChangingPassword}
            passwordsMatch={passwordsMatch}
            passwordStrength={passwordStrength}
            onPasswordFieldChange={setPasswordField}
            onTogglePasswordVisibility={togglePasswordVisibility}
            onVerifyCurrentPassword={handleVerifyCurrentPassword}
            onResetVerifiedPasswordState={resetVerifiedPasswordState}
            onChangePassword={handleChangePassword}
            onNewPasswordFocus={() => setIsNewPasswordFocused(true)}
            onNewPasswordBlur={() => setIsNewPasswordFocused(false)}
          />

          {canManageBranding && (
            <SuperAdminAccountSettingsBrandingSection
              brandingLogoUrl={brandingLogoUrl}
              isUploadingBrandingLogo={isUploadingBrandingLogo}
              brandingLogoInputRef={brandingLogoInputRef}
              onOpenBrandingLogoPicker={handleOpenBrandingLogoPicker}
              onBrandingLogoSelected={handleBrandingLogoSelected}
            />
          )}
        </div>
      </div>
    </div>
  );
}
