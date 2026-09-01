import type { AxiosError } from "axios";
import toast from "react-hot-toast";

export const getErrorMessage = (
  error: unknown,
  fallback = "An unexpected error occurred.",
) => {
  if (error && typeof error === "object") {
    const axiosError = error as AxiosError<{ message?: string }>;

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }

    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }

  return fallback;
};

export const showError = (error: unknown) => {
  console.error(error);
  toast.error(getErrorMessage(error));
};
