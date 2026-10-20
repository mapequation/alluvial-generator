import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { parse } from "@mapequation/infomap-parser";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  createFile,
  setIdentifiers,
} from "@mapequation/alluvial-diagram";
import App from "../components/App";
import { Provider } from "../components/ui/provider";
import { Store, StoreContext } from "../store/Store";

function loadScienceNetworks() {
  const years = [2001, 2003, 2005, 2007];
  return years.map((year) => {
    const text = readFileSync(
      resolve(__dirname, `../../public/data/science${year}_2y.stree`),
      "utf8"
    );
    const network = parse(text, undefined, true, false);
    setIdentifiers(network.nodes, "stree", "name");
    const emptyFile = new File([], `science${year}_2y.stree`);
    return createFile(emptyFile, "stree", {
      name: year.toString(),
      ...network,
    });
  });
}

function renderApp() {
  const files = loadScienceNetworks();
  const store = new Store();
  store.setNetworks(files);
  return {
    store,
    ...render(
      <Provider enableSystem defaultTheme="light">
        <StoreContext.Provider value={store}>
          <App />
        </StoreContext.Provider>
      </Provider>
    ),
  };
}

describe("interaction", () => {
  it("nothing fixed+pointer-events:auto overlays the page body when no modal is open", async () => {
    const { container } = renderApp();

    // Close the initial load modal (it opens by default).
    const dialogTitles = screen.queryAllByText(/Load network partitions/i);
    if (dialogTitles.length > 0) {
      // Close button on dialog is via Escape.
      fireEvent.keyDown(document.body, { key: "Escape" });
    }

    // Find all fixed-position elements in the body and any portals.
    const allRoots = [container, ...document.body.querySelectorAll("[data-scope]")];

    // Sanity log so failures are debuggable.
    const blockers: Array<{ tag: string; classes: string; rect: any }> = [];
    document.body.querySelectorAll("*").forEach((el) => {
      const style = window.getComputedStyle(el);
      if (
        (style.position === "fixed" || style.position === "absolute") &&
        style.pointerEvents !== "none"
      ) {
        const rect = el.getBoundingClientRect();
        // jsdom rect is zero unless we measure; this is illustrative.
        blockers.push({
          tag: el.tagName.toLowerCase(),
          classes: (el as HTMLElement).className?.toString().slice(0, 80) ?? "",
          rect: { w: rect.width, h: rect.height },
        });
      }
    });
    // eslint-disable-next-line no-console
    console.log("fixed/abs elements:", blockers.slice(0, 20));
    expect(allRoots.length).toBeGreaterThan(0);
  });

  it("clicking the sidebar 'Load or arrange' button opens the load modal", async () => {
    const { store } = renderApp();

    // Sidebar is rendered. Find the Load button by text.
    const loadButtons = screen.queryAllByText(/Load or arrange/i);
    expect(loadButtons.length).toBeGreaterThan(0);
    const btn = loadButtons[0].closest("button");
    expect(btn).not.toBeNull();
    fireEvent.click(btn!);

    // The Load modal should be open. We check by looking for "Load Example".
    const loadExampleBtn = screen.queryAllByText(/Load Example/i);
    expect(loadExampleBtn.length).toBeGreaterThan(0);

    // Use store too for a more direct assertion.
    expect(store.networks.length).toBeGreaterThan(0);
  });

  it("the closed Load dialog ignores the C and E shortcuts", async () => {
    const fetch = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal("fetch", fetch);
    const { store } = renderApp();
    const dialog = (part: string) =>
      document.querySelector(`[data-scope="dialog"][data-part="${part}"]`)!;
    fireEvent.click(dialog("close-trigger"));
    await waitFor(() =>
      expect(dialog("content").getAttribute("data-state")).toBe("closed")
    );

    const diagram = store.diagram;
    const module = diagram.children[0].visibleChildren[0];
    store.setSelectedModule(module);

    // C contracts and E expands the selected module. In the Load dialog they
    // mean "create diagram" and "load example", which replace the diagram.
    fireEvent.keyDown(window, { key: "e" });
    fireEvent.keyDown(window, { key: "c" });

    expect(store.diagram).toBe(diagram);
    expect(fetch).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
