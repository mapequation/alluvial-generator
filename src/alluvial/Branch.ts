import AlluvialNodeBase from "./AlluvialNode";
import { BRANCH } from "./Depth";
import type HighlightGroup from "./HighlightGroup";
import type { Side } from "./Side";
import { LEFT, sideToString } from "./Side";
import type StreamlineNode from "./StreamlineNode";

export default class Branch extends AlluvialNodeBase<
  StreamlineNode,
  HighlightGroup
> {
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
