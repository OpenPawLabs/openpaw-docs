import { Alert, Spinner } from "@heroui/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { GuideSidebarNav } from "../components/guide-nav/GuideSidebarNav";
import { GuidePager } from "../components/GuidePager";
import { getProject, getSubguide } from "../catalog/projects";
import { useSaveGuideProgress } from "../hooks/useGuideProgress";
import { guideBaseUrl, guideMdxUrl } from "../lib/guides/metadata";
import { compileGuide, formatMdxError } from "../lib/mdx/compileGuide";
import { guideComponents, type GuideMdxComponent } from "../lib/mdx/guideComponents";
import { rewriteAssetUrls } from "../lib/mdx/rewriteAssetUrls";

type LoadState =
  | { status: "loading" }
  | { status: "ready"; Content: GuideMdxComponent }
  | { status: "error"; message: string };

export function GuidePage() {
  const { projectId = "", guideSlug = "" } = useParams();
  const project = getProject(projectId);
  const subguide = project ? getSubguide(project, guideSlug) : undefined;
  const saveProgress = useSaveGuideProgress(projectId, guideSlug);
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const handleProgressChange = useCallback(
    (progress: { completed: number; total: number }) => {
      saveProgress(progress);
    },
    [saveProgress],
  );

  const guidePath = subguide?.path;
  const mdxUrl = guidePath ? guideMdxUrl(guidePath) : null;

  useEffect(() => {
    if (!mdxUrl || !guidePath) {
      return;
    }

    let cancelled = false;

    void (async () => {
      setState({ status: "loading" });

      try {
        const response = await fetch(mdxUrl);
        if (!response.ok) {
          throw new Error(`Could not load guide (HTTP ${response.status}).`);
        }

        const source = await response.text();
        const base = guideBaseUrl(guidePath);
        const rewritten = rewriteAssetUrls(source, base);
        const Content = await compileGuide(rewritten, base);

        if (!cancelled) {
          setState({ status: "ready", Content });
        }
      } catch (error) {
        if (!cancelled) {
          setState({ status: "error", message: formatMdxError(error) });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [guidePath, mdxUrl]);

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
    <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:py-8 sm:px-6 lg:py-10">
      <div className="lg:flex lg:gap-10">
        <aside className="hidden lg:block lg:w-64 lg:shrink-0">
          <div className="sticky top-(--site-header-height)">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-default-400">
              {project.title}
            </p>
            <GuideSidebarNav currentSlug={guideSlug} project={project} />
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
            <GuideReader
              Content={state.Content}
              onProgressChange={handleProgressChange}
            />
          )}

          <GuidePager currentSlug={guideSlug} project={project} />
        </div>
      </div>
    </div>
  );
}

function GuideReader({
  Content,
  onProgressChange,
}: {
  Content: GuideMdxComponent;
  onProgressChange: (progress: { completed: number; total: number }) => void;
}) {
  const components = useMemo(
    () => ({
      ...guideComponents,
      GuideStepList: (props: ComponentProps<typeof guideComponents.GuideStepList>) => (
        <guideComponents.GuideStepList
          {...props}
          onProgressChange={(progress) => {
            onProgressChange(progress);
            props.onProgressChange?.(progress);
          }}
        />
      ),
    }),
    [onProgressChange],
  );

  return <Content components={components} />;
}
