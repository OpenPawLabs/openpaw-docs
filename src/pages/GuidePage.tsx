import { Alert, Spinner } from "@heroui/react";
import {
  GuideImageVariantsProvider,
  type GuideImageVariantsManifest,
} from "@openpawlabs/diy-guides-ui";
import { useEffect, useRef, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { GuideSidebarNav } from "../components/guide-nav/GuideSidebarNav";
import { GuidePager } from "../components/GuidePager";
import { getProject, getSubguide } from "../catalog/projects";
import { useRouterHashChangeBridge } from "../hooks/useRouterHashChangeBridge";
import {
  getCachedGuide,
  loadGuideModule,
} from "../lib/guides/guideRegistry";
import {
  getCachedVariants,
  loadVariantsManifest,
} from "../lib/guides/variants";
import {
  guideMdxComponents,
  setGuideProgressHandler,
} from "../lib/mdx/guideMdxComponents";
import type { GuideMdxComponent } from "../lib/mdx/guideComponents";

type LoadState =
  | { status: "loading" }
  | {
      status: "ready";
      Content: GuideMdxComponent;
      variants: GuideImageVariantsManifest | null;
    }
  | { status: "error"; message: string };

function initialLoadState(guidePath: string): LoadState {
  const Content = getCachedGuide(guidePath);
  if (!Content) {
    return { status: "loading" };
  }

  const variants = getCachedVariants(guidePath);
  return {
    status: "ready",
    Content,
    variants: variants === undefined ? null : variants,
  };
}

export function GuidePage() {
  const { projectId = "", guideSlug = "" } = useParams();
  const project = getProject(projectId);
  const subguide = project ? getSubguide(project, guideSlug) : undefined;

  if (!project || !subguide) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <Alert className="border border-danger-300 bg-danger-50">
          <Alert.Content>
            <Alert.Title>Guide not found</Alert.Title>
            <Alert.Description>
              <RouterLink className="text-primary underline" to="/">
                Return home
              </RouterLink>
            </Alert.Description>
          </Alert.Content>
        </Alert>
      </main>
    );
  }

  return (
    <GuidePageBody
      key={subguide.path}
      currentSlug={guideSlug}
      guidePath={subguide.path}
      project={project}
    />
  );
}

function GuidePageBody({
  project,
  currentSlug,
  guidePath,
}: {
  project: NonNullable<ReturnType<typeof getProject>>;
  currentSlug: string;
  guidePath: string;
}) {
  useRouterHashChangeBridge();
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>(() => initialLoadState(guidePath));

  useEffect(() => {
    if (state.status === "ready") {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const [Content, variants] = await Promise.all([
          loadGuideModule(guidePath),
          loadVariantsManifest(guidePath),
        ]);

        if (!cancelled) {
          setState({ status: "ready", Content, variants });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "The guide could not be loaded.",
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guidePath, state.status]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:py-8 sm:px-6 lg:py-0 lg:pt-10">
      <div className="lg:flex lg:gap-10">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div
            ref={sidebarScrollRef}
            className="sticky overflow-y-auto overscroll-y-contain subtle-scrollbar"
            style={{
              top: "calc(var(--site-header-height) + 15px)",
              maxHeight: "calc(100vh - var(--site-header-height) - 15px)",
            }}
          >
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-default-400">
              {project.title}
            </p>
            <GuideSidebarNav
              currentSlug={currentSlug}
              project={project}
              scrollContainerRef={sidebarScrollRef}
            />
          </div>
        </aside>

        <div className="min-w-0 lg:flex-1">
          {state.status === "loading" && (
            <div className="flex items-center gap-3 text-default-600">
              <Spinner />
              <span>Loading guide…</span>
            </div>
          )}

          {state.status === "error" && (
            <Alert className="border border-danger-300 bg-danger-50">
              <Alert.Content>
                <Alert.Title>Could not load guide</Alert.Title>
                <Alert.Description>{state.message}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          {state.status === "ready" && (
            <GuideReader Content={state.Content} variants={state.variants} />
          )}

          <GuidePager currentSlug={currentSlug} project={project} />
        </div>
      </div>
    </div>
  );
}

function GuideReader({
  Content,
  variants,
}: {
  Content: GuideMdxComponent;
  variants: GuideImageVariantsManifest | null;
}) {
  setGuideProgressHandler(null);
  return (
    <GuideImageVariantsProvider manifest={variants}>
      <Content components={guideMdxComponents} />
    </GuideImageVariantsProvider>
  );
}
