// Libraries
import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";
// Types
import type { AuthStoreType } from "@/types/auth/auth.type";
import { useTokenStore } from "@/stores/token/token.store";
import { disconnectAllRealtimeSockets } from "@/socket/socket-client";
// Utils
import { showError } from "@/utils/error/error.util";
// API's
import {
  getCurrentUserApi,
  loginApi,
  logoutApi,
  registerApi,
} from "@/api/auth/auth.api";

export const useAuthStore = create<AuthStoreType>()(
  persist(
    (set) => ({
      loading: false,
      user: null,

      setRegister: async (data) => {
        set({
          loading: true,
        });
        try {
          const response = await registerApi(data);
          toast.success(response.message);
          // Note: During registration, user is not set yet until OTP is verified
          // So we don't set the user here anymore
          return response; // Return the full response object
        } catch (error) {
          showError(error);
          throw error;
        } finally {
          set({
            loading: false,
          });
        }
      },
      setLogin: async (data) => {
        set({ loading: true });
        try {
          const response = await loginApi(data);
          toast.success(response.message);
          if (response.user) {
            set({ user: response.user });
          } else {
            console.warn("No user data in login response");
          }
          return response.accessToken;
        } catch (error) {
          // Check if it's an unverified account error
          if (
            error &&
            typeof error === "object" &&
            "response" in error &&
            error.response &&
            typeof error.response === "object" &&
            "data" in error.response &&
            error.response.data &&
            typeof error.response.data === "object" &&
            "isVerified" in error.response.data &&
            error.response.data.isVerified === false
          ) {
            // Don't show error toast for unverified accounts
            // Re-throw so the component can handle redirect
            throw error;
          }
          showError(error);
          throw error;
        } finally {
          set({
            loading: false,
          });
        }
      },
      hydrateCurrentUser: async () => {
        try {
          const response = await getCurrentUserApi();
          const user = response?.user ?? null;
          set({ user });
          return user;
        } catch (error) {
          if (import.meta.env.DEV) {
            console.error("Failed to hydrate current user:", error);
          }
          set({ user: null });
          return null;
        }
      },
      clearSession: () => {
        disconnectAllRealtimeSockets();
        useTokenStore.getState().setClearToken();
        set({ user: null });
      },
      logout: async () => {
        set({ loading: true });
        try {
          const response = await logoutApi();
          toast.success(response.message);
          disconnectAllRealtimeSockets();
          useTokenStore.getState().setClearToken();
          set({ user: null });
          return true;
        } catch (error) {
          console.error(error);
          showError(error);
          return false;
        } finally {
          set({ loading: false });
        }
      },
      setUser: (user) => set({ user }),
    }),
    {
      name: "auth-store",
    },
  ),
);
