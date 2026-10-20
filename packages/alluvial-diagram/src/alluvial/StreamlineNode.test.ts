import { describe, expect, it } from "vitest";
import type { NetworkFile, Node } from "../parsers/types";
import Branch from "./Branch";
import { NETWORK } from "./Depth";
import Diagram from "./Diagram";
import type Network from "./Network";
import { LEFT, RIGHT } from "./Side";

function node(name: string, path: string, flow: number): Node {
  return { id: name.charCodeAt(0), name, identifier: name, path, flow };
}

function network(id: string, nodes: Node[]): NetworkFile {
  return {
    id,
    nodes,
    name: id,
    filename: `${id}.tree`,
    format: "tree",
    size: 0,
    lastModified: 0,
    haveModules: true,
  };
}

function branches(diagram: Diagram) {
  const result: Branch[] = [];
  diagram.forEachDepthFirst((node) => {
    if (node instanceof Branch) result.push(node);
  });
  return result;
}

function expectNoDuplicateStreamlineNodes(diagram: Diagram) {
  for (const branch of branches(diagram)) {
    const nodes = branch.children;
    const ids = nodes.map((node) => node.currentId);
    expect(
      new Set(ids).size,
      `duplicate ids in ${branch.parent?.id} ${branch.id}`
    ).toBe(ids.length);
    expect(nodes.filter((node) => node.isDangling).length).toBeLessThanOrEqual(
      1
    );

    const network = branch.getAncestor(NETWORK) as Network;
    for (const node of nodes) {
      expect(network.getStreamlineNode(node.currentId)).toBe(node);
    }
  }
}

function danglingLeafNames(diagram: Diagram, networkId: string) {
  const names: string[] = [];
  for (const branch of branches(diagram)) {
    if (branch.networkId !== networkId) continue;
    for (const node of branch.children) {
      if (node.isDangling) {
        names.push(...node.children.map((leaf) => `${leaf.name}:${branch.id}`));
      }
    }
  }
  return names.sort();
}

describe("dangling streamline nodes", () => {
  // c, d and e exist in A but are missing from B
  const createDiagram = () =>
    new Diagram([
      network("A", [
        node("a", "1:1", 0.2),
        node("b", "1:2", 0.2),
        node("c", "1:3", 0.2),
        node("d", "1:4", 0.2),
        node("e", "2:1", 0.2),
      ]),
      network("B", [node("a", "1:1", 0.5), node("b", "1:2", 0.5)]),
    ]);

  it("groups nodes missing from the neighbour network in one streamline node", () => {
    const diagram = createDiagram();

    expectNoDuplicateStreamlineNodes(diagram);

    const moduleA1Right = branches(diagram).find(
      (branch) =>
        branch.networkId === "A" &&
        branch.id === "right" &&
        branch.parent?.parent?.moduleId === "1"
    )!;
    const [linked, dangling] = [...moduleA1Right.children].sort(
      (a, b) => Number(a.isDangling) - Number(b.isDangling)
    );
    expect(moduleA1Right.children).toHaveLength(2);
    expect(linked.isDangling).toBe(false);
    expect(linked.children.map((leaf) => leaf.name).sort()).toEqual(["a", "b"]);
    expect(dangling.isDangling).toBe(true);
    expect(dangling.children.map((leaf) => leaf.name).sort()).toEqual([
      "c",
      "d",
    ]);
  });

  it("does not duplicate dangling streamline nodes after repainting", () => {
    const diagram = createDiagram();
    const before = danglingLeafNames(diagram, "A");

    const [moduleA1, moduleA2] = diagram.getNetwork("A")!.children;
    const [moduleB1] = diagram.getNetwork("B")!.children;

    moduleA1.setColor(1);
    expectNoDuplicateStreamlineNodes(diagram);

    moduleA2.setColor(2);
    expectNoDuplicateStreamlineNodes(diagram);

    // Repainting the neighbour makes A's linked streamline node dangling
    // for a moment, which must merge with A's existing dangling node.
    moduleB1.setColor(3);
    expectNoDuplicateStreamlineNodes(diagram);

    moduleA1.removeColors();
    moduleA2.removeColors();
    moduleB1.removeColors();
    expectNoDuplicateStreamlineNodes(diagram);

    expect(danglingLeafNames(diagram, "A")).toEqual(before);
  });
});

describe("recolouring a single-leaf module", () => {
  // Module 2 of A holds the single leaf e
  const createDiagram = () => {
    const diagram = new Diagram([
      network("A", [
        node("a", "1:1", 0.3),
        node("b", "1:2", 0.3),
        node("e", "2:1", 0.4),
      ]),
      network("B", [node("a", "1:1", 0.5), node("e", "1:2", 0.5)]),
    ]);
    diagram.calcFlow();
    return diagram;
  };

  it("keeps the module object, its name, position and flow", () => {
    const diagram = createDiagram();
    const networkA = diagram.getNetwork("A")!;
    const single = networkA.getModule("2")!;
    single.name = "solo";
    networkA.children.reverse();
    const order = [...networkA.children];
    const flow = single.flow;

    single.setColor(1);
    expectNoDuplicateStreamlineNodes(diagram);

    expect(networkA.getModule("2")).toBe(single);
    expect(single.name).toBe("solo");
    expect(networkA.children).toEqual(order);
    expect(single.flow).toBe(flow);
    expect(single.getLeafNodes().map((leaf) => leaf.highlightIndex)).toEqual([
      1,
    ]);

    single.removeColors();
    expectNoDuplicateStreamlineNodes(diagram);
    expect(networkA.getModule("2")).toBe(single);
    expect(networkA.children).toEqual(order);
  });

  it("does not touch leaves whose colour does not change", () => {
    const diagram = createDiagram();
    const single = diagram.getNetwork("A")!.getModule("2")!;
    single.setColor(1);
    const [leaf] = single.getLeafNodes();
    const parents = [leaf.getParent(LEFT), leaf.getParent(RIGHT)];

    single.setColor(1);
    expectNoDuplicateStreamlineNodes(diagram);
    expect([leaf.getParent(LEFT), leaf.getParent(RIGHT)]).toEqual(parents);
  });
});

describe("duplicate identifiers", () => {
  // B has two leaves named y; only the last one is registered
  const createDiagram = () =>
    new Diagram([
      network("A", [node("x", "1:1", 0.5), node("y", "1:2", 0.5)]),
      network("B", [
        node("x", "1:1", 0.3),
        node("y", "1:2", 0.3),
        node("y", "2:1", 0.4),
      ]),
    ]);

  function streamlineIds(diagram: Diagram) {
    return branches(diagram)
      .flatMap((branch) => branch.children.map((node) => node.currentId))
      .sort();
  }

  it("links only the registered duplicate and leaves no NULL-- id", () => {
    const diagram = createDiagram();
    expectNoDuplicateStreamlineNodes(diagram);
    const ids = streamlineIds(diagram);
    expect(ids.filter((id) => id.startsWith("NULL--"))).toEqual([]);

    const networkB = diagram.getNetwork("B")!;
    const registered = networkB.getLeafNode("y")!;
    expect(registered.moduleId).toBe("2");
    expect(registered.getOpposite(LEFT)).toBe(
      diagram.getNetwork("A")!.getLeafNode("y")
    );
    const other = networkB
      .getModule("1")!
      .getLeafNodes()
      .find((leaf) => leaf.identifier === "y")!;
    expect(other.getOpposite(LEFT)).toBeNull();
    expect(other.getParent(LEFT)!.isDangling).toBe(true);

    // Updating every leaf (the old re-steal path) changes nothing
    for (const net of diagram.children) {
      for (const module of net.children) {
        module.getLeafNodes().forEach((leaf) => leaf.update());
      }
    }
    expectNoDuplicateStreamlineNodes(diagram);
    expect(streamlineIds(diagram)).toEqual(ids);
  });
});
