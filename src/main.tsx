import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);

// Disable SW registration temporarily until the app is stable on mobile
if (
  "serviceWorker" in navigator &&
  window.location.protocol !== "file:" &&
  import.meta.env.PROD
) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register(
        new URL("./sw.js", window.location.href),
        { scope: "./" },
      );
    } catch {
      // Ignore service worker registration failures
    }
  });
}
