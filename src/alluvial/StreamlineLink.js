// @flow
import StreamlineNode from "./StreamlineNode";

export default class StreamlineLink {
  left: StreamlineNode;
  right: StreamlineNode;

  constructor(
    left: StreamlineNode,
    right: StreamlineNode,
    reverse: boolean = false
  ) {
    this.left = reverse ? right : left;
    this.right = reverse ? left : right;
    left.link = this;
    right.link = this;
  }

  static create(
    left: StreamlineNode,
    right: StreamlineNode,
    reverse: boolean = false
  ) {
    return new StreamlineLink(left, right, reverse);
  }

  remove() {
    this.left.link = null;
    this.right.link = null;
  }

  asObject() {
    const {
      left: { layout: leftLayout },
      right: { layout: rightLayout }
    } = this;

    return {
      x0: leftLayout.x + leftLayout.width,
      x1: rightLayout.x,
      y0: leftLayout.y,
      y1: rightLayout.y,
      h0: leftLayout.height,
      h1: rightLayout.height,
      leftId: this.left.id,
      rightId: this.right.id
    };
  }
}
