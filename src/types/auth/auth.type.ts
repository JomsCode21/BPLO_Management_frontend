import type { AccountType } from "../account/account.type";
import type { RecaptchaProtectedPayload } from "../recaptcha/recaptcha.type";

export type UserType = {
  _id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  gender?: string;
  contactNumber?: string;
  profilePictureUrl?: string;
  email: string;
  role?: string;
  departmentId?: string;
  departmentName?: string;
  treasurerType?: "department_treasurer" | "main_treasurer" | "";
};

export type AuthStoreType = {
  loading: boolean;
  user: UserType | null;

  setRegister: (
    data: Partial<AccountType> & RecaptchaProtectedPayload,
  ) => Promise<boolean | { success: boolean; message: string; email?: string }>;
  setLogin: (
    data: Partial<AccountType> & RecaptchaProtectedPayload,
  ) => Promise<boolean | string>;
  hydrateCurrentUser: () => Promise<UserType | null>;
  clearSession: () => void;
  logout: () => Promise<boolean>;
  setUser: (user: UserType | null) => void;
};


