import { create } from "zustand";

type InspectorWalkthroughStoreType = {
  startSignal: number;
  requestStart: () => void;
};

export const useInspectorWalkthroughStore =
  create<InspectorWalkthroughStoreType>((set) => ({
    startSignal: 0,
    requestStart: () =>
      set((state) => ({
        startSignal: state.startSignal + 1,
      })),
  }));
