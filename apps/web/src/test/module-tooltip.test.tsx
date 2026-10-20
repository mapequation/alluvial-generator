import { render } from "@testing-library/react";
import { parse } from "@mapequation/infomap-parser";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ComponentType } from "react";
import { describe, expect, it } from "vitest";
import {
  createFile,
  setIdentifiers,
  type Module,
} from "@mapequation/alluvial-diagram";
import JsModuleTooltip from "../components/Diagram/Tooltip/ModuleTooltip";
import { PiePlot } from "../components/Diagram/Tooltip/PiePlot";
import "../immer";
import { Provider } from "../components/ui/provider";
import { Store } from "../store/Store";

function loadScienceNetworks() {
  return [2001, 2003].map((year) => {
    const text = readFileSync(
      resolve(__dirname, `../../public/data/science${year}_2y.stree`),
      "utf8"
    );
    const network = parse(text, undefined, true, false);
    setIdentifiers(network.nodes, "stree", "name");
    return createFile(new File([], `science${year}_2y.stree`), "stree", {
      name: year.toString(),
      ...network,
    });
  });
}

// ModuleTooltip is plain JS, so TypeScript doesn't know its props.
const ModuleTooltip = JsModuleTooltip as ComponentType<{
  module: Module;
  fillColor: () => string;
}>;

describe("ModuleTooltip", () => {
  it("leaves the module expandable after rendering its charts", () => {
    const store = new Store();
    store.setNetworks(loadScienceNetworks());
    const module = store.diagram.children[0].visibleChildren[0];

    render(
      <Provider enableSystem defaultTheme="light">
        <ModuleTooltip module={module} fillColor={() => "#000"} />
      </Provider>
    );

    expect(store.expand(module)).toBe(true);
  });

  it("charts don't freeze their data", () => {
    // Fails if recharts resolves a different copy of Immer than src/immer.ts.
    const data = [
      { name: "a", flow: 0.6, highlightIndex: -1, insignificant: false },
      { name: "b", flow: 0.4, highlightIndex: -1, insignificant: false },
    ];

    render(<PiePlot data={data} fillColor={() => "#000"} />);

    expect(Object.isFrozen(data)).toBe(false);
    expect(Object.isFrozen(data[0])).toBe(false);
  });
});
