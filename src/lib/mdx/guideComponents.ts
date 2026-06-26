import type { ComponentType } from "react";
import {
  Callout,
  DifficultyBadge,
  GuideLayout,
  GuideStep,
  GuideStepList,
  LinkButton,
  MediaFigure,
  MediaFigureThumbnail,
  ToolList,
} from "@openpawlabs/diy-guides-ui";

export type GuideMdxComponent = ComponentType<{
  components?: Record<string, unknown>;
}>;

export const guideComponents = {
  Callout,
  DifficultyBadge,
  GuideLayout,
  GuideStep,
  GuideStepList,
  LinkButton,
  MediaFigure,
  MediaFigureThumbnail,
  ToolList,
};
