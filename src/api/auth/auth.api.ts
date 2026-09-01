import type { AccountType } from "@/types/account/account.type";
import type { RecaptchaProtectedPayload } from "@/types/recaptcha/recaptcha.type";
import axiosInstance from "../../axios/axios-instance";

type RegisterPayload = Partial<AccountType> & RecaptchaProtectedPayload;
type LoginPayload = Partial<AccountType> & RecaptchaProtectedPayload;

export const registerApi = async (data: RegisterPayload) => {
  const response = await axiosInstance.post("/auth/register", data);
  return response.data;
};

export const loginApi = async (data: LoginPayload) => {
  const response = await axiosInstance.post("/auth/login", data);
  return response.data;
};

export const loginWithGoogleApi = async (
  googleToken: string,
  recaptchaToken: string,
) => {
  const payload: { token: string; recaptchaToken: string } = {
    token: googleToken,
    recaptchaToken,
  };

  const response = await axiosInstance.post("/auth/google", payload);
  return response.data;
};

export const logoutApi = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const forgotPasswordApi = async (
  email: string,
  recaptchaToken: string,
) => {
  const response = await axiosInstance.post("/auth/forgot-password", {
    email,
    recaptchaToken,
  });
  return response.data;
};

export const verifyOtpApi = async (email: string, otp: string) => {
  const response = await axiosInstance.post("/auth/verify-otp", {
    email,
    otp,
  });
  return response.data;
};

export const resetPasswordApi = async (
  email: string,
  otp: string,
  newPassword: string,
) => {
  const response = await axiosInstance.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

export const verifyRegistrationOtpApi = async (
  email: string,
  otp: string,
) => {
  const response = await axiosInstance.post("/auth/verify-registration", {
    email,
    otp,
  });
  return response.data;
};

export const updateProfileApi = async (data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  contactNumber?: string;
  profilePictureUrl?: string;
}) => {
  const response = await axiosInstance.patch("/auth/me", data);
  return response.data;
};

export const getCurrentUserApi = async () => {
  const response = await axiosInstance.get("/auth/me");
  return response.data;
};

export const verifyCurrentPasswordApi = async (currentPassword: string) => {
  const response = await axiosInstance.post("/auth/verify-current-password", {
    currentPassword,
  });
  return response.data;
};

export const changePasswordApi = async (
  currentPassword: string,
  newPassword: string,
) => {
  const response = await axiosInstance.patch("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};
