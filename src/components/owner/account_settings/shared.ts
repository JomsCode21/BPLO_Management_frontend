import type { UserType } from "@/types/auth/auth.type";

export type ProfileFormState = {
  firstName: string;
  middleName: string;
  lastName: string;
  contactNumber: string;
  email: string;
};

export type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export type PasswordVisibilityState = {
  currentPassword: boolean;
  newPassword: boolean;
  confirmNewPassword: boolean;
};

export type ProfileErrors = Partial<Record<keyof ProfileFormState, string>>;
export type PasswordErrors = Partial<Record<keyof PasswordFormState, string>>;

export type ProfileChecklistItem = {
  label: string;
  complete: boolean;
};

export type PasswordStrength = {
  score: number;
  label: string;
  bgColor: string;
  textColor: string;
};

const MANAGED_UPLOAD_RENDER_PATH = "/api/uploads/render?";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{10,13}$/;

export const buildInitialProfile = (
  user: UserType | null,
): ProfileFormState => ({
  firstName: user?.firstName ?? "",
  middleName: user?.middleName ?? "",
  lastName: user?.lastName ?? "",
  contactNumber: user?.contactNumber ?? "",
  email: user?.email ?? "",
});

export const buildInitialPasswordForm = (): PasswordFormState => ({
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
});

export const normalizeProfile = (
  profile: ProfileFormState,
): ProfileFormState => ({
  firstName: profile.firstName.trim(),
  middleName: profile.middleName.trim(),
  lastName: profile.lastName.trim(),
  contactNumber: profile.contactNumber.trim(),
  email: profile.email.trim().toLowerCase(),
});

export const validateProfile = (profile: ProfileFormState): ProfileErrors => {
  const errors: ProfileErrors = {};

  if (!profile.firstName.trim()) {
    errors.firstName = "First name is required.";
  }

  if (!profile.lastName.trim()) {
    errors.lastName = "Last name is required.";
  }

  const email = profile.email.trim();
  if (!email) {
    errors.email = "Email is required.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  const contactNumber = profile.contactNumber.trim();
  if (contactNumber && !phoneRegex.test(contactNumber)) {
    errors.contactNumber = "Use 10 to 13 digits (optional leading +).";
  }

  return errors;
};

export const validatePasswordForm = (
  passwordForm: PasswordFormState,
): PasswordErrors => {
  const errors: PasswordErrors = {};
  const currentPassword = passwordForm.currentPassword.trim();
  const newPassword = passwordForm.newPassword;
  const confirmNewPassword = passwordForm.confirmNewPassword;

  if (!currentPassword) {
    errors.currentPassword = "Current password is required.";
  }

  if (!newPassword) {
    errors.newPassword = "New password is required.";
  } else if (newPassword.length < 8) {
    errors.newPassword = "New password must be at least 8 characters.";
  } else if (currentPassword && currentPassword === newPassword) {
    errors.newPassword =
      "New password must be different from your current password.";
  }

  if (!confirmNewPassword) {
    errors.confirmNewPassword = "Please confirm your new password.";
  } else if (newPassword !== confirmNewPassword) {
    errors.confirmNewPassword = "New passwords do not match.";
  }

  return errors;
};

export const isManagedUploaderImageUrl = (imageUrl: string) =>
  imageUrl.includes(MANAGED_UPLOAD_RENDER_PATH);

export const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0;

  if (!password) {
    return {
      score: 0,
      label: "",
      bgColor: "bg-slate-200",
      textColor: "text-slate-400",
    };
  }

  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}<>|]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return {
        score: 1,
        label: "Weak",
        bgColor: "bg-rose-500",
        textColor: "text-rose-500",
      };
    case 2:
      return {
        score: 2,
        label: "Fair",
        bgColor: "bg-amber-500",
        textColor: "text-amber-500",
      };
    case 3:
      return {
        score: 3,
        label: "Good",
        bgColor: "bg-sky-500",
        textColor: "text-sky-500",
      };
    case 4:
      return {
        score: 4,
        label: "Strong",
        bgColor: "bg-emerald-500",
        textColor: "text-emerald-500",
      };
    default:
      return {
        score: 0,
        label: "",
        bgColor: "bg-slate-200",
        textColor: "text-slate-400",
      };
  }
};
