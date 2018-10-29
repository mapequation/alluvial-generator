// @flow
import TreePath from "../lib/treepath";
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Branch";
import { LEFT } from "./Branch";
import { LEAF_NODE } from "./Depth";
import StreamlineNode from "./StreamlineNode";

export default class LeafNode extends AlluvialNodeBase {
  node: Node;
  name: string;
  insignificant: boolean;
  highlightIndex: number;

  moduleLevel: number = 1;

  leftParent: ?StreamlineNode;
  rightParent: ?StreamlineNode;

  constructor(node: Node, networkId: string) {
    super(networkId, null, node.path);
    this.node = node;
    this.name = node.name;
    this.flow = node.flow;
    this.insignificant = node.insignificant || false;
    this.highlightIndex =
      node.highlightIndex != null && Number.isInteger(node.highlightIndex)
        ? node.highlightIndex
        : -1;
  }

  get level(): number {
    return TreePath.level(this.node.path);
  }

  ancestorAtLevel(moduleLevel: number): string {
    return TreePath.ancestorAtLevel(this.node.path, moduleLevel).toString();
  }

  getAncestorAtCurrentLevel(): string {
    return this.ancestorAtLevel(this.moduleLevel);
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

  asObject(): Object {
    return {
      ...super.asObject(),
      name: this.name
    };
  }

  get depth(): number {
    return LEAF_NODE;
  }
}
