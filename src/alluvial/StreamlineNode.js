// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch from "./Branch";
import { HIGHLIGHT_GROUP, STREAMLINE_NODE } from "./Depth";
import LeafNode from "./LeafNode";
import type { Side } from "./Side";
import { LEFT } from "./Side";
import StreamlineId from "./StreamlineId";
import StreamlineLink from "./StreamlineLink";


export default class StreamlineNode extends AlluvialNodeBase {
  parent: ?Branch;
  children: LeafNode[] = [];
  link: ?StreamlineLink = null;
  side: Side;
  streamlineId: StreamlineId;
  depth = STREAMLINE_NODE;
  nodeIndexById: Map<string, number> = new Map();

  constructor(parent: Branch, id: string) {
    super(parent, parent.networkId, id);
    parent.addChild(this);
    this.side = parent.side;
    this.streamlineId = StreamlineId.fromId(id);
  }

  addChild(node: LeafNode) {
    const length = super.addChild(node);
    const index = length - 1;
    this.nodeIndexById.set(node.id, index);
    return length;
  }

  removeChild(node: LeafNode) {
    const index = this.nodeIndexById.get(node.id);
    if (index == null) {
      return false;
    }
    const moved = this.children[index] = this.children[this.children.length - 1];
    this.children.pop();

    this.nodeIndexById.set(moved.id, index);
    this.nodeIndexById.delete(node.id);

    return true;
  }

  get numLeafNodes(): number {
    return this.children.length;
  }

  makeDangling() {
    this.id = this.streamlineId.makeDangling();
  }

  get sourceId() {
    return this.streamlineId.source;
  }

  get targetId() {
    return this.streamlineId.target;
  }

  get hasTarget(): boolean {
    return !!this.streamlineId.target;
  }

  getOpposite(): ?StreamlineNode {
    if (this.link) {
      return this.link.left === this ? this.link.right : this.link.left;
    }
    return null;
  }

  oppositeStreamlinePosition(flowThreshold: number) {
    const atBottom = -Infinity;
    const opposite = this.getOpposite();
    if (!opposite) return atBottom;
    const group = opposite.getAncestor(HIGHLIGHT_GROUP);
    if (!group || group.flow < flowThreshold) return atBottom;
    return -group.y;
  }

  linkTo(opposite: StreamlineNode) {
    const reverse = this.side === LEFT;
    StreamlineLink.linkNodes(this, opposite, reverse);
  }

  removeLink() {
    if (this.link) {
      this.link.remove();
    }
  }
}
