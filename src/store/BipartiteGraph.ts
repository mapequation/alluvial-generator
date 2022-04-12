type Side = 0 | 1;
type Weight = number;

export default class BipartiteGraph<Node> {
  nodes: Map<Node, Side> = new Map();
  links: Map<Node, Map<Node, Weight>> = new Map();

  get left() {
    return this.getNodes(0);
  }

  get right() {
    return this.getNodes(1);
  }

  addLink(left: Node, right: Node, weight: Weight) {
    if (!this.links.has(left)) {
      this.links.set(left, new Map());
    }
    this.links.get(left)!.set(right, weight);

    this.nodes.set(left, 0);
    this.nodes.set(right, 1);
  }

  private *getNodes(side: Side = 0) {
    for (const [node, value] of this.nodes.entries()) {
      if (side === value) yield node;
    }
  }
}
