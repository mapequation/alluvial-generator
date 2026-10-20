import { freeze } from "immer";
import { describe, expect, it } from "vitest";
import type { NetworkFile } from "../parsers/types";
import { DiagramStore } from "../store/DiagramStore";
import TreePath from "../utils/TreePath";
import {
  Branch,
  Diagram,
  HighlightGroup,
  LeafNode,
  Module,
  Network,
  StreamlineLink,
  StreamlineNode,
} from ".";

// Charting libraries such as recharts copy the objects they are given into
// plain objects and keep them in an Immer store, which deep-freezes every
// plain object, array, Map and Set it can reach. The diagram must keep
// working when that happens to any of its objects.

const MODEL_CLASSES = [
  Diagram,
  Network,
  Module,
  HighlightGroup,
  Branch,
  StreamlineNode,
  StreamlineLink,
  LeafNode,
  TreePath,
];

function network(id: string, paths: string[]): NetworkFile {
  return {
    id,
    nodes: paths.map((path, i) => ({
      id: i + 1,
      name: `${i + 1}`,
      identifier: `${i + 1}`,
      path,
      flow: 1 / paths.length,
      metadata: { group: i % 2 },
    })),
    name: id,
    filename: `${id}.tree`,
    format: "tree",
    size: 0,
    lastModified: 0,
    haveModules: true,
  };
}

function createStore() {
  const store = new DiagramStore();
  store.setNetworks([
    network("a", ["1:1:1", "1:1:2", "1:2:1", "1:2:2", "2:1:1", "2:1:2"]),
    network("b", ["1:1:1", "1:2:1", "1:1:2", "2:1:1", "2:2:1", "2:2:2"]),
  ]);
  return store;
}

function isContainer(value: unknown) {
  if (typeof value !== "object" || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return (
    proto === Object.prototype ||
    proto === null ||
    Array.isArray(value) ||
    value instanceof Map ||
    value instanceof Set
  );
}

function modelObjects(store: DiagramStore) {
  const seen = new Set<object>();
  const visit = (value: unknown) => {
    if (typeof value !== "object" || value === null || seen.has(value)) return;
    seen.add(value);
    const items =
      value instanceof Map || value instanceof Set
        ? value.values()
        : Object.getOwnPropertyNames(value).map((key) => (value as any)[key]);
    for (const item of items) visit(item);
  };
  visit(store.diagram);
  return [...seen].filter((object) =>
    MODEL_CLASSES.some((Class) => object instanceof Class)
  );
}

function exposedContainers(store: DiagramStore) {
  const exposed = new Set<string>();
  for (const object of modelObjects(store)) {
    for (const [key, value] of Object.entries(object)) {
      if (isContainer(value)) exposed.add(`${object.constructor.name}.${key}`);
    }
  }
  return [...exposed].sort();
}

function freezeCopies(store: DiagramStore) {
  for (const object of modelObjects(store)) {
    freeze({ ...object }, true);
  }
}

describe("frozen copies of diagram objects", () => {
  it("don't reach any internal arrays, objects or maps", () => {
    const store = createStore();
    const module = store.diagram.children[0].visibleChildren[0];
    store.expand(module);

    expect(exposedContainers(store)).toEqual([]);
  });

  it("leave the diagram editable", () => {
    const store = createStore();
    freezeCopies(store);

    const module = store.diagram.children[0].visibleChildren[0];
    store.setSelectedModule(module);
    expect(store.expand(module)).toBe(true);
    freezeCopies(store);

    const subModule = store.selectedModule!;
    store.colorModuleIdsInAllNetworks();
    store.colorModuleIds(subModule, store.selectedScheme[1]);
    store.moveSelectedModule("down");
    store.moveSelectedModule("up");
    store.moveNetwork("right");
    store.resetLayout();
    store.clearColors();
    expect(store.regroup(subModule)).toBe(true);
  });
});
