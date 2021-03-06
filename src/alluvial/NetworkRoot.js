// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import AlluvialRoot from "./AlluvialRoot";
import { MODULE, NETWORK_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import type { Side } from "./Side";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";


export default class NetworkRoot extends AlluvialNodeBase {
  parent: ?AlluvialRoot;
  children: Module[] = [];
  flowThreshold: number = 0;
  name: string;
  depth = NETWORK_ROOT;
  codelength: number;
  nodesByIdentifier: Map<string, LeafNode> = new Map();
  modulesById: Map<string, Module> = new Map();

  constructor(
    parent: AlluvialRoot,
    networkId: string,
    name: string,
    codelength: number
  ) {
    super(parent, networkId, networkId);
    parent.addChild(this);
    this.name = name;
    this.codelength = codelength;
  }

  addNodes(nodes: Node[]) {
    const leafNodes = nodes.map(node => new LeafNode(node, this));
    this.nodesByIdentifier = new Map(Array.from(leafNodes, node => [node.identifier, node]));
    leafNodes.forEach(node => node.add());
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

  getModule(moduleId: string): ?Module {
    return this.modulesById.get(moduleId);
  }

  getNeighbor(side: Side): ?NetworkRoot {
    const alluvialRoot = this.parent;
    if (alluvialRoot) {
      const networkIndex = alluvialRoot.children.findIndex(networkRoot => networkRoot.networkId === this.networkId);
      const neighborNetworkIndex = networkIndex + side;
      if (networkIndex > -1 && neighborNetworkIndex > -1 && neighborNetworkIndex < alluvialRoot.children.length) {
        return alluvialRoot.children[neighborNetworkIndex];
      }
    }
  }

  getLeafNode(identifier: string): ?LeafNode {
    return this.nodesByIdentifier.get(identifier);
  }

  getModuleNames(): Array<any> {
    return Array.from(Module.customNames.entries())
      .filter(([key, val]) => key.startsWith(this.id));
  }

  setVisibleModules(moduleIds: string[]) {
    const filterActive = this.children.some(module => moduleIds.includes(module.moduleId));

    this.children.forEach(module => {
      module.filterActive = filterActive;
      module.visibleInFilter = moduleIds.includes(module.moduleId);
    });
  }

  clearFilter() {
    this.children.forEach(module => {
      module.filterActive = false;
      module.visibleInFilter = false;
    });
  }

  asObject(): Object {
    return {
      ...this.layout,
      id: this.id,
      networkId: this.networkId,
      codelength: this.codelength,
      flow: this.flow,
      depth: this.depth,
      networkName: {
        name: this.name,
        x: this.x,
        y: this.height + 5,
        width: this.width,
        height: 15,
        textX: this.x + this.width / 2,
        textY: this.height + 15 + 5
      },
      links: Array.from(this.rightStreamlines(), link => link.asObject())
        .sort((a, b) => b.avgHeight - a.avgHeight),
      children: this.children
        .reduce((modules, module) => {
          if (module.isVisible && module.flow >= this.flowThreshold)
            modules.push(module.asObject());
          return modules;
        }, [])
    };
  }

  * rightStreamlines(): Iterable<StreamlineLink> {
    for (let module of this) {
      // Skip if left module if below threshold
      if (module.flow < this.flowThreshold || !module.isVisible) {
        continue;
      }

      for (let group of module) {
        for (let streamlineNode of group.right) {
          const oppositeStreamlineNode: ?StreamlineNode = streamlineNode.getOpposite();
          if (!oppositeStreamlineNode) continue;
          const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(MODULE);

          if (oppositeModule) {
            // Skip if right module is below threshold
            if (oppositeModule.flow < this.flowThreshold || !oppositeModule.isVisible)
              continue;
          }

          if (streamlineNode.link) yield streamlineNode.link;
        }
      }
    }
  }
}
