import { create } from "zustand";

type SuperAdminWalkthroughStoreType = {
  startSignal: number;
  requestStart: () => void;
};

export const useSuperAdminWalkthroughStore =
  create<SuperAdminWalkthroughStoreType>((set) => ({
    startSignal: 0,
    requestStart: () =>
      set((state) => ({
        startSignal: state.startSignal + 1,
      })),
  }));
