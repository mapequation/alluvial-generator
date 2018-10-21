// @flow
import sortBy from "lodash/sortBy";

import type { AlluvialNode } from "./AlluvialNodeBase";
import AlluvialNodeBase from "./AlluvialNodeBase";
import { BRANCH } from "./depth-constants";
import StreamlineNode from "./StreamlineNode";

export type Side = -1 | 1;

export const LEFT: Side = -1;
export const RIGHT: Side = 1;

export const sideToString = {
  [LEFT]: "left",
  [RIGHT]: "right"
};

export const opposite = (side: Side): Side => (side === LEFT ? RIGHT : LEFT);

export default class Branch extends AlluvialNodeBase {
  children: StreamlineNode[] = [];
  side: Side;

  constructor(side: Side, networkId: string, parent: AlluvialNode) {
    super(networkId, parent, sideToString[side]);
    this.side = side;
  }

  static createLeft(networkId: string, parent: AlluvialNode): Branch {
    return new Branch(LEFT, networkId, parent);
  }

  static createRight(networkId: string, parent: AlluvialNode): Branch {
    return new Branch(RIGHT, networkId, parent);
  }

  get isLeft(): boolean {
    return this.side === LEFT;
  }

  get isRight(): boolean {
    return this.side === RIGHT;
  }

  get depth(): number {
    return BRANCH;
  }

  sortChildren() {
    this.children = sortBy(this.children, [
      child => child.byOppositeStreamlinePosition
    ]);
  }

  asObject(): Object {
    return {
      ...super.asObject(),
      side: this.isLeft ? "left" : "right"
    };
  }
}
