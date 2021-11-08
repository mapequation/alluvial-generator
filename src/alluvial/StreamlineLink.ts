import type StreamlineNode from "./StreamlineNode";

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
  }

  remove() {
    this.left.link = null;
    this.right.link = null;
  }

  asObject() {
    const {
      left: {
        layout: leftLayout,
        parent: leftBranch,
        networkId: leftNetworkId,
        id,
        sourceId,
        targetId,
        depth,
      },
      right: {
        layout: rightLayout,
        parent: rightBranch,
        networkId: rightNetworkId,
      },
    } = this;

    const x0 = leftLayout.x + leftLayout.width;
    const x1 = rightLayout.x;
    const y0 = leftLayout.y;
    const y1 = rightLayout.y;
    const h0 = leftLayout.height;
    const h1 = rightLayout.height;
    const xMid = (x0 + x1) / 2;
    const yMid = (y0 + y1) / 2;

    const leftGroup = leftBranch ? leftBranch.parent : null;
    const rightGroup = rightBranch ? rightBranch.parent : null;
    const leftHighlightIndex = leftGroup?.highlightIndex ?? -1;
    const rightHighlightIndex = rightGroup?.highlightIndex ?? -1;

    return {
      id,
      sourceId: sourceId.replace("_right", ""),
      targetId: targetId ? targetId.replace("_left", "") : "",
      leftNetworkId,
      rightNetworkId,
      leftModuleId: leftGroup?.parent?.moduleId ?? 0,
      rightModuleId: rightGroup?.parent?.moduleId ?? 0,
      depth,
      avgHeight: (h0 + h1) / 2,
      path: {
        x0,
        x1,
        y0,
        y1,
        h0,
        h1,
      },
      transitionPath: {
        x0: xMid,
        x1: xMid,
        y0: yMid + h0 / 4,
        y1: yMid + h1 / 4,
        h0: h0 / 2,
        h1: h1 / 2,
      },
      leftHighlightIndex,
      rightHighlightIndex,
      highlightIndex: Math.max(leftHighlightIndex, rightHighlightIndex),
      leftInsignificant: leftGroup?.insignificant ?? false,
      rightInsignificant: rightGroup?.insignificant ?? false,
    };
  }
}
