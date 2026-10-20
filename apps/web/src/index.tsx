import "./immer";
import "@mapequation/alluvial-diagram/style.css";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { Provider } from "./components/ui/provider";
import { Toaster } from "./components/ui/toaster";
import "./index.css";

const root = createRoot(document.getElementById("root")!);

// NOTE: Chakra UI v3's Dialog uses Ark UI's dismissable-layer, which writes
// `pointer-events: none` to <body> when a modal opens and restores it on
// close via `queueMicrotask`. React StrictMode's double-invocation in dev
// races with that microtask and leaves <body> stuck with pointer-events:
// none, blocking every click on the page. StrictMode is disabled here as a
// workaround. Re-enable if/when @zag-js/dismissable handles double-mount.
root.render(
  <Provider enableSystem defaultTheme="light">
    <App />
    <Toaster />
  </Provider>
);
