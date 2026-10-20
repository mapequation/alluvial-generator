import { isObservableProp } from "mobx";
import { describe, expect, it } from "vitest";
import type { NetworkFile } from "../parsers/types";
import { COLOR_SCHEMES, schemeColors } from "../schemes";
import { DiagramStore } from "./DiagramStore";

function network(id: string, moduleFlows: number[]): NetworkFile {
  return {
    id,
    nodes: moduleFlows.map((flow, i) => ({
      id: i + 1,
      name: `${i + 1}`,
      identifier: `${i + 1}`,
      path: `${i + 1}:1`,
      flow,
    })),
    name: id,
    filename: `${id}.tree`,
    format: "tree",
    size: 0,
    lastModified: 0,
    haveModules: true,
  };
}

function hierarchicalNetwork(id: string, paths: string[]): NetworkFile {
  return {
    ...network(id, []),
    nodes: paths.map((path, i) => ({
      id: i + 1,
      name: `${i + 1}`,
      identifier: `${i + 1}`,
      path,
      flow: 1 / paths.length,
    })),
  };
}

describe("DiagramStore", () => {
  it("has usable defaults without any setup", () => {
    const store = new DiagramStore();
    expect(store.identifier).toBe("id");
    expect(store.showModuleId).toBe(false);
    expect(store.selectedSchemeName).toBe("C3 Sinebow");
    expect(store.highlightColors).toEqual([...COLOR_SCHEMES["C3 Sinebow"]]);
  });

  it("takes initial values as constructor options, also from subclasses", () => {
    class AppStore extends DiagramStore {
      constructor() {
        super({ identifier: "name", colorScheme: "C3 Turbo", showModuleId: true });
      }
    }

    for (const store of [
      new DiagramStore({
        identifier: "name",
        colorScheme: "C3 Turbo",
        showModuleId: true,
      }),
      new AppStore(),
    ]) {
      expect(store.identifier).toBe("name");
      expect(store.showModuleId).toBe(true);
      expect(store.selectedSchemeName).toBe("C3 Turbo");
      expect(store.selectedScheme).toBe(COLOR_SCHEMES["C3 Turbo"]);
      expect(isObservableProp(store, "identifier")).toBe(true);
      expect(isObservableProp(store, "showModuleId")).toBe(true);
    }
  });

  it("updateLayout is a no-op before networks are loaded", () => {
    const store = new DiagramStore();
    const { updateFlag } = store;
    expect(() => store.setHeight(500)).not.toThrow();
    expect(store.updateFlag).toBe(updateFlag);
    expect(() => store.colorNodesInModulesInAllNetworks(undefined)).not.toThrow();
  });

  it("loads networks and colors nodes from the first network", () => {
    const store = new DiagramStore();
    store.setNetworks([network("a", [0.6, 0.4]), network("b", [0.5, 0.5])]);

    expect(store.numNetworks).toBe(2);
    expect(store.diagram.children).toHaveLength(2);
    expect(store.selectedModule).toBe(store.diagram.children[0].children[0]);

    store.colorNodesInModulesInAllNetworks(undefined);
    expect(store.highlightColors).toEqual(
      COLOR_SCHEMES["C3 Sinebow"].slice(0, 2)
    );
  });

  it("colors modules by the module hierarchy, alike for the same path in all networks", () => {
    const store = new DiagramStore();
    store.setNetworks([
      hierarchicalNetwork("a", ["1:1:1", "1:2:1", "2:1:1"]),
      hierarchicalNetwork("b", ["1:1:1", "2:1:1", "2:2:1"]),
    ]);
    const [a, b] = store.diagram.children;
    const module = (network: typeof a, moduleId: string) =>
      network.children.find((m) => m.isVisible && m.moduleId === moduleId)!;
    const color = (network: typeof a, moduleId: string) =>
      store.getHighlightColor(module(network, moduleId).highlightIndex);

    store.colorModuleHierarchyInAllNetworks();
    expect(color(a, "1")).toBe(color(b, "1"));
    expect(color(a, "2")).toBe(color(b, "2"));
    expect(color(a, "1")).not.toBe(color(a, "2"));

    store.expand(module(a, "1"));
    store.colorModuleHierarchyInAllNetworks();
    const children = [color(a, "1:1"), color(a, "1:2")];
    expect(new Set([...children, color(a, "2")]).size).toBe(3);
    expect(children).not.toContain(color(b, "1"));
  });

  it("takes the tone and offset of the C3 schemes as options and settings", () => {
    const store = new DiagramStore({ colorTone: "deep" });
    expect(store.selectedScheme).toEqual(schemeColors("C3 Sinebow", "deep"));

    store.setSelectedTone("pastel");
    expect(store.selectedScheme).toEqual(schemeColors("C3 Sinebow", "pastel"));

    store.setSelectedOffset(90);
    expect(store.selectedScheme).toEqual(
      schemeColors("C3 Sinebow", "pastel", 90)
    );

    store.setSelectedScheme("Set3");
    expect(store.selectedScheme).toBe(COLOR_SCHEMES.Set3);
    expect(store.selectedOffset).toBeNull();
  });

  it("moveNetwork rebuilds the diagram in the new order", () => {
    const store = new DiagramStore();
    store.setNetworks([network("a", [0.6, 0.4]), network("b", [0.5, 0.5])]);
    store.setSelectedModule(store.diagram.children[0].children[0]);

    store.moveNetwork("right");

    expect(store.networks.map((n) => n.id)).toEqual(["b", "a"]);
    expect(store.diagram.children.map((n) => n.networkId)).toEqual(["b", "a"]);
    expect(store.selectedModule?.networkId).toBe("a");
  });
});
