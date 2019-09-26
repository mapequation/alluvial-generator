import React from "react";
import { hydrate, render } from "react-dom";
import * as Sentry from '@sentry/browser';
import App from "./components/App";
import "./index.css";
import { unregister } from "./registerServiceWorker";

Sentry.init({dsn: "https://e37a7f0a2c724f1f826161eda4da92d1@sentry.io/1762779"});

const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  hydrate(<App/>, rootElement);
} else {
  render(<App/>, rootElement);
}

unregister();
