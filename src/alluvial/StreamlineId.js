// @flow
import LeafNode from "./LeafNode";
import type { Side } from "./Side";
import { opposite, sideToString } from "./Side";
import StreamlineNode from "./StreamlineNode";


const typeSuffix = node => `${node.insignificant ? "i" : ""}${node.highlightIndex}`;

const createId = (node, side) =>
  `${node.networkId}_module${node.moduleId}_group${typeSuffix(node)}_${sideToString(side)}`;

type Id = string;

export default class StreamlineId {
  source: string;
  target: ?string = null;

  static streamlineNodesById: Map<Id, StreamlineNode> = new Map();

  static get(id: Id): ?StreamlineNode {
    return StreamlineId.streamlineNodesById.get(id);
  }

  static set(id: Id, streamlineNode: StreamlineNode): Map<Id, StreamlineNode> {
    return StreamlineId.streamlineNodesById.set(id, streamlineNode);
  }

  static has(id: Id): boolean {
    return StreamlineId.streamlineNodesById.has(id);
  }

  static delete(id: Id): boolean {
    return StreamlineId.streamlineNodesById.delete(id);
  }

  constructor(source: string, target: ?string = null) {
    this.source = source;
    this.target = target;
  }

  static fromId(id: Id): StreamlineId {
    const [source, target] = id.split("--");
    return new StreamlineId(source, target);
  }

  static createId(
    node: LeafNode,
    side: Side,
    oppositeNode: ?LeafNode = null
  ): Id {
    const source = createId(node, side);
    if (!oppositeNode) {
      return source;
    }
    const target = createId(oppositeNode, opposite(side));
    return `${source}--${target}`;
  }

  makeDangling(): string {
    this.target = null;
    return this.source;
  }

  static getOpposite(id: Id): ?StreamlineNode {
    const oppositeId = id.split("--").reverse().join("--");
    return StreamlineId.get(oppositeId);
  }

  toString(): string {
    return this.target ? `${this.source}--${this.target}` : this.source;
  }
}
