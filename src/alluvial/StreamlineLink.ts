import type StreamlineNode from "./StreamlineNode";

type Layout = {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  h0: number;
  h1: number;
};

export default class StreamlineLink {
  constructor(
    public readonly left: StreamlineNode,
    public readonly right: StreamlineNode,
    reverse: boolean = false
  ) {
    this.left = reverse ? right : left;
    this.right = reverse ? left : right;
  }

  get id() {
    return this.left?.currentId ?? "";
  }

  get leftHighlightIndex() {
    return this.left?.parent?.parent?.highlightIndex ?? -1;
  }

  get rightHighlightIndex() {
    return this.right?.parent?.parent?.highlightIndex ?? -1;
  }

  get leftInsignificant() {
    return this.left?.parent?.parent?.insignificant ?? false;
  }

  get rightInsignificant() {
    return this.right?.parent?.parent?.insignificant ?? false;
  }

  get highlightIndex() {
    return Math.max(this.leftHighlightIndex, this.rightHighlightIndex);
  }

  get x0() {
    return this.left?.x + this.left?.width ?? 0;
  }

  get x1() {
    return this.right?.x ?? 0;
  }

  get y0() {
    return this.left?.y ?? 0;
  }

  get y1() {
    return this.right?.y ?? 0;
  }

  get h0() {
    return this.left?.height;
  }

  get h1() {
    return this.right?.height;
  }

  get xMid() {
    return (this.x0 + this.x1) / 2;
  }

  get yMid() {
    return (this.y0 + this.y1) / 2;
  }

  get avgHeight() {
    return (this.h0 + this.h1) / 2;
  }

  get path() {
    return this._path();
  }

  get transitionPath() {
    const { x0, x1, y0, y1, h0, h1 } = this;

    const xMid = (x0 + x1) / 2;
    const yMid = (y0 + y1) / 2;

    return this._path({
      x0: xMid,
      x1: xMid,
      y0: yMid + h0 / 4,
      y1: yMid + h1 / 4,
      h0: h0 / 2,
      h1: h1 / 2,
    });
  }

  remove() {
    this.left.link = null;
    this.right.link = null;
  }

  /*
                    (cpx, y1) ________ (x1, y1)
                    ________/        |
   (x0, y0) ______/                  |
           |                         | h1
           |                         |
        h0 |                  _______|
           |        ________/         (x1, y1 + h1)
           |______/
   (x0, y0 + h0)    (cpx, y0 + h0)
   */
  private _path({ x0, x1, y0, y1, h0, h1 }: Layout = this) {
    const threshold = 1e-6;
    y0 = y0 < threshold ? 0 : y0;
    y1 = y1 < threshold ? 0 : y1;

    const y2 = y0 + h0;
    const y3 = y1 + h1;
    const cpx = (x0 + x1) / 2;

    // prettier-ignore
    return (
      "M" + x0 + "," + y2 +
      "C" + cpx + "," + y2 + "," + cpx + "," + y3 + "," + x1 + "," + y3 +
      "L" + x1 + "," + y1 +
      "C" + cpx + "," + y1 + "," + cpx + "," + y0 + "," + x0 + "," + y0 +
      "Z"
    );
  }
}
