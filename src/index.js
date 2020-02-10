import "core-js";
import React from "react";
import { hydrate, render } from "react-dom";
import * as Sentry from "@sentry/browser";
import App from "./components/App";
import "./index.css";
import { unregister } from "./registerServiceWorker";


const dsn = process.env.NODE_ENV === "production" ? "https://e37a7f0a2c724f1f826161eda4da92d1@sentry.io/1762779" : "";

Sentry.init({
  dsn,
  release: "alluvial@" + process.env.REACT_APP_VERSION,
  beforeSend(event) {
    // Check if it is an exception, and if so, show the report dialog
    if (event.exception) {
      Sentry.showReportDialog({
        eventId: event.event_id,
        subtitle2: "If you'd like to help, tell us what happened below. Your network data stay on your computer."
      });
    }
    return event;
  }
});

const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  hydrate(<App/>, rootElement);
} else {
  render(<App/>, rootElement);
}

try {
  unregister();
} catch (e) {
  // this might fail on some browsers, don't throw exception
  console.warn(e);
}
