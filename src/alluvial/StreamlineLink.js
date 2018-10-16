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

  static linkNodes(
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

    const x0 = leftLayout.x + leftLayout.width;
    const x1 = rightLayout.x;
    const y0 = leftLayout.y;
    const y1 = rightLayout.y;
    const h0 = leftLayout.height;
    const h1 = rightLayout.height;

    return {
      x0,
      x1,
      y0,
      y1,
      h0,
      h1,
      transitionPath: {
        x0: (x0 + x1) / 2,
        x1: (x0 + x1) / 2,
        y0: (y0 + y1) / 2,
        y1: (y0 + y1) / 2,
        h0,
        h1
      },
      leftId: this.left.id,
      rightId: this.right.id
    };
  }
}
