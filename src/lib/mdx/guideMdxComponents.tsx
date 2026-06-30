import { type ComponentProps } from "react";

import { useGuideReader } from "../../context/GuideReaderContext";
import { useSiteHeaderHeightPx } from "../../hooks/useSiteHeaderHeightPx";
import { guideComponents } from "./guideComponents";
import { wrapGuideStepChildren } from "./wrapGuideStepChildren";

const guideProgressRef: {
  current: ((progress: { completed: number; total: number }) => void) | null;
} = { current: null };

/** Bridges guide progress from stable MDX wrappers to the active page handler. */
export function setGuideProgressHandler(
  handler: ((progress: { completed: number; total: number }) => void) | null,
) {
  guideProgressRef.current = handler;
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
  const { setActiveStep, setStepCompleted } = useGuideReader();

  return (
    <guideComponents.GuideStepList
      {...props}
      onActiveStepChange={setActiveStep}
      showProgress={false}
      onProgressChange={(progress) => {
        guideProgressRef.current?.(progress);
        props.onProgressChange?.(progress);
      }}
    >
      {wrapGuideStepChildren(props.children, setStepCompleted)}
    </guideComponents.GuideStepList>
  );
}

export const guideMdxComponents = {
  ...guideComponents,
  GuideLayout: GuideLayoutWithSiteMargin,
  GuideStepList: GuideStepListWithReader,
};
