import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getProgressSnapshot,
  notifyProgressChange,
  stepCompletionFromStorage,
  subscribeProgress,
  writeGuideStepCompletion,
} from "../lib/progress/storage";

export interface GuideReaderContextValue {
  activeStep: number | null;
  stepCompletion: Record<number, boolean>;
  setActiveStep: (step: number | null) => void;
  setCompletedSteps: (steps: Record<number, boolean>, total: number) => void;
}

const GuideReaderContext = createContext<GuideReaderContextValue | null>(null);

function readStoredStepCompletion(
  projectId: string,
  guideSlug: string,
): Record<number, boolean> {
  return stepCompletionFromStorage(getProgressSnapshot(projectId, guideSlug)?.steps);
}

export function GuideReaderProvider({
  projectId,
  guideSlug,
  children,
}: {
  projectId: string;
  guideSlug: string;
  children: ReactNode;
}) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [stepCompletion, setStepCompletion] = useState<Record<number, boolean>>(() =>
    readStoredStepCompletion(projectId, guideSlug),
  );
  const totalStepsRef = useRef(0);

  useEffect(() => {
    setActiveStep(null);

    const syncFromStorage = () => {
      const stored = getProgressSnapshot(projectId, guideSlug);
      setStepCompletion(stepCompletionFromStorage(stored?.steps));

      if (stored?.total) {
        totalStepsRef.current = stored.total;
      }
    };

    syncFromStorage();
    return subscribeProgress(syncFromStorage);
  }, [projectId, guideSlug]);

  const persistSteps = useCallback(
    (steps: Record<number, boolean>, total: number) => {
      totalStepsRef.current = total;

      if (writeGuideStepCompletion(projectId, guideSlug, steps, total)) {
        notifyProgressChange();
      }
    },
    [projectId, guideSlug],
  );

  const setCompletedSteps = useCallback(
    (steps: Record<number, boolean>, total: number) => {
      setStepCompletion(steps);
      persistSteps(steps, total);
    },
    [persistSteps],
  );

  const value = useMemo(
    () => ({
      activeStep,
      stepCompletion,
      setActiveStep,
      setCompletedSteps,
    }),
    [activeStep, stepCompletion, setCompletedSteps],
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
