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

    const rewire = (network: Network, reverse = true) => {
      for (const module of network) {
        for (const group of module) {
          for (const branch of group) {
            const { side } = branch;
            const oppositeSide = opposite(side);

            for (const streamlineNode of branch) {
              if (reverse && streamlineNode.link) {
                streamlineNode.link.reverse();
              }

              streamlineNode.side = oppositeSide;
              network.removeStreamlineNode(streamlineNode.id);

              streamlineNode.sourceId = streamlineNode.sourceId.replace(
                sideToString(side),
                sideToString(oppositeSide)
              );

              if (streamlineNode.targetId) {
                streamlineNode.targetId = streamlineNode.targetId.replace(
                  sideToString(oppositeSide),
                  sideToString(side)
                );
              }

              streamlineNode.id = streamlineNode.targetId
                ? `${streamlineNode.sourceId}--${streamlineNode.targetId}`
                : streamlineNode.sourceId;
              network.setStreamlineNode(streamlineNode.id, streamlineNode);

              for (const node of streamlineNode) {
                const leftOpposite = node.getOpposite(LEFT);
                const rightOpposite = node.getOpposite(RIGHT);
                node.setOpposite(leftOpposite, RIGHT);
                node.setOpposite(rightOpposite, LEFT);
                const leftParent = node.getParent(LEFT);
                const rightParent = node.getParent(RIGHT);
                node.setParent(leftParent, RIGHT);
                node.setParent(rightParent, LEFT);
              }
            }
          }

          const [left, right] = group.children;
          left.side = RIGHT;
          right.side = LEFT;
          group.children.reverse();
        }
      }
    };

    rewire(this);
    rewire(neighbor, false);

    this.parent.children.splice(index, 1);
    this.parent.children.splice(index + 1, 0, this);
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
