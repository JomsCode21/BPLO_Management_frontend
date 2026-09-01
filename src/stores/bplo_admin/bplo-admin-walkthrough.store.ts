import { create } from "zustand";

type BploAdminWalkthroughStoreType = {
  startSignal: number;
  requestStart: () => void;
};

export const useBploAdminWalkthroughStore =
  create<BploAdminWalkthroughStoreType>((set) => ({
    startSignal: 0,
    requestStart: () =>
      set((state) => ({
        startSignal: state.startSignal + 1,
      })),
  }));
