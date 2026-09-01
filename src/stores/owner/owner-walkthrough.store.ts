import { create } from "zustand";

type OwnerWalkthroughStoreType = {
  startSignal: number;
  requestStart: () => void;
};

export const useOwnerWalkthroughStore = create<OwnerWalkthroughStoreType>(
  (set) => ({
    startSignal: 0,
    requestStart: () =>
      set((state) => ({
        startSignal: state.startSignal + 1,
      })),
  }),
);
