// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Branch";
import Branch from "./Branch";
import { MODULE, STREAMLINE_NODE } from "./Depth";
import StreamlineId from "./StreamlineId";
import StreamlineLink from "./StreamlineLink";


export default class StreamlineNode extends AlluvialNodeBase {
  parent: ?Branch;
  link: ?StreamlineLink = null;
  side: Side;
  streamlineId: StreamlineId;
  depth = STREAMLINE_NODE;

  constructor(networkId: string, parent: Branch, id: string) {
    super(networkId, parent, id);
    this.side = parent.side;
    this.streamlineId = StreamlineId.fromString(id);
  }

  makeDangling() {
    this.streamlineId = this.streamlineId.getDangling();
    this.id = this.streamlineId.toString();
  }

  get targetId() {
    return this.streamlineId.target;
  }

  get hasTarget(): boolean {
    return !!this.targetId;
  }

  getOppositeStreamlineNode(): ?StreamlineNode {
    if (this.link) {
      return this.link.left === this ? this.link.right : this.link.left;
    }
    return null;
  }

  byOppositeStreamlinePosition(moduleFlowThreshold: number) {
    const at_bottom = -Infinity;
    const opposite = this.getOppositeStreamlineNode();
    if (!opposite) return at_bottom;
    const module = opposite.getAncestor(MODULE);
    if (!module || module.flow < moduleFlowThreshold) return at_bottom;
    return -module.y;
  }

  linkTo(opposite: StreamlineNode) {
    let reverse = this.parent ? this.parent.isLeft : false;
    StreamlineLink.linkNodes(this, opposite, reverse);
  }
}
