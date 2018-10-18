import LeafNode from "./LeafNode";
import type { Side } from "./Branch";
import { opposite, sideToString } from "./Branch";

export default class StreamlineId {
  source: string;
  target: ?string = null;

  constructor(source: string, target: ?string = null) {
    this.source = source;
    this.target = target;
  }

  static fromString(linkId): StreamlineId {
    const [source, target] = linkId.split("--");
    return new StreamlineId(source, target);
  }

  static create(
    node: LeafNode,
    networkIndex: number,
    side: Side,
    oppositeNode: ?LeafNode = null
  ): StreamlineId {
    const moduleId = node => node.ancestorAtCurrentLevel;

    const typeSuffix = node =>
      `${node.insignificant ? "i" : ""}${node.highlightIndex}`;

    const createId = (networkIndex, node, side) =>
      `${networkIndex}_module${moduleId(node)}_group${typeSuffix(node)}_${
        sideToString[side]
      }`;

    const source = createId(networkIndex, node, side);

    const target = oppositeNode
      ? createId(networkIndex + side, oppositeNode, opposite(side))
      : null;

    return new StreamlineId(source, target);
  }

  getDangling(): StreamlineId {
    return new StreamlineId(this.source, null);
  }

  static oppositeId(id): string {
    return id
      .split("--")
      .reverse()
      .join("--");
  }

  toString(): string {
    return this.target ? `${this.source}--${this.target}` : this.source;
  }
}
