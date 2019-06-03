// @flow
import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch from "./Branch";
import { HIGHLIGHT_GROUP } from "./Depth";
import Module from "./Module";


export const NOT_HIGHLIGHTED = -1;
export const INSIGNIFICANT = -2;

export default class HighlightGroup extends AlluvialNodeBase {
  parent: ?Module;
  children: Branch[] = [
    Branch.createLeft(this),
    Branch.createRight(this)
  ];
  depth = HIGHLIGHT_GROUP;
  highlightIndex: number;
  insignificant: boolean;

  constructor(
    parent: Module,
    highlightIndex: number = NOT_HIGHLIGHTED,
    insignificant: boolean = false
  ) {
    super(parent, parent.networkId, `${parent.id}_group${insignificant ? "i" : ""}${highlightIndex}`);
    parent.addChild(this);
    this.highlightIndex = highlightIndex;
    this.insignificant = insignificant;
  }

  asObject() {
    return {
      id: this.id,
      networkId: this.networkId,
      flow: this.flow,
      depth: this.depth,
      ...this.layout,
      highlightIndex: this.highlightIndex
    };
  }

  get left() {
    return this.children[0];
  }

  get right() {
    return this.children[1];
  }

  get isEmpty(): boolean {
    return this.left.isEmpty && this.right.isEmpty;
  }

  * leafNodes(): Iterable<AlluvialNode> {
    yield* this.left.leafNodes();
  }
}
