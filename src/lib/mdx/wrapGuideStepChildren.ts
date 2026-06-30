import { GuideStep } from "@openpawlabs/diy-guides-ui";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

type GuideStepElement = ReactElement<{
  onCompletedChange?: (completed: boolean) => void;
}>;

function isGuideStepElement(node: ReactNode): node is GuideStepElement {
  return isValidElement(node) && node.type === GuideStep;
}

/** Attach live completion callbacks to each GuideStep child. */
export function wrapGuideStepChildren(
  children: ReactNode,
  onStepCompleted: (step: number, completed: boolean) => void,
): ReactNode {
  let stepIndex = 0;

  return Children.map(children, (child) => {
    if (!isGuideStepElement(child)) {
      return child;
    }

    stepIndex += 1;
    const stepNum = stepIndex;

    return cloneElement(child, {
      onCompletedChange: (completed: boolean) => {
        onStepCompleted(stepNum, completed);
        child.props.onCompletedChange?.(completed);
      },
    });
  });
}
