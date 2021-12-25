import AlluvialNodeBase from "./AlluvialNode";
import Branch from "./Branch";
import { HIGHLIGHT_GROUP } from "./Depth";
import type Module from "./Module";
import { LEFT, RIGHT } from "./Side";

export const NOT_HIGHLIGHTED = -1;

export default class HighlightGroup extends AlluvialNodeBase<Branch, Module> {
  readonly depth = HIGHLIGHT_GROUP;
  readonly children: Branch[] = [
    new Branch(this, LEFT),
    new Branch(this, RIGHT),
  ];
  readonly highlightIndex: number;
  readonly insignificant: boolean;

  constructor(
    parent: Module,
    highlightIndex: number = NOT_HIGHLIGHTED,
    insignificant: boolean = false
  ) {
    super(
      parent,
      parent.networkId,
      `${parent.id}_group${insignificant ? "i" : ""}${highlightIndex}`
    );
    parent.addChild(this);
    this.highlightIndex = highlightIndex;
    this.insignificant = insignificant;
  }

  get isHighlighted(): boolean {
    return this.highlightIndex !== NOT_HIGHLIGHTED;
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

  get numLeafNodes(): number {
    return this.left.numLeafNodes;
  }

  get childFlow() {
    return this.left.childFlow;
  }

  *leafNodes() {
    yield* this.left.leafNodes();
  }
}
