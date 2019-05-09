// @flow
import TreePath from "../lib/treepath";
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Side";
import { LEFT } from "./Side";
import { LEAF_NODE } from "./Depth";
import StreamlineNode from "./StreamlineNode";


export default class LeafNode extends AlluvialNodeBase {
  node: Node;
  name: string;
  insignificant: boolean;
  highlightIndex: number;
  treePath: TreePath;
  depth = LEAF_NODE;
  moduleLevel: number = 1;

  leftParent: ?StreamlineNode;
  rightParent: ?StreamlineNode;

  constructor(node: Node, networkId: string) {
    super(networkId, null, node.path);
    this.node = node;
    this.name = node.name;
    this.flow = node.flow;
    this.treePath = new TreePath(node.path);
    this.insignificant = node.insignificant || false;
    this.highlightIndex =
      node.highlightIndex != null && Number.isInteger(node.highlightIndex)
        ? node.highlightIndex
        : -1;
  }

  get level(): number {
    return this.treePath.level;
  }

  ancestorAtLevel(moduleLevel: number): string {
    return this.treePath.ancestorAtLevelAsString(moduleLevel);
  }

  getAncestorAtCurrentLevel(): string {
    return this.treePath.ancestorAtLevelAsString(this.moduleLevel);
  }

  set parent(parent: ?StreamlineNode) {
    this.leftParent = this.rightParent = parent;
  }

  get parent(): ?StreamlineNode {
    return this.leftParent || this.rightParent;
  }

  getParent(side: Side): ?StreamlineNode {
    return side === LEFT ? this.leftParent : this.rightParent;
  }

  setParent(parent: StreamlineNode, side: Side) {
    if (side === LEFT) {
      this.leftParent = parent;
    } else {
      this.rightParent = parent;
    }
  }

  removeFromParent() {
    console.warn("LeafNode.removeFromParent() is a no-op");
  }

  asObject(): Object {
    return {
      ...super.asObject(),
      name: this.name,
      highlightIndex: this.highlightIndex,
    };
  }

  * leafNodes(): Iterable<AlluvialNode> {
    yield this;
  }
}
