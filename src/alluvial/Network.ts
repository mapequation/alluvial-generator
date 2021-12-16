import AlluvialNodeBase from "./AlluvialNode";
import Root from "./Root";
import { MODULE, NETWORK } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import type { Side } from "./Side";

export default class Network extends AlluvialNodeBase<Module, Root> {
  flowThreshold: number = 0;
  name: string;
  depth = NETWORK;
  codelength: number;
  nodesByIdentifier: Map<string, LeafNode> = new Map();
  modulesById: Map<string, Module> = new Map();

  constructor(
    parent: Root,
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
    return this.children.filter((module) => module.flow >= this.flowThreshold);
  }

  static create(
    parent: Root,
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
    const alluvialRoot = this.parent;

    if (alluvialRoot) {
      const networkIndex = alluvialRoot.children.findIndex(
        (networkRoot) => networkRoot.networkId === this.networkId
      );

      const neighborNetworkIndex = networkIndex + side;

      if (
        networkIndex > -1 &&
        neighborNetworkIndex > -1 &&
        neighborNetworkIndex < alluvialRoot.children.length
      ) {
        return alluvialRoot.children[neighborNetworkIndex];
      }
    }

    return null;
  }

  getLeafNode(identifier: string): LeafNode | null {
    return this.nodesByIdentifier.get(identifier) ?? null;
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

  *rightStreamlines() {
    for (let module of this) {
      // Skip if left module if below threshold
      if (module.flow < this.flowThreshold) {
        continue;
      }

      for (let group of module) {
        for (let streamlineNode of group.right) {
          const oppositeStreamlineNode = streamlineNode.getOpposite();
          if (!oppositeStreamlineNode) continue;
          const oppositeModule = oppositeStreamlineNode.getAncestor(
            MODULE
          ) as Module | null;

          if (oppositeModule) {
            // Skip if right module is below threshold
            if (oppositeModule.flow < this.flowThreshold) continue;
          }

          if (streamlineNode.link) yield streamlineNode.link;
        }
      }
    }
  }
}
