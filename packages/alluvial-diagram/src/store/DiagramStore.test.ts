import { isObservableProp } from "mobx";
import { describe, expect, it, vi } from "vitest";
import type { NetworkFile } from "../parsers/types";
import { serializeDiagramData } from "../parsers/alluvial-format";
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

  it("moveNetwork keeps the tone and offset", () => {
    const store = new DiagramStore({ colorTone: "pastel", colorOffset: 90 });
    store.setNetworks([network("a", [0.6, 0.4]), network("b", [0.5, 0.5])]);
    store.setSelectedModule(store.diagram.children[0].children[0]);

    store.moveNetwork("right");

    expect(store.selectedTone).toBe("pastel");
    expect(store.selectedOffset).toBe(90);
    expect(store.selectedScheme).toEqual(
      schemeColors("C3 Sinebow", "pastel", 90)
    );
  });

  it("openNetworks keeps the tone, and the offset unless the scheme changes, for a save without them", () => {
    const saved = (colorScheme: string) => {
      const source = new DiagramStore();
      source.setNetworks([network("a", [0.6, 0.4])]);
      const [{ data }] = serializeDiagramData(source, { saveId: "s" });
      const alluvial = data.alluvial as any;
      delete alluvial.diagram.colorTone;
      delete alluvial.diagram.colorOffset;
      alluvial.diagram.colorScheme = colorScheme;
      return [{ ...network("a", [0.6, 0.4]), alluvial }];
    };
    const store = new DiagramStore({ colorTone: "deep", colorOffset: 90 });

    expect(store.openNetworks(saved("C3 Sinebow"))).toEqual([]);
    expect(store.selectedTone).toBe("deep");
    expect(store.selectedOffset).toBe(90);
    expect(store.selectedScheme).toEqual(
      schemeColors("C3 Sinebow", "deep", 90)
    );

    store.openNetworks(saved("C3 Turbo"));
    expect(store.selectedTone).toBe("deep");
    expect(store.selectedOffset).toBeNull();
    expect(store.selectedScheme).toEqual(schemeColors("C3 Turbo", "deep"));
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

  it("moveNetwork leaves no timer running when the network can't move", () => {
    const store = new DiagramStore();
    store.setNetworks([network("a", [0.6, 0.4]), network("b", [0.5, 0.5])]);
    store.setSelectedModule(store.diagram.children[0].children[0]);
    const time = vi.spyOn(console, "time");
    vi.spyOn(console, "warn").mockImplementation(() => {});

    store.moveNetwork("left");

    expect(time).not.toHaveBeenCalledWith("DiagramStore.moveNetwork");
    expect(store.networks.map((n) => n.id)).toEqual(["a", "b"]);
    vi.restoreAllMocks();
  });

  it("moveNetwork keeps the colors of highlighted modules", () => {
    const store = new DiagramStore();
    store.setNetworks([
      network("a", [0.6, 0.4]),
      network("b", [0.5, 0.5]),
      network("c", [0.7, 0.3]),
    ]);
    const order = () => store.diagram.children.map((n) => n.networkId);
    const colors = () =>
      Object.fromEntries(
        store.diagram.children.flatMap((network) =>
          network.children.map((module) => [
            `${network.networkId}/${module.moduleId}`,
            store.getHighlightColor(module.highlightIndex),
          ])
        )
      );

    const [a, b, c] = store.diagram.children;
    store.colorModule(a.getModule("1")!, "#ff0000");
    store.colorModule(b.getModule("2")!, "#00ff00");
    store.colorModule(c.getModule("1")!, "#0000ff");
    store.colorModule(c.getModule("2")!, "#ff0000");
    const gray = store.defaultHighlightColor;
    const before = {
      "a/1": "#ff0000",
      "a/2": gray,
      "b/1": gray,
      "b/2": "#00ff00",
      "c/1": "#0000ff",
      "c/2": "#ff0000",
    };
    expect(colors()).toEqual(before);

    // Move b to the left, then a to the right.
    store.setSelectedModule(store.diagram.getNetwork("b")!.children[0]);
    store.moveNetwork("left");
    expect(order()).toEqual(["b", "a", "c"]);
    expect(colors()).toEqual(before);

    store.setSelectedModule(store.diagram.getNetwork("a")!.children[0]);
    store.moveNetwork("right");
    expect(order()).toEqual(["b", "c", "a"]);
    expect(colors()).toEqual(before);
  });

  it("moveNetwork keeps recolored modules in networks with node colors", () => {
    // Networks from json files can set the colors of their nodes.
    const withNodeColors = (id: string, nodeColors: string[]) => {
      const file = network(id, [0.6, 0.4]);
      file.nodes.forEach((node, i) =>
        Object.assign(node, { color: nodeColors[i] })
      );
      return Object.assign(file, { colors: true });
    };
    const store = new DiagramStore();
    store.setNetworks([
      withNodeColors("a", ["#111111", "#222222"]),
      withNodeColors("b", ["#333333", "#444444"]),
    ]);
    const module = (networkId: string, moduleId: string) =>
      store.diagram.getNetwork(networkId)!.getModule(moduleId)!;
    const color = (networkId: string, moduleId: string) =>
      store.getHighlightColor(module(networkId, moduleId).highlightIndex);

    expect(color("a", "1")).toBe("#111111");
    store.colorModule(module("a", "1"), "#ff0000");

    store.setSelectedModule(module("a", "1"));
    store.moveNetwork("right");

    expect(store.diagram.children.map((n) => n.networkId)).toEqual(["b", "a"]);
    expect(color("a", "1")).toBe("#ff0000");
    expect(color("a", "2")).toBe("#222222");
    expect(color("b", "1")).toBe("#333333");
    expect(color("b", "2")).toBe("#444444");
  });
});

function coloredNetwork(
  id: string,
  colors: string[] | boolean,
  nodes: { highlightIndex?: number; color?: string }[]
): NetworkFile {
  const file = network(
    id,
    nodes.map(() => 1 / nodes.length)
  );
  file.colors = colors;
  file.nodes.forEach((node, i) => Object.assign(node, nodes[i]));
  return file;
}

function leafColors(store: DiagramStore) {
  return store.diagram.children.map((network) =>
    Object.fromEntries(
      [...network.leafNodes()].map((leaf) => [
        leaf.identifier,
        leaf.highlightIndex === -1
          ? null
          : store.highlightColors[leaf.highlightIndex],
      ])
    )
  );
}

describe("checkColors (S7)", () => {
  const files = () => [
    coloredNetwork(
      "a",
      ["red", "blue"],
      [{ highlightIndex: 1 }, { highlightIndex: 0 }, { highlightIndex: -1 }]
    ),
    coloredNetwork(
      "b",
      ["blue", "green"],
      [{ highlightIndex: 0 }, { highlightIndex: 1 }, { highlightIndex: 7 }]
    ),
    coloredNetwork("c", true, [
      { color: "green" },
      { color: "blue" },
      { highlightIndex: -1 },
    ]),
  ];

  it("remaps each file's palette indices to the merged palette", () => {
    const store = new DiagramStore();
    store.setNetworks(files());
    expect(store.highlightColors).toEqual(["red", "blue", "green"]);
    const indices = store.diagram.children.map((network) =>
      [...network.leafNodes()].map((leaf) => leaf.highlightIndex)
    );
    // a: as-is; b: blue -> 1, green -> 2, 7 (outside its palette) kept;
    // c (colors: true): green -> 2, blue -> 1 (was the dummy index 0).
    expect(indices).toEqual([
      [1, 0, -1],
      [1, 2, 7],
      [2, 1, -1],
    ]);
  });

  it("is the identity when called again on the same files", () => {
    const store = new DiagramStore();
    const networks = files();
    store.setNetworks(networks);
    const before = leafColors(store);
    expect(networks[1].colors).toEqual(["red", "blue", "green"]);
    store.setNetworks(networks);
    expect(store.highlightColors).toEqual(["red", "blue", "green"]);
    expect(leafColors(store)).toEqual(before);
  });
});

describe("moveNetwork after a recolour (S7, H3)", () => {
  it("keeps the palette and every leaf's color", () => {
    const store = new DiagramStore();
    store.setNetworks([
      coloredNetwork(
        "a",
        ["red", "blue"],
        [{ highlightIndex: 0 }, { highlightIndex: 1 }, { highlightIndex: -1 }]
      ),
      coloredNetwork(
        "b",
        ["blue", "red"],
        [{ highlightIndex: 0 }, { highlightIndex: 1 }, { highlightIndex: -1 }]
      ),
    ]);
    const a = store.diagram.children[0];
    store.colorModule(a.getModule("3")!, "green");
    store.colorModule(store.diagram.children[1].getModule("1")!, "green");
    const [colorsA, colorsB] = leafColors(store);
    expect(colorsA).toEqual({ "1": "red", "2": "blue", "3": "green" });
    expect(colorsB).toEqual({ "1": "green", "2": "red", "3": null });

    store.setSelectedModule(a.getModule("1")!);
    store.moveNetwork("right");
    expect(store.diagram.children.map((network) => network.networkId)).toEqual([
      "b",
      "a",
    ]);
    expect(store.highlightColors).toEqual(["red", "blue", "green"]);
    expect(leafColors(store)).toEqual([colorsB, colorsA]);
  });
});

const ids = (modules: { moduleId: string }[]) => modules.map((m) => m.moduleId);

describe("setModuleOrder (B1)", () => {
  function loaded(flowThreshold = 0) {
    const store = new DiagramStore({ flowThreshold });
    store.setNetworks([
      network("a", [0.4, 0.3, 0.2, 0.06, 0.04]),
      network("b", [0.5, 0.3, 0.2]),
    ]);
    return store;
  }

  it("orders several networks with one layout and freezes them", () => {
    const store = loaded();
    const [a, b] = store.diagram.children;
    const layout = vi.spyOn(store.diagram, "updateLayout");
    const target = [...a.visibleChildren].reverse();
    expect(
      store.setModuleOrder([
        [a, target],
        [b, [...b.visibleChildren]],
      ])
    ).toBe(true);
    expect(layout).toHaveBeenCalledTimes(1);
    expect(ids(a.visibleChildren)).toEqual(ids(target));
    // E7a: index follows the drawn order also for a custom order
    expect(a.visibleChildren.map((m) => m.index)).toEqual([0, 1, 2, 3, 4]);
    expect(a.isCustomSorted).toBe(true);
    expect(b.isCustomSorted).toBe(true);
  });

  it("sets the flag without a layout when no order changes", () => {
    const store = loaded();
    const [a] = store.diagram.children;
    const layout = vi.spyOn(store.diagram, "updateLayout");
    expect(store.setModuleOrder([[a, [...a.children]]])).toBe(false);
    expect(layout).not.toHaveBeenCalled();
    expect(a.isCustomSorted).toBe(true);
  });

  it("skips unknown modules and repeats, and lists hidden modules", () => {
    const store = loaded(0.15);
    const [a, b] = store.diagram.children;
    const hidden = a.children.filter((m) => !m.isVisible);
    const visible = a.visibleChildren;
    expect(hidden.length).toBe(2);
    const order = [...hidden]
      .reverse()
      .concat([b.children[0], ...[...visible].reverse(), visible[0]]);
    expect(store.setModuleOrder([[a, order]])).toBe(true);
    // the layout re-partitions children into [...visible, ...hidden], keeping each part's listed order
    expect(ids(a.children)).toEqual(
      ids([...[...visible].reverse(), ...[...hidden].reverse()])
    );
    // E7b: hidden modules have no margin
    expect(hidden.every((m) => m.margin === 0)).toBe(true);
  });
});

describe("Module.move (H1)", () => {
  it("refuses to move the top visible module up past a hidden one", () => {
    const store = new DiagramStore({ flowThreshold: 0.15 });
    store.setNetworks([network("a", [0.4, 0.3, 0.2, 0.06, 0.04])]);
    const [a] = store.diagram.children;
    const before = ids(a.children);
    const top = a.visibleChildren[a.visibleChildren.length - 1];
    store.setSelectedModule(top);
    expect(store.moveSelectedModule("up")).toBe(false);
    expect(ids(a.children)).toEqual(before);
    expect(a.isCustomSorted).toBe(false);
    store.setSelectedModule(a.visibleChildren[0]);
    expect(store.moveSelectedModule("up")).toBe(true);
  });
});

describe("setModuleLevel (B2) and Module.canExpand (H4)", () => {
  // Module 1 has two sub-modules (1:1 with sub-modules of its own); module 2 mixes a leaf at
  // level 2 with one at level 3, so it is not a leaf module but expand() refuses it.
  function deep(id: string): NetworkFile {
    const paths: [string, number][] = [
      ["1:1:1:1", 0.2],
      ["1:1:2:1", 0.15],
      ["1:2:1", 0.25],
      ["2:1", 0.2],
      ["2:2:1", 0.2],
    ];
    return {
      ...network(id, []),
      nodes: paths.map(([path, flow], i) => ({
        id: i + 1,
        name: `${i + 1}`,
        identifier: `${i + 1}`,
        path,
        flow,
      })),
    };
  }

  function loaded() {
    const store = new DiagramStore({ flowThreshold: 0 });
    store.setNetworks([deep("a"), deep("b")]);
    return store;
  }

  it("canExpand carries the refusal rule of expand", () => {
    const store = loaded();
    const [a] = store.diagram.children;
    const one = a.getModule("1")!;
    const two = a.getModule("2")!;
    expect(one.canExpand).toBe(true);
    expect(two.isLeafModule).toBe(false);
    expect(two.canExpand).toBe(false);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(store.expand(two)).toBe(false);
    warn.mockRestore();
  });

  it("expands in rounds with one layout, and is idempotent", () => {
    const store = loaded();
    const layout = vi.spyOn(store.diagram, "updateLayout");
    expect(store.setModuleLevel([3, 2])).toBe(true);
    expect(layout).toHaveBeenCalledTimes(1);
    const [a, b] = store.diagram.children;
    expect(ids(a.children).sort()).toEqual(["1:1:1", "1:1:2", "1:2", "2"]);
    expect(ids(b.children).sort()).toEqual(["1:1", "1:2", "2"]);
    expect(a.children.every((m) => m.moduleLevel <= 3)).toBe(true);

    expect(store.setModuleLevel([3, 2])).toBe(false);
    expect(store.setModuleLevel(1)).toBe(false); // never regroups
    expect(layout).toHaveBeenCalledTimes(1);
    expect(ids(b.children).sort()).toEqual(["1:1", "1:2", "2"]);
  });

  it("moves an expanded selection to its largest visible sub-module, like expand", () => {
    const store = loaded();
    const [a, b] = store.diagram.children;
    expect(store.selectedModule).toBe(a.getModule("1"));
    store.setModuleLevel([3, 2]);
    // 1 -> 1:1 (0.35), 1:2 (0.25) -> 1:1:1 (0.2), 1:1:2 (0.15), 1:2 (0.25)
    expect(store.selectedModule).toBe(a.getModule("1:2"));
    expect(a.children).toContain(store.selectedModule);

    // a selection that is not expanded stays
    const two = b.getModule("2")!;
    store.setSelectedModule(two);
    store.setModuleLevel(3);
    expect(store.selectedModule).toBe(two);
  });

  it("gives the same visible modules as one expand per module", () => {
    const batch = loaded();
    batch.setModuleLevel(3);
    const single = loaded();
    for (const network of single.diagram.children) {
      for (;;) {
        const module = network.children.find(
          (m) => m.isVisible && m.moduleLevel < 3 && m.canExpand
        );
        if (!module) break;
        single.expand(module);
      }
    }
    const visible = (store: DiagramStore) =>
      store.diagram.children.map((n) => ids(n.visibleChildren));
    expect(visible(batch)).toEqual(visible(single));
  });

  it("rejects bad levels", () => {
    const store = loaded();
    for (const bad of [0, 1.5, [2], [2, 2, 2], [2, 0]]) {
      expect(() => store.setModuleLevel(bad)).toThrow(/setModuleLevel/);
    }
  });
});

describe("moveNetwork keeps its state (H3)", () => {
  // Two top modules with sub-modules; identifier "x" is used twice (the
  // second, at 2:1:1, is the registered one) so that the two leaves can get
  // different module levels and colours.
  function file(id: string, bipartiteStartId?: number): NetworkFile {
    const nodes: [string, string, number][] = [
      ["x", "1:1:1", 0.2],
      ["b", "1:2:1", 0.2],
      ["c", "1:2:2", 0.1],
      ["x", "2:1:1", 0.2],
      ["e", "2:2:1", 0.2],
      ["f", "3:1:1", 0.1],
    ];
    return {
      ...network(id, []),
      nodes: nodes.map(([identifier, path, flow], i) => ({
        id: i + 1,
        name: identifier,
        identifier,
        path,
        flow,
      })),
      ...(bipartiteStartId != null ? { bipartiteStartId } : {}),
    };
  }

  function state(store: DiagramStore) {
    return {
      colors: [...store.highlightColors],
      scheme: store.selectedSchemeName,
      options: store.getOptions(),
      networks: store.diagram.children.map((network) => ({
        id: network.networkId,
        name: network.name,
        isCustomSorted: network.isCustomSorted,
        modules: network.children.map((m) => [
          m.moduleId,
          m.name ?? null,
          m.isVisible,
        ]),
        leaves: network.inputLeafNodes.map((leaf) => [
          leaf.identifier,
          leaf.moduleLevel,
          leaf.highlightIndex === -1
            ? null
            : store.highlightColors[leaf.highlightIndex],
          leaf.visible,
        ]),
      })),
    };
  }

  function edited() {
    const store = new DiagramStore({ flowThreshold: 0 });
    store.setNetworks([file("a"), file("b"), file("c", 4)]);
    store.setSelectedScheme("C3 Turbo");
    store.setHeight(500);
    store.setShowBipartiteNodes(false);
    const [a, b, c] = store.diagram.children;

    store.expand(a.getModule("1")!);
    store.colorModule(a.getModule("2")!, "red");
    store.colorModule(a.getModule("1:2")!, "blue");
    store.setModuleName(a.getModule("2")!, "Two");
    store.setModuleName(b.getModule("1")!, "One");
    store.setModuleOrder([[b, [...b.visibleChildren].reverse()]]);
    store.colorModule(c.getModule("3")!, "green");
    store.setNetworkName("b", "Bee");
    return store;
  }

  it("keeps the palette, names, orders, levels and colours of every leaf", () => {
    const store = edited();
    const before = state(store);
    // the duplicates differ, and the custom order differs from the natural one
    expect(before.networks[0].leaves[0]).toEqual(["x", 2, null, true]);
    expect(before.networks[0].leaves[3]).toEqual(["x", 1, "red", true]);
    expect(before.networks[1].modules.map((m) => m[0])).toEqual([
      "3",
      "2",
      "1",
    ]);
    expect(before.networks[2].leaves.map((l) => l[3])).toEqual([
      true,
      true,
      true,
      false,
      false,
      false,
    ]);

    store.setSelectedModule(store.diagram.children[0].getModule("2")!);
    const files = store.networks;
    store.moveNetwork("right");
    // reordered in place: the Load networks dialog keeps this array
    expect(store.networks).toBe(files);
    expect(files.map((f) => f.id)).toEqual(["b", "a", "c"]);
    const moved = state(store);
    expect(moved.networks.map((n) => n.id)).toEqual(["b", "a", "c"]);
    expect(moved).toEqual({
      ...before,
      networks: [before.networks[1], before.networks[0], before.networks[2]],
    });
    expect(store.selectedModule?.networkId).toBe("a");
    expect(store.selectedModule?.moduleId).toBe("2");
    expect(store.networks.every((f) => f.alluvial === undefined)).toBe(true);

    store.moveNetwork("left");
    expect(state(store)).toEqual(before);
  });

  it("lays out like a save and reload of the moved diagram", () => {
    const store = edited();
    store.setSelectedModule(store.diagram.children[1].getModule("1")!);
    store.moveNetwork("left");
    const layout = (s: DiagramStore) =>
      s.diagram.children.map((network) =>
        network.children.map((m) => [m.moduleId, m.layout, m.flow])
      );

    const reloaded = new DiagramStore();
    const files = store.networks.map((f) => ({
      ...f,
      nodes: f.nodes.map((n) => ({ ...n })),
    }));
    // a fresh store opening the files with the same saved block restores the same diagram
    const saved = serializeDiagramData(store, { saveId: "s" });
    files.forEach((f, i) => (f.alluvial = saved[i].data.alluvial as any));
    expect(reloaded.openNetworks(files)).toEqual([]);
    expect(layout(reloaded)).toEqual(layout(store));
  });
});

describe("no console timing in the library (E16)", () => {
  it("setNetworks, layout, colour ops and moveNetwork do not call console.time", () => {
    const time = vi.spyOn(console, "time");
    const timeEnd = vi.spyOn(console, "timeEnd");
    const store = new DiagramStore();
    store.setNetworks([network("a", [0.6, 0.4]), network("b", [0.5, 0.5])]);
    store.colorMatchingModulesInAllNetworks();
    store.setSelectedModule(store.diagram.children[0].children[0]);
    store.moveNetwork("right");
    expect(time).not.toHaveBeenCalled();
    expect(timeEnd).not.toHaveBeenCalled();
    time.mockRestore();
    timeEnd.mockRestore();
  });
});

describe("openNetworks consumes the saved blocks (WP9 review)", () => {
  function opened() {
    const original = new DiagramStore();
    original.setNetworks([network("a", [0.6, 0.4]), network("b", [0.5, 0.5])]);
    original.setHeight(900);
    const files = original.networks.map((f) => ({
      ...f,
      nodes: f.nodes.map((n) => ({ ...n })),
    }));
    const saved = serializeDiagramData(original, { saveId: "s" });
    files.forEach((f, i) => (f.alluvial = saved[i].data.alluvial as any));
    const store = new DiagramStore();
    expect(store.openNetworks(files)).toEqual([]);
    expect(store.height).toBe(900);
    return store;
  }

  it("removes the blocks, so opening the same files again keeps later changes", () => {
    const store = opened();
    expect(store.networks.every((f) => f.alluvial === undefined)).toBe(true);
    store.setHeight(300);
    store.setSelectedScheme("Paired");
    expect(store.openNetworks(store.networks)).toEqual([]);
    expect(store.height).toBe(300);
    expect(store.selectedSchemeName).toBe("Paired");
  });

  it("does not warn about different saves when a plain network is added", () => {
    const store = opened();
    expect(store.openNetworks([...store.networks, network("c", [1])])).toEqual(
      []
    );
    expect(store.height).toBe(900);
  });
});
