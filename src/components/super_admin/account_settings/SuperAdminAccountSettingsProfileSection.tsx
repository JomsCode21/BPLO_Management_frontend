import CustomInput from "@/components/input/CustomInput";
import type { ChangeEventHandler, RefObject } from "react";
import {
  FiCamera,
  FiCheckCircle,
  FiLoader,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";

import type { ProfileErrors, ProfileFormState } from "./shared";

type SuperAdminAccountSettingsProfileSectionProps = {
  profile: ProfileFormState;
  errors: ProfileErrors;
  fullName: string;
  userRoleLabel: string;
  profileCompletionPercent: number;
  profilePictureUrl: string;
  isEditing: boolean;
  isSaving: boolean;
  isUploadingProfilePicture: boolean;
  hasChanges: boolean;
  profilePictureInputRef: RefObject<HTMLInputElement | null>;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveProfile: () => void;
  onOpenProfilePreview: () => void;
  onOpenProfilePicturePicker: () => void;
  onProfilePictureSelected: ChangeEventHandler<HTMLInputElement>;
  onFieldChange: (key: keyof ProfileFormState, value: string) => void;
};

export default function SuperAdminAccountSettingsProfileSection({
  profile,
  errors,
  fullName,
  userRoleLabel,
  profileCompletionPercent,
  profilePictureUrl,
  isEditing,
  isSaving,
  isUploadingProfilePicture,
  hasChanges,
  profilePictureInputRef,
  onStartEditing,
  onCancelEditing,
  onSaveProfile,
  onOpenProfilePreview,
  onOpenProfilePicturePicker,
  onProfilePictureSelected,
  onFieldChange,
}: SuperAdminAccountSettingsProfileSectionProps) {
  const isSaveDisabled =
    isSaving || isUploadingProfilePicture || !hasChanges;
  const completionTone =
    profileCompletionPercent >= 100
      ? "Ready to go"
      : profileCompletionPercent >= 80
        ? "Almost complete"
        : "Needs attention";
  const baseInputClass =
    "h-12 w-full rounded-2xl border bg-white px-4 pl-11 text-[15px] font-medium text-[#10273F] outline-none transition-all duration-200 focus:border-[#0F2942]/35 focus:ring-4 focus:ring-[#66D2E2]/15 read-only:cursor-default read-only:border-slate-200 read-only:bg-slate-100/85 read-only:text-[#10273F]/80";
  const labelClass =
    "mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]";

  return (
    <section className="relative mt-8 overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_85px_-58px_rgba(15,41,66,0.42)] backdrop-blur-sm sm:p-6 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(102,210,226,0.18),transparent_58%)]" />
      <div className="absolute -right-14 top-12 h-40 w-40 rounded-full bg-[#0F2942]/[0.03]" />

      <div className="relative space-y-6 sm:space-y-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center rounded-full bg-[#0F2942] px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                Account Profile
              </span>
              <span className="inline-flex items-center rounded-full border border-[#0F2942]/10 bg-[#F4F8FC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0F2942]">
                {userRoleLabel}
              </span>
              {hasChanges && (
                <span className="inline-flex items-center rounded-full border border-[#D6A83D]/30 bg-[#FFF5DD] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#9E6B09]">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <h2 className="text-2xl font-black leading-tight tracking-[-0.04em] text-[#10273F] sm:text-3xl">
                Personal details and public identity
              </h2>
              <p className="max-w-2xl text-sm font-medium leading-7 text-slate-500">
                Keep your admin profile polished so the account is ready for
                updates, approvals, and system-wide visibility.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap xl:w-auto xl:justify-end xl:pt-1">
            {!isEditing ? (
              <button
                type="button"
                onClick={onStartEditing}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#0F2942]/15 bg-white px-4 text-sm font-semibold text-[#0F2942] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0F2942]/25 hover:bg-[#F4F8FC] sm:w-auto"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onCancelEditing}
                  disabled={isSaving || isUploadingProfilePicture}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveProfile}
                  disabled={isSaveDisabled}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#0F2942] bg-[#0F2942] px-4 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(15,41,66,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#143756] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isUploadingProfilePicture
                    ? "Uploading..."
                    : isSaving
                      ? "Saving..."
                      : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-5 2xl:items-start 2xl:grid-cols-[minmax(0,1.35fr)_minmax(290px,0.82fr)]">
          <div className="space-y-6 sm:space-y-5">
            <div className="overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#0F2942_0%,#143756_48%,#1A5375_100%)] p-5 pb-6 text-white shadow-[0_30px_60px_-42px_rgba(15,41,66,0.9)] sm:p-6">
              <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-center md:text-left">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#66D2E2]/35 blur-xl" />
                  <button
                    type="button"
                    onClick={onOpenProfilePreview}
                    disabled={!profilePictureUrl}
                    aria-label={
                      profilePictureUrl
                        ? "Open profile picture preview"
                        : "No profile picture available"
                    }
                    className={`relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-[#66D2E2]/25 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.45)] sm:h-28 sm:w-28 ${
                      profilePictureUrl
                        ? "cursor-zoom-in transition-transform duration-200 hover:scale-[1.02]"
                        : "cursor-default"
                    }`}
                  >
                    {profilePictureUrl ? (
                      <img
                        src={profilePictureUrl}
                        alt={`${fullName} profile`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUser className="text-[60px] text-white" />
                    )}
                  </button>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenProfilePicturePicker();
                      }}
                      disabled={isUploadingProfilePicture}
                      aria-label="Upload profile picture"
                      className="absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white text-[#0F2942] shadow-lg transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUploadingProfilePicture ? (
                        <FiLoader className="animate-spin text-base" />
                      ) : (
                        <FiCamera className="text-base" />
                      )}
                    </button>
                  )}
                  <input
                    ref={profilePictureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onProfilePictureSelected}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#BEEBF1]">
                    Visible account identity
                  </p>
                  <h3 className="mt-2 break-words text-3xl font-black leading-tight tracking-[-0.05em] text-white sm:text-[2.25rem]">
                    {fullName}
                  </h3>
                  <p className="mt-2 break-words text-sm font-medium text-slate-200">
                    {profile.email ||
                      "Add an email address to complete the profile"}
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2 md:justify-start">
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                      {userRoleLabel}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                      {profile.contactNumber || "Add contact number"}
                    </span>
                    {profileCompletionPercent >= 100 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100">
                        <FiCheckCircle className="text-sm" />
                        Profile complete
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 rounded-[28px] border border-[#0F2942]/8 bg-[#F8FAFC]/95 p-5 sm:p-6">
              <div className="mb-5 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                    Editable fields
                  </p>
                  <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#10273F]">
                    Update the details tied to this admin account
                  </h3>
                </div>
                <p className="max-w-md text-sm font-medium text-slate-500">
                  Changes here update the identity shown across the super admin
                  workspace and related account areas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                <div>
                  <CustomInput
                    label="First Name"
                    type="text"
                    readOnly={!isEditing}
                    value={profile.firstName}
                    onChange={(event) =>
                      onFieldChange("firstName", event.target.value)
                    }
                    prefix={<FiUser className="text-lg text-[#0F2942]/45" />}
                    labelClass={labelClass}
                    inputClass={`${baseInputClass} ${
                      errors.firstName
                        ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                        : "border-[#0F2942]/10"
                    }`}
                    parentClass=""
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <CustomInput
                    label="Last Name"
                    type="text"
                    readOnly={!isEditing}
                    value={profile.lastName}
                    onChange={(event) =>
                      onFieldChange("lastName", event.target.value)
                    }
                    prefix={<FiUser className="text-lg text-[#0F2942]/45" />}
                    labelClass={labelClass}
                    inputClass={`${baseInputClass} ${
                      errors.lastName
                        ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                        : "border-[#0F2942]/10"
                    }`}
                    parentClass=""
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <CustomInput
                    label="Middle Name"
                    type="text"
                    readOnly={!isEditing}
                    value={profile.middleName}
                    onChange={(event) =>
                      onFieldChange("middleName", event.target.value)
                    }
                    prefix={<FiUser className="text-lg text-[#0F2942]/45" />}
                    labelClass={labelClass}
                    inputClass={`${baseInputClass} border-[#0F2942]/10`}
                    parentClass=""
                  />
                </div>

                <div>
                  <CustomInput
                    label="Contact Number"
                    type="tel"
                    readOnly={!isEditing}
                    value={profile.contactNumber}
                    onChange={(event) =>
                      onFieldChange("contactNumber", event.target.value)
                    }
                    prefix={<FiPhone className="text-lg text-[#0F2942]/45" />}
                    labelClass={labelClass}
                    inputClass={`${baseInputClass} ${
                      errors.contactNumber
                        ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                        : "border-[#0F2942]/10"
                    }`}
                    parentClass=""
                  />
                  {errors.contactNumber && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.contactNumber}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <CustomInput
                    label="Email"
                    type="email"
                    readOnly={!isEditing}
                    value={profile.email}
                    onChange={(event) => onFieldChange("email", event.target.value)}
                    prefix={<FiMail className="text-lg text-[#0F2942]/45" />}
                    labelClass={labelClass}
                    inputClass={`${baseInputClass} ${
                      errors.email
                        ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                        : "border-[#0F2942]/10"
                    }`}
                    parentClass=""
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-dashed border-[#0F2942]/12 bg-white/70 px-4 py-3">
              <p className="text-sm font-medium text-slate-500">
                {isEditing
                  ? hasChanges
                    ? "Your edits are ready. Save changes when you're satisfied with the profile details."
                    : "Editing mode is open. Update any field or image to create a new draft."
                  : "Switch to edit mode whenever you need to refresh this admin profile."}
              </p>
            </div>
          </div>

          <div className="grid self-start gap-4 sm:gap-5">
            <div className="rounded-[26px] border border-[#0F2942]/10 bg-[#F7FAFC] p-5 sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                Completion
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-3xl font-black tracking-[-0.05em] text-[#10273F]">
                    {profileCompletionPercent}%
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {completionTone}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-2 text-left shadow-sm sm:text-right">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#48617B]">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#0F2942]">
                    {isEditing ? "Editing mode" : "Viewing mode"}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#DCE9EF]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#66D2E2_0%,#0F2942_100%)] transition-all duration-300"
                  style={{ width: `${profileCompletionPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-[26px] border border-[#0F2942]/10 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                Quick notes
              </p>
              <div className="mt-4 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3">
                  <FiMail className="mt-0.5 text-base text-[#0F2942]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#48617B]">
                      Email
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-[#10273F]">
                      {profile.email || "Set your primary account email"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl bg-[#F7FAFC] px-4 py-3">
                  <FiPhone className="mt-0.5 text-base text-[#0F2942]" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#48617B]">
                      Contact
                    </p>
                    <p className="mt-1 break-words text-sm font-semibold text-[#10273F]">
                      {profile.contactNumber ||
                        "Add a phone number for faster coordination"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
