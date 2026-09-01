import CustomInput from "@/components/input/CustomInput";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiLock,
  FiShield,
} from "react-icons/fi";

import type {
  PasswordErrors,
  PasswordFormState,
  PasswordStrength,
  PasswordVisibilityState,
} from "./shared";

type SuperAdminAccountSettingsSecuritySectionProps = {
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

export default function SuperAdminAccountSettingsSecuritySection({
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
}: SuperAdminAccountSettingsSecuritySectionProps) {
  const inputClass =
    "h-12 w-full rounded-2xl border border-[#0F2942]/10 bg-white px-4 pl-11 pr-11 text-[15px] font-medium text-[#10273F] outline-none transition-all duration-200 focus:border-[#0F2942]/35 focus:ring-4 focus:ring-[#66D2E2]/15 read-only:cursor-default read-only:border-emerald-200/70 read-only:bg-emerald-50/60";
  const labelClass =
    "mb-2 block text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]";

  return (
    <section className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_30px_85px_-58px_rgba(15,41,66,0.42)] backdrop-blur-sm sm:p-6 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(15,41,66,0.1),transparent_55%)]" />
      <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-[#66D2E2]/10 blur-3xl" />

      <div className="relative space-y-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#0F2942]/10 bg-[#F4F8FC] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0F2942]">
              <FiShield className="text-sm" />
              Security
            </div>
            <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#10273F] sm:text-[2rem]">
              Protect this account with a cleaner password flow
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500">
              Verify the current password first, then continue with the new
              password setup in the same card so the whole flow stays focused in
              one place.
            </p>
          </div>

          <div className="inline-flex items-center rounded-full border border-[#0F2942]/10 bg-[#F8FAFC] px-3 py-1 text-xs font-semibold text-[#0F2942] shadow-sm">
            {isCurrentPasswordVerified ? "Verified" : "Waiting for verification"}
          </div>
        </div>

        <div className="rounded-[28px] border border-[#0F2942]/8 bg-[#F8FAFC]/95 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
            <div className="flex-1">
              <CustomInput
                label="Current Password"
                type={showPasswords.currentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                readOnly={isCurrentPasswordVerified}
                onChange={(event) =>
                  onPasswordFieldChange("currentPassword", event.target.value)
                }
                prefix={<FiLock className="text-[#0F2942]/45" size={20} />}
                suffix={
                  <button
                    type="button"
                    aria-label={
                      showPasswords.currentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    onClick={() => onTogglePasswordVisibility("currentPassword")}
                    className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0F2942]"
                  >
                    {showPasswords.currentPassword ? (
                      <FiEyeOff className="text-sm" />
                    ) : (
                      <FiEye className="text-sm" />
                    )}
                  </button>
                }
                labelClass={labelClass}
                inputClass={`${inputClass} ${
                  passwordErrors.currentPassword
                    ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                    : ""
                }`}
                parentClass=""
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row xl:mt-7">
              {!isCurrentPasswordVerified ? (
                <button
                  type="button"
                  onClick={onVerifyCurrentPassword}
                  disabled={
                    isVerifyingPassword ||
                    isChangingPassword ||
                    !passwordForm.currentPassword.trim()
                  }
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#0F2942] bg-[#0F2942] px-5 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(15,41,66,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#143756] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isVerifyingPassword ? "Verifying..." : "Verify Password"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onResetVerifiedPasswordState}
                  disabled={isChangingPassword}
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {isCurrentPasswordVerified && (
            <div className="mt-4 flex items-start gap-3 rounded-[22px] border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-emerald-700">
              <FiCheckCircle className="mt-0.5 shrink-0 text-base" />
              <p className="text-sm font-semibold">
                Current password verified. You can now create a new password.
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-[#0F2942]/8 pt-6">
            {isCurrentPasswordVerified ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                      New password setup
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#10273F]">
                      Create your replacement password
                    </h3>
                  </div>
                  <p className="max-w-sm text-sm font-medium text-slate-500">
                    Choose a password that is different from your current one and
                    strong enough for long-term account security.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
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
                      prefix={<FiLock className="text-[#0F2942]/45" size={20} />}
                      suffix={
                        <button
                          type="button"
                          aria-label={
                            showPasswords.newPassword
                              ? "Hide new password"
                              : "Show new password"
                          }
                          onClick={() => onTogglePasswordVisibility("newPassword")}
                          className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0F2942]"
                        >
                          {showPasswords.newPassword ? (
                            <FiEyeOff className="text-sm" />
                          ) : (
                            <FiEye className="text-sm" />
                          )}
                        </button>
                      }
                      labelClass={labelClass}
                      inputClass={`${inputClass} ${
                        passwordErrors.newPassword
                          ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                          : ""
                      }`}
                      parentClass=""
                    />
                    <AnimatePresence>
                      {isNewPasswordFocused && passwordForm.newPassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 overflow-hidden rounded-[20px] border border-[#0F2942]/8 bg-white px-4 py-3"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#48617B] md:text-xs">
                              Strength
                            </span>
                            <span
                              className={`text-[10px] font-black uppercase tracking-[0.18em] transition-colors duration-300 md:text-xs ${passwordStrength.textColor}`}
                            >
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="flex h-2 w-full gap-1.5">
                            {[1, 2, 3, 4].map((level) => (
                              <div
                                key={level}
                                className={`h-full flex-1 rounded-full transition-all duration-500 ease-out ${
                                  level <= passwordStrength.score
                                    ? passwordStrength.bgColor
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {passwordErrors.newPassword && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {passwordErrors.newPassword}
                      </p>
                    )}
                  </div>

                  <div>
                    <CustomInput
                      label="Confirm New Password"
                      type={
                        showPasswords.confirmNewPassword ? "text" : "password"
                      }
                      value={passwordForm.confirmNewPassword}
                      onChange={(event) =>
                        onPasswordFieldChange(
                          "confirmNewPassword",
                          event.target.value,
                        )
                      }
                      prefix={<FiLock className="text-[#0F2942]/45" size={20} />}
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
                          className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#0F2942]"
                        >
                          {showPasswords.confirmNewPassword ? (
                            <FiEyeOff className="text-sm" />
                          ) : (
                            <FiEye className="text-sm" />
                          )}
                        </button>
                      }
                      labelClass={labelClass}
                      inputClass={`${inputClass} ${
                        passwordErrors.confirmNewPassword
                          ? "border-red-300 bg-red-50/70 focus:border-red-400 focus:ring-red-100"
                          : ""
                      }`}
                      parentClass=""
                    />
                    {passwordErrors.confirmNewPassword && (
                      <p className="mt-1.5 text-xs font-medium text-red-600">
                        {passwordErrors.confirmNewPassword}
                      </p>
                    )}
                    {passwordForm.confirmNewPassword && !passwordsMatch && (
                      <p className="ml-1 mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-red-500">
                        Passwords do not match
                      </p>
                    )}
                    {passwordsMatch && (
                      <p className="ml-1 mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-600">
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 rounded-[22px] border border-[#0F2942]/8 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-2xl text-sm font-medium text-slate-500">
                    For safety, password updates end the current session and send
                    you back to login after the change is complete.
                  </p>
                  <button
                    type="button"
                    onClick={onChangePassword}
                    disabled={isChangingPassword || isVerifyingPassword}
                    className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#0F2942] bg-[#0F2942] px-5 text-sm font-semibold text-white shadow-[0_18px_35px_-22px_rgba(15,41,66,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#143756] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isChangingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#48617B]">
                      What unlocks next
                    </p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#10273F]">
                      The rest of the password flow becomes available after verification
                    </h3>
                  </div>
                  <p className="max-w-sm text-sm font-medium text-slate-500">
                    Verify once, then complete the new password fields and save
                    the change securely.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    {
                      step: "1",
                      title: "Create a new password",
                      copy: "Enter a stronger replacement password once verification succeeds.",
                    },
                    {
                      step: "2",
                      title: "Confirm the match",
                      copy: "Re-enter the new password so mismatches are caught before saving.",
                    },
                    {
                      step: "3",
                      title: "Protect the session",
                      copy: "After the update, the account is redirected back to login for safety.",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="rounded-[22px] border border-[#0F2942]/8 bg-white p-4"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F2942] text-sm font-black text-white">
                        {item.step}
                      </div>
                      <p className="mt-4 text-sm font-black text-[#10273F]">
                        {item.title}
                      </p>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {item.copy}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="rounded-[22px] border border-dashed border-[#0F2942]/12 bg-white px-4 py-4">
                  <p className="text-sm font-medium text-slate-500">
                    Tip: use a password you have not used before and keep a mix
                    of uppercase letters, numbers, and symbols.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
