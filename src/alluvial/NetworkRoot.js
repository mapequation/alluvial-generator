// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import AlluvialRoot from "./AlluvialRoot";
import { NETWORK_ROOT } from "./depth-constants";
import LeafNode from "./LeafNode";
import Module from "./Module";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";

export default class NetworkRoot extends AlluvialNodeBase {
  children: Module[] = [];
  flowThreshold: number = 1e-5;

  constructor(networkId: string, parent: AlluvialRoot) {
    super(networkId, parent, networkId);
  }

  getModule(moduleId: string): ?Module {
    return this.children.find(module => module.moduleId === moduleId);
  }

  getOrCreateModule(node: LeafNode, moduleLevel: number): Module {
    const moduleId = node.ancestorAtLevel(moduleLevel);
    let module = this.getModule(moduleId);
    if (!module) {
      module = new Module(this.networkId, this, moduleId, moduleLevel);
      this.children.push(module);
    }
    return module;
  }

  get depth(): number {
    return NETWORK_ROOT;
  }

  asObject(): Object {
    return {
      ...super.asObject(),
      links: Array.from(this.rightStreamlines()).map(link => link.asObject()),
      children: this.children
        .filter(child => child.flow >= this.flowThreshold)
        .map(child => child.asObject())
    };
  }

  *rightStreamlines(): Iterable<StreamlineLink> {
    for (let module of this.children) {
      // Skip if left module if below threshold
      if (module.flow < this.flowThreshold) continue;
      for (let group of module.children) {
        for (let streamlineNode of group.right.children) {
          // Skip if right module is below threshold
          const oppositeStreamlineNode: ?StreamlineNode = streamlineNode.getOppositeStreamlineNode();
          if (!oppositeStreamlineNode) continue;
          const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(3);
          if (oppositeModule && oppositeModule.flow < this.flowThreshold)
            continue;
          if (streamlineNode.link) yield streamlineNode.link;
        }
      }
    }
  }

  sortChildren() {
    this.children.sort((a: Module, b: Module) => {
      let aSize = Math.max(1, a.path.length - 1);
      let bSize = Math.max(1, b.path.length - 1);
      let minSize = Math.min(aSize, bSize);
      for (let i = 0; i < minSize; ++i) {
        if (a.path[i] === b.path[i]) continue;
        return a.path[i] - b.path[i];
      }
      const byFlow = b.flow - a.flow;
      if (byFlow < 1e-16 && a.moduleLevel === b.moduleLevel) {
        return a.rank - b.rank;
      }
      return byFlow;
    });
  }
}
