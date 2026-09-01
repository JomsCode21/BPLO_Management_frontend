// Libraries
import { create } from "zustand";
import { persist } from "zustand/middleware";
// Types
import type { TokenStoreType } from "@/types/token/token.type";
// Api's
import { refreshTokenApi } from "@/api/token/token.api";

const TOKEN_STORAGE_KEY = "bplo_token_store";

export const useTokenStore = create<TokenStoreType>()(
  persist(
    (set, get) => ({
      accessToken: null,
      initialized: false,
      _refreshPromise: null,
      loading: false,

      init: async () => {
        const { initialized, accessToken } = get();
        
        // If already checked, just return the result
        if (initialized) return accessToken !== null;

        const existing = get()._refreshPromise;
        if (existing) return existing;

        const p = (async () => {
          set({ loading: true });
          try {
            const res = await refreshTokenApi();
            const token = res?.accessToken ?? null;

            // CRITICAL: Set the token AND initialized at the same time AFTER the API call
            set({ accessToken: token, initialized: true });
            return token !== null;
          } catch (err) {
            console.error(err);
            set({ accessToken: null, initialized: true }); // Still initialized even if it failed
            return false;
          } finally {
            set({ loading: false, _refreshPromise: null });
          }
        })();

        set({ _refreshPromise: p });
        return p;
      },
      setToken: (token) => set({ accessToken: token }),
      setClearToken: () => {
        set({ accessToken: null, initialized: false, _refreshPromise: null });
      },
    }),
    {
      name: TOKEN_STORAGE_KEY,
    },
  ),
);
