import { Alert, Spinner } from "@heroui/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
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
  const mdxUrl = useMemo(
    () => (guidePath ? guideMdxUrl(guidePath) : null),
    [guidePath],
  );

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
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <p className="mb-6 text-sm text-default-500">
        <RouterLink className="text-primary hover:underline" to="/">
          Projects
        </RouterLink>{" "}
        /{" "}
        <RouterLink
          className="text-primary hover:underline"
          to={`/projects/${project.id}`}
        >
          {project.title}
        </RouterLink>{" "}
        / {subguide.title}
      </p>

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
        <GuideReader Content={state.Content} onProgressChange={handleProgressChange} />
      )}
    </main>
  );
}

function GuideReader({
  Content,
  onProgressChange,
}: {
  Content: GuideMdxComponent;
  onProgressChange: (progress: { completed: number; total: number }) => void;
}) {
  const onProgressChangeRef = useRef(onProgressChange);
  onProgressChangeRef.current = onProgressChange;

  const components = useMemo(
    () => ({
      ...guideComponents,
      GuideStepList: (props: ComponentProps<typeof guideComponents.GuideStepList>) => (
        <guideComponents.GuideStepList
          {...props}
          onProgressChange={(progress) => {
            onProgressChangeRef.current(progress);
            props.onProgressChange?.(progress);
          }}
        />
      ),
    }),
    [],
  );

  return <Content components={components} />;
}
