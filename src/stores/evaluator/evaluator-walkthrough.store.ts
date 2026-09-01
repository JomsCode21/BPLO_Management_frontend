import { create } from "zustand";

type EvaluatorWalkthroughStoreType = {
  startSignal: number;
  requestStart: () => void;
};

export const useEvaluatorWalkthroughStore =
  create<EvaluatorWalkthroughStoreType>((set) => ({
    startSignal: 0,
    requestStart: () =>
      set((state) => ({
        startSignal: state.startSignal + 1,
      })),
  }));
