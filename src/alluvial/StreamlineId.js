// @flow
import type { Side } from "./Side";
import { opposite, sideToString } from "./Side";
import LeafNode from "./LeafNode";
import StreamlineNode from "./StreamlineNode";


export default class StreamlineId {
  source: string;
  target: ?string = null;

  static streamlineNodesById: Map<string, StreamlineNode> = new Map();

  static get(id: string): ?StreamlineNode {
    return StreamlineId.streamlineNodesById.get(id);
  }

  static set(id: string, streamlineNode: StreamlineNode): Map<string, StreamlineNode> {
    return StreamlineId.streamlineNodesById.set(id, streamlineNode);
  }

  static has(id: string): boolean {
    return StreamlineId.streamlineNodesById.has(id);
  }

  static delete(id: string): boolean {
    return StreamlineId.streamlineNodesById.delete(id);
  }

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
      `${node.networkId}_module${node.moduleId}_group${typeSuffix(node)}_${sideToString(side)}`;

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
