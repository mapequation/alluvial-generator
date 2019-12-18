// @flow
import LeafNode from "./LeafNode";
import type { Side } from "./Side";
import { opposite, sideToString } from "./Side";
import StreamlineNode from "./StreamlineNode";


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

  static createId(source: LeafNode, side: Side, target: ?LeafNode = null): Id {
    if (!target) {
      return `${
        source.networkId}_module${source.moduleId}_group${
        source.insignificant ? "i" : ""}${source.highlightIndex}_${sideToString(side)
      }`;
    }
    return `${
      source.networkId}_module${source.moduleId}_group${
      source.insignificant ? "i" : ""}${source.highlightIndex}_${sideToString(side)}--${
      target.networkId}_module${target.moduleId}_group${
      target.insignificant ? "i" : ""}${target.highlightIndex}_${sideToString(opposite(side))
    }`;
  }

  makeDangling(): string {
    this.target = null;
    return this.source;
  }

  static oppositeId(id: Id): Id {
    return id.split("--").reverse().join("--");
  }

  toString(): string {
    return this.target ? `${this.source}--${this.target}` : this.source;
  }
}
