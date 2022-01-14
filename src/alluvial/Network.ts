import AlluvialNodeBase from "./AlluvialNode";
import Diagram from "./Diagram";
import { NETWORK } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import type { Side } from "./Side";
import { moveItem } from "../utils/array";

export default class Network extends AlluvialNodeBase<Module, Diagram> {
  readonly depth = NETWORK;
  flowThreshold: number = 0;
  name: string;
  isCustomSorted = false;
  readonly codelength: number;
  private nodesByIdentifier: Map<string, LeafNode> = new Map();
  private readonly modulesById: Map<string, Module> = new Map();

  constructor(
    parent: Diagram,
    networkId: string,
    name: string,
    codelength: number
  ) {
    super(parent, networkId, networkId);
    parent.addChild(this);
    this.name = name;
    this.codelength = codelength;
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
    codelength: number
  ) {
    return new Network(parent, networkId, name, codelength);
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

  moveToIndex(fromIndex: number, toIndex: number) {
    moveItem(this.children, fromIndex, toIndex);
  }

  getModuleNames(): any[] {
    // FIXME
    return Array.from(Module.customNames.entries()).filter(([key, _]) =>
      key.startsWith(this.id)
    );
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
