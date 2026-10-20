import { describe, expect, it } from "vitest";
import type { NetworkFile } from "../parsers/types";
import Diagram from "./Diagram";

function network(
  nodes: { flow: number; moduleLevel?: number }[],
  extra: Partial<NetworkFile> = {}
): NetworkFile {
  return {
    id: "a",
    nodes: nodes.map(({ flow, moduleLevel }, i) => ({
      id: i + 1,
      name: `${i + 1}`,
      identifier: `${i + 1}`,
      path: [i + 1, 1, 1],
      flow,
      moduleLevel,
    })),
    name: "a",
    filename: "a.json",
    format: "json",
    size: 0,
    lastModified: 0,
    haveModules: true,
    ...extra,
  };
}

describe("Network.create validates flows (E9)", () => {
  for (const flow of [NaN, Infinity, undefined, null, "0.5"]) {
    it(`throws for the flow ${String(flow)}`, () => {
      const file = network([{ flow: 0.5 }, { flow: flow as any }]);
      expect(() => new Diagram([file])).toThrow("Node 2 has no finite flow");
    });
  }

  it("accepts zero and negative zero", () => {
    expect(
      () => new Diagram([network([{ flow: 0 }, { flow: -0 }])])
    ).not.toThrow();
  });
});

describe("bipartiteStartId (E14)", () => {
  it("null is not bipartite", () => {
    const file = network([{ flow: 1 }], { bipartiteStartId: null as any });
    const net = new Diagram([file]).children[0];
    expect(net.isBipartite).toBe(false);
    net.toggleShowBipartiteNodes(false);
    expect([...net.leafNodes()].every((node) => node.visible)).toBe(true);
  });

  it("a number is bipartite", () => {
    const file = network([{ flow: 1 }, { flow: 1 }], { bipartiteStartId: 2 });
    const net = new Diagram([file]).children[0];
    expect(net.isBipartite).toBe(true);
  });
});

describe("LeafNode.moduleLevel (E18)", () => {
  const cases: [any, number][] = [
    [undefined, 1],
    [0, 1],
    [-1, 1],
    [1.5, 1],
    [true, 1],
    ["2", 1],
    [1, 1],
    [2, 2],
  ];
  for (const [moduleLevel, expected] of cases) {
    it(`${String(moduleLevel)} gives level ${expected}`, () => {
      const file = network([{ flow: 0.5, moduleLevel }, { flow: 0.5 }]);
      const net = new Diagram([file]).children[0];
      const leaf = [...net.leafNodes()].find((node) => node.nodeId === 1)!;
      expect(leaf.moduleLevel).toBe(expected);
    });
  }
});

describe("Network.tree with a visible module and its visible sub-module (E15a)", () => {
  // Module 1 (leaves 1-2, level 1) and its sub-module 1:1 (leaf 3, level 2) are both visible.
  function mixed() {
    const file: NetworkFile = {
      ...network([
        { flow: 0.3 },
        { flow: 0.2 },
        { flow: 0.4, moduleLevel: 2 },
        { flow: 0.1 },
      ]),
    };
    file.nodes = file.nodes.map((node, i) => ({
      ...node,
      path: [
        [1, 2, 1],
        [1, 2, 2],
        [1, 1, 1],
        [2, 1, 1],
      ][i],
    }));
    const diagram = new Diagram([file]);
    diagram.calcFlow();
    const net = diagram.children[0];
    return { diagram, net };
  }

  for (const parentFirst of [false, true]) {
    it(`gives module 1 one enclosing outline (${parentFirst ? "1" : "1:1"} first)`, () => {
      const { net } = mixed();
      const parent = net.getModule("1")!;
      const sub = net.getModule("1:1")!;
      expect(parent.isVisible && sub.isVisible).toBe(true);
      net.setModuleOrder(parentFirst ? [parent, sub] : [sub, parent]);
      const items = net.hierarchicalChildren;
      const outlines = items.filter((item) => "isLeaf" in item);
      expect(outlines.map((item) => (item as any).path)).toEqual(["1"]);
      expect(items.filter((item) => !("isLeaf" in item)).length).toBe(3);
    });
  }
});

describe("Network.metadata statistics (E13)", () => {
  function real(values: number[]) {
    const file = network(values.map(() => ({ flow: 1 / values.length })));
    file.nodes.forEach((node: any, i) => (node.metadata = { x: values[i] }));
    return new Diagram([file]).children[0].metadata.x as any;
  }

  it("gives the sample variance and standard deviation", () => {
    const x = real([4, 1, 3, 2]);
    expect(x.mean).toBe(2.5);
    expect(x.variance).toBeCloseTo(5 / 3, 15);
    expect(x.standardDeviation).toBeCloseTo(Math.sqrt(5 / 3), 15);
    const sd = x.standardDeviation;
    expect(x.pdfBounds).toEqual([
      1,
      2.5 - 2 * sd,
      2.5 - sd,
      2.5 + sd,
      2.5 + 2 * sd,
      4,
    ]);
  });

  it("gives zero spread for a single value", () => {
    const x = real([7]);
    expect([x.mean, x.variance, x.standardDeviation]).toEqual([7, 0, 0]);
  });
});
