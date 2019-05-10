// @flow
import sortBy from "lodash/sortBy";

import AlluvialNodeBase from "./AlluvialNodeBase";
import { BRANCH } from "./Depth";
import StreamlineNode from "./StreamlineNode";
import type { Side } from "./Side";
import { LEFT, RIGHT, sideToString } from "./Side";
import HighlightGroup from "./HighlightGroup";


export default class Branch extends AlluvialNodeBase {
  parent: ?HighlightGroup;
  children: StreamlineNode[] = [];
  side: Side;
  depth = BRANCH;

  constructor(parent: HighlightGroup, side: Side) {
    super(parent, parent.networkId, sideToString(side));
    this.side = side;
  }

  static createLeft(parent: HighlightGroup): Branch {
    return new Branch(parent, LEFT);
  }

  static createRight(parent: HighlightGroup): Branch {
    return new Branch(parent, RIGHT);
  }

  get isLeft(): boolean {
    return this.side === LEFT;
  }

  get isRight(): boolean {
    return this.side === RIGHT;
  }

  sortChildren(moduleFlowThreshold: number = 0) {
    this.children = sortBy(this.children, [
      child => child.byOppositeStreamlinePosition(moduleFlowThreshold)
    ]);
  }
}
