import {
  createOfficerApi,
  deleteOfficerApi,
  getAllOfficersApi,
} from "@/api/super_admin/super_admin.api";
import type { OfficerStoreType } from "@/types/officer/officer.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOfficerStore = create<OfficerStoreType>()(
  persist(
    (set) => ({
      officers: [],
      loading: false,
      error: null,

      fetchOfficers: async () => {
        set({ loading: true, error: null });
        try {
          const response = await getAllOfficersApi();
          set({ officers: response.data || [], loading: false });
        } catch (err) {
          console.error("Failed to fetch officers:", err);
          set({
            error: "Failed to load officers from the server.",
            loading: false,
          });
        }
      },

      createOfficer: async (data) => {
        set({ loading: true, error: null });
        try {
          await createOfficerApi(data);
          // Refresh officers list after creating
          const response = await getAllOfficersApi();
          set({ officers: response.data || [], loading: false });
          return true;
        } catch (err) {
          console.error("Failed to create officer:", err);

          // Extract error message safely
          let errorMessage =
            "An error occurred while creating the officer. Please try again.";
          if (err && typeof err === "object" && "response" in err) {
            const response = (
              err as {
                response?: { data?: { message?: string } };
              }
            ).response;
            if (response?.data?.message) {
              errorMessage = response.data.message;
            }
          }

          set({ error: errorMessage, loading: false });
          return false;
        }
      },

      deleteOfficer: async (officerId) => {
        set({ error: null });
        try {
          await deleteOfficerApi(officerId);
          set((state) => ({
            officers: state.officers.filter((officer) => officer._id !== officerId),
          }));
          return true;
        } catch (err) {
          console.error("Failed to delete officer:", err);

          let errorMessage =
            "An error occurred while deleting the officer. Please try again.";
          if (err && typeof err === "object" && "response" in err) {
            const response = (
              err as {
                response?: { data?: { message?: string } };
              }
            ).response;
            if (response?.data?.message) {
              errorMessage = response.data.message;
            }
          }

          set({ error: errorMessage });
          return false;
        }
      },

      setOfficers: (officers) => set({ officers }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "officer-store",
    },
  ),
);
