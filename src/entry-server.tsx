import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { preloadRouteData } from "./lib/guides/preloadRoute";
import { getPageMeta, renderPageHead } from "./lib/seo/pageMeta";

export async function render(url: string): Promise<{ html: string; head: string }> {
  const pathname = url.split("?")[0]?.split("#")[0] || "/";
  await preloadRouteData(pathname);

  const html = renderToString(
    <StaticRouter location={pathname}>
      <AppRoutes />
    </StaticRouter>,
  );

  return {
    html,
    head: renderPageHead(getPageMeta(pathname)),
  };
}
