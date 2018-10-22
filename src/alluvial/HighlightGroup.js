// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch from "./Branch";
import { HIGHLIGHT_GROUP } from "./depth-constants";
import Module from "./Module";

export const NOT_HIGHLIGHTED = -1;
export const INSIGNIFICANT = -2;

export default class HighlightGroup extends AlluvialNodeBase {
  parent: ?Module;
  children: Branch[] = [
    Branch.createLeft(this.networkId, this),
    Branch.createRight(this.networkId, this)
  ];

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
      ...super.asObject(),
      moduleLevel: this.parent ? this.parent.moduleLevel : 1,
      highlightIndex: this.highlightIndex
    };
  }

  get depth(): number {
    return HIGHLIGHT_GROUP;
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
}
