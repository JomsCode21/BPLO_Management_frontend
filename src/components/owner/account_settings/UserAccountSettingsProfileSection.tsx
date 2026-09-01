import CustomInput from "@/components/input/CustomInput";
import type { ChangeEventHandler, RefObject } from "react";
import { FiCamera, FiLoader, FiMail, FiPhone, FiUser } from "react-icons/fi";

import type { ProfileErrors, ProfileFormState } from "./shared";

type UserAccountSettingsProfileSectionProps = {
  profile: ProfileFormState;
  errors: ProfileErrors;
  fullName: string;
  initials: string;
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

const labelClass = "mb-2 block text-sm font-semibold text-white/72";
const inputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 pl-11 text-sm text-white outline-none transition-colors placeholder:text-white/30 read-only:bg-white/5 read-only:text-white/85 focus:border-[#F2C94C]";

export default function UserAccountSettingsProfileSection({
  profile,
  errors,
  fullName,
  initials,
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
}: UserAccountSettingsProfileSectionProps) {
  const isSaveDisabled =
    isSaving || isUploadingProfilePicture || !hasChanges;

  return (
    <section className="overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(41,77,107,0.95)_0%,rgba(14,38,59,0.98)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 border-b border-white/10 bg-white/5 px-5 py-5 sm:px-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#F2C94C]">
            Personal Details
          </p>
          <h3 className="mt-2 text-2xl font-bold text-white">
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-white/70">
            Keep your owner profile accurate and easy to review in one focused
            workspace.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          {!isEditing ? (
            <button
              type="button"
              onClick={onStartEditing}
              className="w-full rounded-2xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-3 text-sm font-semibold text-[#0F2942] shadow-sm transition-colors hover:bg-[#ffd55c] sm:w-auto"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onCancelEditing}
                disabled={isSaving || isUploadingProfilePicture}
                className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSaveProfile}
                disabled={isSaveDisabled}
                className="w-full rounded-2xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-3 text-sm font-semibold text-[#0F2942] shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="mb-6 rounded-[1.8rem] border border-white/10 bg-[linear-gradient(135deg,rgba(27,58,84,0.96)_0%,rgba(17,43,66,0.98)_100%)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)] sm:p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            <div className="relative mx-auto md:mx-0">
              <button
                type="button"
                onClick={onOpenProfilePreview}
                disabled={!profilePictureUrl}
                aria-label={
                  profilePictureUrl
                    ? "Open profile picture preview"
                    : "No profile picture available"
                }
                className={`flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#264764] shadow-sm ${
                  profilePictureUrl
                    ? "cursor-zoom-in transition-transform hover:scale-[1.02]"
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
                  <span className="text-3xl font-black tracking-wider text-white">
                    {initials}
                  </span>
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
                  className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#F2C94C] bg-[#F2C94C] text-[#0F2942] shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingProfilePicture ? (
                    <FiLoader className="animate-spin text-base" />
                  ) : (
                    <FiCamera className="text-base" />
                  )}
                </button>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#F2C94C]">
                Profile Photo
              </p>
              <h4 className="mt-2 text-xl font-bold text-white">{fullName}</h4>
              <p className="mt-1 break-all text-sm text-white/72">
                {profile.email || "No email set yet"}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/68">
                Keep your picture and contact details together here for faster
                account updates and easier profile review.
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="rounded-full bg-[#F2C94C] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0F2942]">
                  Business Owner
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                  {profile.contactNumber.trim()
                    ? "Contact Added"
                    : "Contact Optional"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                  {profilePictureUrl.trim() ? "Photo Ready" : "Photo Optional"}
                </span>
              </div>

              <div className="mt-4">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={onOpenProfilePicturePicker}
                    disabled={isUploadingProfilePicture}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-3 text-sm font-semibold text-[#0F2942] transition-colors hover:bg-[#ffd55c] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isUploadingProfilePicture ? (
                      <FiLoader className="animate-spin text-base" />
                    ) : (
                      <FiCamera className="text-base" />
                    )}
                    <span>
                      {profilePictureUrl.trim() ? "Change Photo" : "Upload Photo"}
                    </span>
                  </button>
                ) : (
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/50">
                    Tap Edit Profile to update your picture here.
                  </p>
                )}
              </div>
            </div>
          </div>

          <input
            ref={profilePictureInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onProfilePictureSelected}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <div>
            <CustomInput
              label="First Name"
              type="text"
              readOnly={!isEditing}
              value={profile.firstName}
              onChange={(event) => onFieldChange("firstName", event.target.value)}
              prefix={<FiUser className="text-lg text-slate-400" />}
              labelClass={labelClass}
              inputClass={inputClass}
              parentClass=""
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-rose-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <CustomInput
              label="Last Name"
              type="text"
              readOnly={!isEditing}
              value={profile.lastName}
              onChange={(event) => onFieldChange("lastName", event.target.value)}
              prefix={<FiUser className="text-lg text-slate-400" />}
              labelClass={labelClass}
              inputClass={inputClass}
              parentClass=""
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-rose-600">{errors.lastName}</p>
            )}
          </div>

          <div>
            <CustomInput
              label="Middle Name"
              type="text"
              readOnly={!isEditing}
              value={profile.middleName}
              onChange={(event) => onFieldChange("middleName", event.target.value)}
              prefix={<FiUser className="text-lg text-slate-400" />}
              labelClass={labelClass}
              inputClass={inputClass}
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
              prefix={<FiPhone className="text-lg text-slate-400" />}
              labelClass={labelClass}
              inputClass={inputClass}
              parentClass=""
            />
            {errors.contactNumber && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.contactNumber}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <CustomInput
              label="Email Address"
              type="email"
              readOnly={!isEditing}
              value={profile.email}
              onChange={(event) => onFieldChange("email", event.target.value)}
              prefix={<FiMail className="text-lg text-slate-400" />}
              labelClass={labelClass}
              inputClass={inputClass}
              parentClass=""
            />
            {errors.email && (
              <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/72">
          {isEditing
            ? hasChanges
              ? "You have unsaved changes. Save when you're ready."
              : "No pending changes yet. Update any field to enable a new save."
            : "Tap Edit Profile to update your account details."}
        </div>
      </div>
    </section>
  );
}
