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

  constructor(networkId: string, parent: HighlightGroup, side: Side) {
    super(networkId, parent, sideToString(side));
    this.side = side;
  }

  static createLeft(networkId: string, parent: HighlightGroup): Branch {
    return new Branch(networkId, parent, LEFT);
  }

  static createRight(networkId: string, parent: HighlightGroup): Branch {
    return new Branch(networkId, parent, RIGHT);
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
