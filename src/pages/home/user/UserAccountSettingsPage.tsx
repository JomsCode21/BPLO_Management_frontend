import {
  changePasswordApi,
  updateProfileApi,
  verifyCurrentPasswordApi,
} from "@/api/auth/auth.api";
import {
  deleteRenderedFileUrl,
  getImageRenderUrl,
  uploadImageFileWithRandomFolder,
} from "@/api/file_uploader/file_uploader";
import savedAnimation from "@/assets/Saved.lottie?url";
import UserAccountSettingsHero from "@/components/owner/account_settings/UserAccountSettingsHero";
import UserAccountSettingsProfilePreviewModal from "@/components/owner/account_settings/UserAccountSettingsProfilePreviewModal";
import UserAccountSettingsProfileSection from "@/components/owner/account_settings/UserAccountSettingsProfileSection";
import UserAccountSettingsSecuritySection from "@/components/owner/account_settings/UserAccountSettingsSecuritySection";
import {
  buildInitialPasswordForm,
  buildInitialProfile,
  getPasswordStrength,
  isManagedUploaderImageUrl,
  normalizeProfile,
  validatePasswordForm,
  validateProfile,
  type PasswordErrors,
  type PasswordFormState,
  type PasswordVisibilityState,
  type ProfileErrors,
  type ProfileFormState,
} from "@/components/owner/account_settings/shared";
import StatusModal from "@/components/feedback/StatusModal";
import { useAuthStore } from "@/stores/auth/auth.store";
import { getErrorMessage } from "@/utils/error/error.util";
import { motion } from "framer-motion";
import { type ChangeEvent, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function UserAccountSettingsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const clearSession = useAuthStore((s) => s.clearSession);

  const [profile, setProfile] = useState<ProfileFormState>(() =>
    buildInitialProfile(user),
  );
  const [savedProfile, setSavedProfile] = useState<ProfileFormState>(() =>
    buildInitialProfile(user),
  );
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    user?.profilePictureUrl ?? "",
  );
  const [savedProfilePictureUrl, setSavedProfilePictureUrl] = useState(
    user?.profilePictureUrl ?? "",
  );
  const [draftProfilePictureUrl, setDraftProfilePictureUrl] = useState("");
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] =
    useState(false);
  const [isProfilePreviewOpen, setIsProfilePreviewOpen] = useState(false);
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
  const [successStatus, setSuccessStatus] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
  const profilePictureInputRef = useRef<HTMLInputElement | null>(null);

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

  const fullName = useMemo(() => {
    const parts = [profile.firstName, profile.lastName]
      .map((part) => part.trim())
      .filter(Boolean);

    return parts.length > 0 ? parts.join(" ") : "Business Owner";
  }, [profile.firstName, profile.lastName]);

  const initials = useMemo(() => {
    const nextInitials = fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    return nextInitials || "BO";
  }, [fullName]);

  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordForm.newPassword),
    [passwordForm.newPassword],
  );

  const passwordsMatch = Boolean(
    passwordForm.newPassword &&
      passwordForm.confirmNewPassword &&
      passwordForm.newPassword === passwordForm.confirmNewPassword,
  );

  const profileChecklist = useMemo(
    () => [
      {
        label: "Full name",
        complete:
          Boolean(normalizedCurrentProfile.firstName) &&
          Boolean(normalizedCurrentProfile.lastName),
      },
      {
        label: "Email address",
        complete: Boolean(normalizedCurrentProfile.email),
      },
      {
        label: "Contact number",
        complete: Boolean(normalizedCurrentProfile.contactNumber),
      },
      {
        label: "Profile photo",
        complete: Boolean(profilePictureUrl.trim()),
      },
    ],
    [normalizedCurrentProfile, profilePictureUrl],
  );

  const completedChecklistCount = profileChecklist.filter(
    (item) => item.complete,
  ).length;
  const readinessPercent = Math.round(
    (completedChecklistCount / profileChecklist.length) * 100,
  );
  const shouldShowProfileReadiness = readinessPercent < 100;

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

  const showSavedStatusModal = (title: string, message: string) => {
    setSuccessStatus({
      isOpen: true,
      title,
      message,
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
      // Cleanup unsaved uploaded draft image when user cancels edits.
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
        // Remove replaced uploader-managed photo after successful save.
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
        currentPassword: getErrorMessage(error, "Current password is incorrect."),
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

  const handleOpenProfilePicturePicker = () => {
    if (!isEditing || isUploadingProfilePicture) return;
    profilePictureInputRef.current?.click();
  };

  const handleOpenProfilePreview = () => {
    if (!profilePictureUrl) return;
    setIsProfilePreviewOpen(true);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#2E5C82_0%,#173753_26%,#0F2942_52%,#081522_100%)]">
      <UserAccountSettingsProfilePreviewModal
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

      <div className="relative overflow-hidden bg-transparent">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-12 top-12 h-40 w-40 rounded-full bg-[#1F4A6B]/70 blur-3xl" />
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#285C84]/55 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-[#163854]/70 blur-3xl" />
        </div>

        <div
          data-owner-tour="account-settings-shell"
          className="relative mx-auto max-w-6xl px-3 pb-24 pt-5 sm:px-4 sm:pt-6 lg:px-6"
        >
          <div className="flex justify-end">
            
          </div>

          <UserAccountSettingsHero
            fullName={fullName}
            email={profile.email}
            shouldShowProfileReadiness={shouldShowProfileReadiness}
            readinessPercent={readinessPercent}
            completedChecklistCount={completedChecklistCount}
            profileChecklist={profileChecklist}
          />
        </div>
      </div>

      <div className="-mt-16 pb-12">
        <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14, ease: "easeOut" }}
            className="space-y-6"
          >
            <UserAccountSettingsProfileSection
              profile={profile}
              errors={errors}
              fullName={fullName}
              initials={initials}
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

            <UserAccountSettingsSecuritySection
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
          </motion.div>
        </div>
      </div>
    </div>
  );
}
