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
    Branch.createLeft(this.networkId, this),
    Branch.createRight(this.networkId, this)
  ];
  depth = HIGHLIGHT_GROUP;
  highlightIndex: number;

  constructor(
    networkId: string,
    parent: Module,
    highlightIndex: number = NOT_HIGHLIGHTED
  ) {
    super(networkId, parent, `${parent.id}_group${highlightIndex}`);
    this.highlightIndex = highlightIndex;
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
