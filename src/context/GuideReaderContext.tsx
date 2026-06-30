import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface GuideReaderContextValue {
  activeStep: number | null;
  stepCompletion: Record<number, boolean>;
  setActiveStep: (step: number | null) => void;
  setStepCompleted: (step: number, completed: boolean) => void;
}

const GuideReaderContext = createContext<GuideReaderContextValue | null>(null);

export function GuideReaderProvider({ children }: { children: ReactNode }) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [stepCompletion, setStepCompletion] = useState<Record<number, boolean>>({});

  const setStepCompleted = useCallback((step: number, completed: boolean) => {
    setStepCompletion((prev) => ({ ...prev, [step]: completed }));
  }, []);

  const value = useMemo(
    () => ({
      activeStep,
      stepCompletion,
      setActiveStep,
      setStepCompleted,
    }),
    [activeStep, stepCompletion, setStepCompleted],
  );

  return (
    <GuideReaderContext.Provider value={value}>{children}</GuideReaderContext.Provider>
  );
}

export function useGuideReader(): GuideReaderContextValue {
  const context = useContext(GuideReaderContext);
  if (!context) {
    throw new Error("useGuideReader must be used within GuideReaderProvider");
  }

  return context;
}

/** Optional hook for components outside the provider (e.g. tests). */
export function useGuideReaderOptional(): GuideReaderContextValue | null {
  return useContext(GuideReaderContext);
}
