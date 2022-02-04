import { Module } from "../alluvial";

export default class BipartiteGraph {
  nodes: Map<Module, number> = new Map();
  links: Map<Module, Map<Module, number>> = new Map();

  get left() {
    return this.getNodes(0);
  }

  get right() {
    return this.getNodes(1);
  }

  addLink(left: Module, right: Module, weight: number) {
    if (!this.links.has(left)) {
      this.links.set(left, new Map());
    }
    this.links.get(left)!.set(right, weight);

    this.nodes.set(left, 0);
    this.nodes.set(right, 1);
  }

  private *getNodes(side: number = 0) {
    for (const [node, value] of this.nodes.entries()) {
      if (side === value) yield node;
    }
  }
}
