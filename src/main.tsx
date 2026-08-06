import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./App";
import { Analytics } from "./components/Analytics";
import { preloadRouteData } from "./lib/guides/preloadRoute";
import "./styles/index.css";

function getRootElement(): HTMLElement {
  const element = document.getElementById("root");
  if (!element) {
    throw new Error("Missing #root element.");
  }
  return element;
}

const app = (
  <StrictMode>
    <BrowserRouter>
      <Analytics />
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);

async function mount() {
  const rootElement = getRootElement();
  await preloadRouteData(window.location.pathname);

  if (rootElement.hasChildNodes()) {
    hydrateRoot(rootElement, app);
    return;
  }

  createRoot(rootElement).render(app);
}

void mount();
