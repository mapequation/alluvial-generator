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

  constructor(parent: Branch, id: string) {
    super(parent, parent.networkId, id);
    parent.addChild(this);
    this.side = parent.side;
    this.streamlineId = StreamlineId.fromId(id);
  }

  addChild(node: LeafNode): number {
    const length = super.addChild(node);
    node.setIndex(length - 1, this.side);
    return length;
  }

  removeChild(node: LeafNode) {
    const index = node.getIndex(this.side);
    const found = index > -1 && index < this.children.length;

    if (found) {
      this.children[index] = this.children[this.children.length - 1];
      this.children[index].setIndex(index, this.side);
      node.setIndex(-1, this.side);
      this.children.pop();
    }

    return found;
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
    const oppositeStreamlineNode = this.getOpposite();
    if (oppositeStreamlineNode) {
      const group = oppositeStreamlineNode.getAncestor(HIGHLIGHT_GROUP);
      if (group) {
        const module = group.parent;
        if (module && module.flow >= flowThreshold) {
          return -group.y;
        }
      }
    }
    return -Infinity;
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
