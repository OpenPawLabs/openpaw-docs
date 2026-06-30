import { GuideStep } from "@openpawlabs/diy-guides-ui";
import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";

import { useGuideReader } from "../../context/GuideReaderContext";
import { useSiteHeaderHeightPx } from "../../hooks/useSiteHeaderHeightPx";
import { guideComponents } from "./guideComponents";

const guideProgressRef: {
  current: ((progress: { completed: number; total: number }) => void) | null;
} = { current: null };

/** Bridges guide progress from stable MDX wrappers to the active page handler. */
export function setGuideProgressHandler(
  handler: ((progress: { completed: number; total: number }) => void) | null,
) {
  guideProgressRef.current = handler;
}

function countGuideSteps(children: ReactNode): number {
  let count = 0;

  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === GuideStep) {
      count += 1;
    }
  });

  return count;
}

const GuideLayoutWithSiteMargin = Object.assign(
  function GuideLayoutWithSiteMargin(
    props: ComponentProps<typeof guideComponents.GuideLayout>,
  ) {
    const siteHeaderHeightPx = useSiteHeaderHeightPx();

    return (
      <guideComponents.GuideLayout
        {...props}
        scrollMarginTop={siteHeaderHeightPx}
      />
    );
  },
  {
    Header: guideComponents.GuideLayout.Header,
    Intro: guideComponents.GuideLayout.Intro,
    Sidebar: guideComponents.GuideLayout.Sidebar,
    Content: guideComponents.GuideLayout.Content,
  },
);

function GuideStepListWithReader(
  props: ComponentProps<typeof guideComponents.GuideStepList>,
) {
  const { setActiveStep, setCompletedSteps, stepCompletion } = useGuideReader();
  const totalSteps = countGuideSteps(props.children);

  return (
    <guideComponents.GuideStepList
      {...props}
      activeStepMinVisibleRatio={0.2}
      completedSteps={stepCompletion}
      onActiveStepChange={setActiveStep}
      onCompletedStepsChange={(steps) => {
        setCompletedSteps(steps, totalSteps);
      }}
      showProgress={false}
      onProgressChange={(progress) => {
        guideProgressRef.current?.(progress);
        props.onProgressChange?.(progress);
      }}
    >
      {props.children}
    </guideComponents.GuideStepList>
  );
}

export const guideMdxComponents = {
  ...guideComponents,
  GuideLayout: GuideLayoutWithSiteMargin,
  GuideStepList: GuideStepListWithReader,
};
