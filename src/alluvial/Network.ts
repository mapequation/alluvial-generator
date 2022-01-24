import AlluvialNodeBase from "./AlluvialNode";
import Diagram from "./Diagram";
import { NETWORK } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import type { Side } from "./Side";
import { LEFT, opposite, RIGHT, sideToString } from "./Side";
import { moveItem } from "../utils/array";
import StreamlineNode from "./StreamlineNode";

export default class Network extends AlluvialNodeBase<Module, Diagram> {
  readonly depth = NETWORK;
  flowThreshold: number = 0;
  name: string;
  isCustomSorted = false;
  readonly layerId: number | undefined;
  readonly codelength: number;
  private nodesByIdentifier: Map<string, LeafNode> = new Map();
  private readonly modulesById: Map<string, Module> = new Map();
  private streamlineNodesById: Map<string, StreamlineNode> = new Map();

  constructor(
    parent: Diagram,
    networkId: string,
    name: string,
    codelength: number,
    layerId?: number
  ) {
    super(parent, networkId, networkId);
    parent.addChild(this);
    this.name = name;
    this.codelength = codelength;
    this.layerId = layerId;
  }

  get namePosition() {
    return {
      x: this.x + this.width / 2,
      y: this.height + 15 + 5,
    };
  }

  get visibleChildren() {
    return this.children.filter((module) => module.isVisible);
  }

  static create(
    parent: Diagram,
    networkId: string,
    name: string,
    codelength: number,
    layerId?: number
  ) {
    return new Network(parent, networkId, name, codelength, layerId);
  }

  addNodes(nodes: Node[]) {
    this.nodesByIdentifier = new Map();

    const leafNodes = nodes.map((node) => {
      const leafNode = new LeafNode(node, this);
      this.nodesByIdentifier.set(leafNode.identifier, leafNode);
      return leafNode;
    });

    leafNodes.forEach((node) => node.add());
  }

  addChild(module: Module) {
    const length = super.addChild(module);
    this.modulesById.set(module.moduleId, module);
    return length;
  }

  removeChild(module: Module) {
    const found = super.removeChild(module);
    this.modulesById.delete(module.moduleId);
    return found;
  }

  getModule(moduleId: string): Module | null {
    return this.modulesById.get(moduleId) ?? null;
  }

  getNeighbor(side: Side): Network | null {
    const root = this.parent;

    if (root) {
      const networkIndex = root.children.findIndex(
        (network) => network.networkId === this.networkId
      );

      const neighborNetworkIndex = networkIndex + side;

      if (
        networkIndex > -1 &&
        neighborNetworkIndex > -1 &&
        neighborNetworkIndex < root.children.length
      ) {
        return root.children[neighborNetworkIndex];
      }
    }

    return null;
  }

  getLeafNode(identifier: string): LeafNode | null {
    return this.nodesByIdentifier.get(identifier) ?? null;
  }

  getStreamlineNode(id: string) {
    return this.streamlineNodesById.get(id);
  }

  setStreamlineNode(id: string, node: StreamlineNode) {
    this.streamlineNodesById.set(id, node);
  }

  removeStreamlineNode(id: string) {
    this.streamlineNodesById.delete(id);
  }

  moveToIndex(fromIndex: number, toIndex: number) {
    moveItem(this.children, fromIndex, toIndex);
  }

  moveTo(direction: Side) {
    const index = this.parent.children.indexOf(this);
    const newIndex = index + direction;

    if (newIndex < 0 || newIndex > this.parent.children.length - 1) {
      console.warn("Cannot move network further");
      return;
    }

    // Moving a network to the left is equivalent to moving
    // the network to the left of this network to the right.
    if (direction === LEFT) {
      this.getNeighbor(LEFT)?.moveTo(RIGHT);
      return;
    }

    // Only implement moving to the right.
    // We know that there is a neighbor to the right.
    const neighbor = this.getNeighbor(RIGHT)!;

    // Reverse the "inner" branch of the network.
    // This network's right branch,
    // and the neighbor's left branch.
    const rewire = (network: Network, side: Side, reverse = true) => {
      for (const module of network) {
        for (const group of module) {
          const branch = side === LEFT ? group.left : group.right;

          const oppositeSide = opposite(side);

          for (const streamlineNode of branch) {
            if (reverse && streamlineNode.link) {
              // Only do this once per streamline link.
              streamlineNode.link.reverse();
            }

            network.removeStreamlineNode(streamlineNode.id);

            // Reverse the side and ids.
            streamlineNode.side = oppositeSide;

            const sideString = sideToString(side);
            const oppositeSideString = sideToString(oppositeSide);

            streamlineNode.sourceId.replace(sideString, oppositeSideString);

            if (streamlineNode.targetId) {
              streamlineNode.targetId.replace(oppositeSideString, sideString);
            }

            streamlineNode.id = streamlineNode.targetId
              ? `${streamlineNode.sourceId}--${streamlineNode.targetId}`
              : streamlineNode.sourceId;

            network.setStreamlineNode(streamlineNode.id, streamlineNode);

            // Set (and unset) opposite nodes and parents.
            for (const node of streamlineNode) {
              const oppositeNode = node.getOpposite(side);
              node.setOpposite(oppositeNode, oppositeSide);
              node.setOpposite(null, side);

              const sideParent = node.getParent(side);
              const oppositeParent = node.getParent(oppositeSide);
              node.setParent(sideParent, oppositeSide);
              node.setParent(oppositeParent, side);
            }
          }

          const [left, right] = group.children;
          left.side = RIGHT;
          right.side = LEFT;
          group.children.reverse();
        }
      }
    };

    rewire(this, RIGHT);
    rewire(neighbor, LEFT, false);

    this.parent.children.splice(index, 1);
    this.parent.children.splice(index + 1, 0, this);

    const leftAdjacent = this.getNeighbor(LEFT);
    const rightAdjacent = neighbor.getNeighbor(RIGHT);
  }

  getLinks(streamlineThreshold: number = 0) {
    return Array.from(this.rightStreamlines())
      .filter((link) => link.avgHeight > streamlineThreshold)
      .sort((a, b) =>
        a.highlightIndex !== b.highlightIndex
          ? a.highlightIndex - b.highlightIndex
          : b.avgHeight - a.avgHeight
      );
  }

  private *rightStreamlines() {
    for (let module of this) {
      // Skip if left module is below threshold
      if (!module.isVisible) {
        continue;
      }

      yield* module.rightStreamlines();
    }
  }
}
