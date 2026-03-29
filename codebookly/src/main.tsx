import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CODEBOOKLY_ICON_SRC } from "./branding";
import "./index.css";
import App from "./App.tsx";

{
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/webp";
  link.href = CODEBOOKLY_ICON_SRC;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
