// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import type { Side } from "./Branch";
import Branch from "./Branch";
import { STREAMLINE_NODE, MODULE } from "./Depth";
import StreamlineLink from "./StreamlineLink";
import StreamlineId from "./StreamlineId";

export default class StreamlineNode extends AlluvialNodeBase {
  parent: ?Branch;
  link: ?StreamlineLink = null;
  side: Side;
  streamlineId: StreamlineId;

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

  hasTarget(): boolean {
    return !!this.targetId;
  }

  getOppositeStreamlineNode(): ?StreamlineNode {
    if (this.link) {
      return this.link.left === this ? this.link.right : this.link.left;
    }
    return null;
  }

  get depth(): number {
    return STREAMLINE_NODE;
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
