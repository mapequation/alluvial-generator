// @flow
import type { Side } from "./Branch";
import { opposite, sideToString } from "./Branch";
import LeafNode from "./LeafNode";


export default class StreamlineId {
  source: string;
  target: ?string = null;

  constructor(source: string, target: ?string = null) {
    this.source = source;
    this.target = target;

    if (!this.isValid()) {
      const andTarget = target ? ` and target ${target}` : "";
      throw new Error(`Invalid streamline id with source ${source}${andTarget}.`);
    }
  }

  static fromString(id: string): StreamlineId {
    const [source, target] = id.split("--");
    return new StreamlineId(source, target);
  }

  static validId(id: string): boolean {
    const validStreamlineId = /^_.+_module(\d+:)*\d+_group(i)?-?\d+/;
    return validStreamlineId.test(id);
  }

  isValid() {
    const { source, target } = this;
    return StreamlineId.validId(source) && (target ? StreamlineId.validId(target) : true);
  }

  static createId(
    node: LeafNode,
    side: Side,
    oppositeNode: ?LeafNode = null,
  ): [string, ?string] {
    const typeSuffix = node => `${node.insignificant ? "i" : ""}${node.highlightIndex}`;

    const createId = (node, side) =>
      `${node.networkId}_module${node.getAncestorAtCurrentLevel()}_group${typeSuffix(node)}_${sideToString[side]}`;

    const source = createId(node, side);

    const target = oppositeNode ? createId(oppositeNode, opposite(side)) : null;

    return [source, target];
  }

  static create(
    node: LeafNode,
    side: Side,
    oppositeNode: ?LeafNode = null,
  ): string {
    const [source, target] = StreamlineId.createId(node, side, oppositeNode);
    return target ? `${source}--${target}` : source;
  }

  getDangling(): StreamlineId {
    return new StreamlineId(this.source, null);
  }

  static oppositeId(id: string): string {
    return id
      .split("--")
      .reverse()
      .join("--");
  }

  toString(): string {
    return this.target ? `${this.source}--${this.target}` : this.source;
  }
}
