import AlluvialNodeBase from "./AlluvialNode";
import Branch from "./Branch";
import { HIGHLIGHT_GROUP, STREAMLINE_NODE } from "./Depth";
import type { Side } from "./Side";
import { LEFT, opposite, sideToString } from "./Side";
import StreamlineLink from "./StreamlineLink";
import type LeafNode from "./LeafNode";
import type HighlightGroup from "./HighlightGroup";

export default class StreamlineNode extends AlluvialNodeBase<LeafNode, Branch> {
  readonly depth = STREAMLINE_NODE;
  link: StreamlineLink | null = null;
  readonly side: Side;
  readonly sourceId: string;
  targetId: string | null;

  constructor(parent: Branch, id: string) {
    super(parent, parent.networkId, id);
    parent.addChild(this);
    this.side = parent.side;
    const [source, target] = id.split("--");
    this.sourceId = source;
    this.targetId = target;
  }

  get numLeafNodes(): number {
    return this.children.length;
  }

  get oppositeId() {
    return `${this.targetId || "NULL"}--${this.sourceId}`;
  }

  get oppositeStreamlinePosition() {
    const group = this.opposite?.getAncestor(
      HIGHLIGHT_GROUP
    ) as HighlightGroup | null;

    if (group) {
      const module = group.parent;
      if (module && module.isVisible) {
        return -group.y;
      }
    }

    return -Infinity;
  }

  get opposite(): StreamlineNode | null {
    if (this.link) {
      return this.link.left === this ? this.link.right : this.link.left;
    }
    return null;
  }

  static createId(
    source: LeafNode,
    side: Side,
    target: LeafNode | null = null
  ) {
    const sourceInsignificant = source.insignificant ? "i" : "";

    // prettier-ignore
    const sourceString = `${source.networkId}_module${source.moduleId}` +
      `_group${sourceInsignificant}${source.highlightIndex}_${sideToString(side)}`;

    if (!target) {
      return sourceString;
    }

    const targetInsignificant = target.insignificant ? "i" : "";

    // prettier-ignore
    const targetString = `${target.networkId}_module${target.moduleId}` +
      `_group${targetInsignificant}${target.highlightIndex}_${sideToString(opposite(side))}`;

    return `${sourceString}--${targetString}`;
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

  makeDangling() {
    this.targetId = null;

    return this;
  }

  linkTo(opposite: StreamlineNode) {
    const reverse = this.side === LEFT;
    this.link = opposite.link = new StreamlineLink(this, opposite, reverse);

    return this;
  }

  removeLink() {
    if (this.link) {
      this.link.remove();
    }

    return this;
  }
}
