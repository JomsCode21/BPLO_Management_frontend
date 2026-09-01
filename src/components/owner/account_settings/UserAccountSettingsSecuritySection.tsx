import CustomInput from "@/components/input/CustomInput";
import { AnimatePresence, motion } from "framer-motion";
import { FiEye, FiEyeOff, FiLock } from "react-icons/fi";

import type {
  PasswordErrors,
  PasswordFormState,
  PasswordStrength,
  PasswordVisibilityState,
} from "./shared";

type UserAccountSettingsSecuritySectionProps = {
  passwordForm: PasswordFormState;
  passwordErrors: PasswordErrors;
  showPasswords: PasswordVisibilityState;
  isNewPasswordFocused: boolean;
  isCurrentPasswordVerified: boolean;
  isVerifyingPassword: boolean;
  isChangingPassword: boolean;
  passwordsMatch: boolean;
  passwordStrength: PasswordStrength;
  onPasswordFieldChange: (key: keyof PasswordFormState, value: string) => void;
  onTogglePasswordVisibility: (key: keyof PasswordVisibilityState) => void;
  onVerifyCurrentPassword: () => void;
  onResetVerifiedPasswordState: () => void;
  onChangePassword: () => void;
  onNewPasswordFocus: () => void;
  onNewPasswordBlur: () => void;
};

const passwordInputClass =
  "h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] px-4 pl-11 pr-11 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-[#F2C94C]";

export default function UserAccountSettingsSecuritySection({
  passwordForm,
  passwordErrors,
  showPasswords,
  isNewPasswordFocused,
  isCurrentPasswordVerified,
  isVerifyingPassword,
  isChangingPassword,
  passwordsMatch,
  passwordStrength,
  onPasswordFieldChange,
  onTogglePasswordVisibility,
  onVerifyCurrentPassword,
  onResetVerifiedPasswordState,
  onChangePassword,
  onNewPasswordFocus,
  onNewPasswordBlur,
}: UserAccountSettingsSecuritySectionProps) {
  return (
    <section className="overflow-hidden rounded-4xl border border-white/10 bg-[linear-gradient(180deg,rgba(41,77,107,0.95)_0%,rgba(14,38,59,0.98)_100%)] shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-sm">
      <div className="border-b border-white/10 bg-white/5 px-5 py-5 sm:px-6">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#F2C94C]">
          Security
        </p>
        <h3 className="mt-2 text-2xl font-bold text-white">
          Password & Access
        </h3>
        <p className="mt-1 text-sm text-white/70">
          Verify your current password first, then choose a stronger password if
          needed.
        </p>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(27,58,84,0.96)_0%,rgba(17,43,66,0.98)_100%)] p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="flex-1">
              <CustomInput
                label="Current Password"
                type={showPasswords.currentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                readOnly={isCurrentPasswordVerified}
                onChange={(event) =>
                  onPasswordFieldChange("currentPassword", event.target.value)
                }
                prefix={<FiLock className="text-lg text-slate-400" />}
                suffix={
                  <button
                    type="button"
                    aria-label={
                      showPasswords.currentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    onClick={() => onTogglePasswordVisibility("currentPassword")}
                    className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    {showPasswords.currentPassword ? (
                      <FiEyeOff className="text-sm" />
                    ) : (
                      <FiEye className="text-sm" />
                    )}
                  </button>
                }
                labelClass="mb-2 block text-sm font-semibold text-white/72"
                inputClass={`${passwordInputClass} read-only:bg-white/5 read-only:text-white/80`}
                parentClass=""
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs text-rose-600">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:pt-7">
              {!isCurrentPasswordVerified ? (
                <button
                  type="button"
                  onClick={onVerifyCurrentPassword}
                  disabled={
                    isVerifyingPassword ||
                    isChangingPassword ||
                    !passwordForm.currentPassword.trim()
                  }
                  className="w-full rounded-2xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-3 text-sm font-semibold text-[#0F2942] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isVerifyingPassword ? "Verifying..." : "Verify Password"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onResetVerifiedPasswordState}
                  disabled={isChangingPassword}
                  className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {isCurrentPasswordVerified && (
            <p className="mt-3 text-sm font-medium text-emerald-300">
              Current password verified. You can now set a new password.
            </p>
          )}
        </div>

        {isCurrentPasswordVerified && (
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            <div>
              <CustomInput
                label="New Password"
                type={showPasswords.newPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onFocus={onNewPasswordFocus}
                onBlur={onNewPasswordBlur}
                onChange={(event) =>
                  onPasswordFieldChange("newPassword", event.target.value)
                }
                prefix={<FiLock className="text-lg text-slate-400" />}
                suffix={
                  <button
                    type="button"
                    aria-label={
                      showPasswords.newPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    onClick={() => onTogglePasswordVisibility("newPassword")}
                    className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    {showPasswords.newPassword ? (
                      <FiEyeOff className="text-sm" />
                    ) : (
                      <FiEye className="text-sm" />
                    )}
                  </button>
                }
                labelClass="mb-2 block text-sm font-semibold text-white/72"
                inputClass={passwordInputClass}
                parentClass=""
              />

              <AnimatePresence>
                {isNewPasswordFocused && passwordForm.newPassword && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 overflow-hidden px-1"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/45">
                        Strength
                      </span>
                      <span
                        className={`text-[11px] font-black uppercase tracking-[0.18em] ${passwordStrength.textColor}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="flex h-1.5 w-full gap-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-all duration-500 ${
                            level <= passwordStrength.score
                              ? passwordStrength.bgColor
                              : "bg-white/12"
                          }`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs text-rose-600">
                  {passwordErrors.newPassword}
                </p>
              )}
            </div>

            <div>
              <CustomInput
                label="Confirm New Password"
                type={showPasswords.confirmNewPassword ? "text" : "password"}
                value={passwordForm.confirmNewPassword}
                onChange={(event) =>
                  onPasswordFieldChange(
                    "confirmNewPassword",
                    event.target.value,
                  )
                }
                prefix={<FiLock className="text-lg text-slate-400" />}
                suffix={
                  <button
                    type="button"
                    aria-label={
                      showPasswords.confirmNewPassword
                        ? "Hide confirm new password"
                        : "Show confirm new password"
                    }
                    onClick={() =>
                      onTogglePasswordVisibility("confirmNewPassword")
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                  >
                    {showPasswords.confirmNewPassword ? (
                      <FiEyeOff className="text-sm" />
                    ) : (
                      <FiEye className="text-sm" />
                    )}
                  </button>
                }
                labelClass="mb-2 block text-sm font-semibold text-white/72"
                inputClass={passwordInputClass}
                parentClass=""
              />

              {passwordErrors.confirmNewPassword && (
                <p className="mt-1 text-xs text-rose-600">
                  {passwordErrors.confirmNewPassword}
                </p>
              )}
              {passwordForm.confirmNewPassword && !passwordsMatch && (
                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-rose-500">
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                  Passwords match
                </p>
              )}
            </div>
          </div>
        )}

        {isCurrentPasswordVerified && (
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onChangePassword}
              disabled={isChangingPassword || isVerifyingPassword}
              className="w-full rounded-2xl border border-[#F2C94C] bg-[#F2C94C] px-4 py-3 text-sm font-semibold text-[#0F2942] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isChangingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
