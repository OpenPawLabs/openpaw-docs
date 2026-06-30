export type GuideDifficulty = "easy" | "moderate" | "difficult";

export type SubguideStatus = "not-started" | "in-progress" | "complete";

export interface SubguideEntry {
  slug: string;
  /** Path within diy-guides repo, e.g. `bb-lsm6dsv/0-overview`. */
  path: string;
  /** Fallback title when metadata is unavailable. */
  title: string;
  description: string;
  /** Shared guides live under `common/` and may appear in multiple projects. */
  shared?: boolean;
  /** Optional subguide — readers can skip it. */
  optional?: boolean;
}

export interface ProjectEntry {
  id: string;
  title: string;
  description: string;
  /** Subguide path used for the project homepage hero (`heroImage` from its MDX header). */
  overviewPath: string;
  subguides: SubguideEntry[];
}

export interface GuideHeaderMetadata {
  title?: string;
  difficulty?: GuideDifficulty;
  timeEstimate?: string;
  meta?: string;
  heroImage?: string;
  heroImageAlt?: string;
}

export interface GuideStepMetadata {
  title?: string;
}

export interface GuideMetadata extends GuideHeaderMetadata {
  steps?: GuideStepMetadata[];
}

export type GuidesMetadataMap = Record<string, GuideMetadata>;

export interface GuideProgressRecord {
  completed: number;
  total: number;
}
