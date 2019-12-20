// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { BRANCH } from "./Depth";
import HighlightGroup from "./HighlightGroup";
import type { Side } from "./Side";
import { LEFT, sideToString } from "./Side";
import StreamlineNode from "./StreamlineNode";


export default class Branch extends AlluvialNodeBase {
  parent: ?HighlightGroup;
  children: StreamlineNode[] = [];
  side: Side;
  depth = BRANCH;

  constructor(parent: HighlightGroup, side: Side) {
    super(parent, parent.networkId, sideToString(side));
    this.side = side;
  }

  get isLeft(): boolean {
    return this.side === LEFT;
  }
}
