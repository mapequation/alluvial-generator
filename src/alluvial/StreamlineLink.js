// @flow
import StreamlineNode from "./StreamlineNode";
import HighlightGroup from "./HighlightGroup";


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
      left: { id, layout: leftLayout, parent: leftBranch },
      right: { layout: rightLayout, parent: rightBranch }
    } = this;

    const x0 = leftLayout.x + leftLayout.width;
    const x1 = rightLayout.x;
    const y0 = leftLayout.y;
    const y1 = rightLayout.y;
    const h0 = leftLayout.height;
    const h1 = rightLayout.height;
    const xAvg = (x0 + x1) / 2;
    const yAvg = (y0 + y1) / 2;

    const leftGroup: ?HighlightGroup = leftBranch ? leftBranch.parent : null;
    const rightGroup: ?HighlightGroup = rightBranch ? rightBranch.parent : null;
    const leftHighlightIndex = leftGroup ? leftGroup.highlightIndex : -1;
    const rightHighlightIndex = rightGroup ? rightGroup.highlightIndex : -1;

    return {
      id,
      avgHeight: (h0 + h1) / 2,
      path: {
        x0,
        x1,
        y0,
        y1,
        h0,
        h1
      },
      transitionPath: {
        x0: xAvg,
        x1: xAvg,
        y0: yAvg + h0 / 4,
        y1: yAvg + h1 / 4,
        h0: h0 / 2,
        h1: h1 / 2
      },
      networkTransitionPath: {
        x0,
        x1,
        y0: 0,
        y1: 0,
        h0: 0,
        h1: 0
      },
      leftHighlightIndex,
      rightHighlightIndex
    };
  }
}
