// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import AlluvialRoot from "./AlluvialRoot";
import { NETWORK_ROOT, MODULE } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";
import TreePath from "../lib/treepath";

export default class NetworkRoot extends AlluvialNodeBase {
  children: Module[] = [];
  flowThreshold: number = 8e-3;
  name: string;

  constructor(networkId: string, parent: AlluvialRoot, name: string) {
    super(networkId, parent, networkId);
    this.name = name;
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

  getSiblings(moduleId: string): Module[] {
    const moduleLevel = TreePath.level(moduleId) - 1;
    if (moduleLevel < 1) return this.children;
    const parentPath = TreePath.ancestorAtLevel(moduleId, moduleLevel);
    return this.children.filter(module =>
      parentPath.isAncestor(module.moduleId)
    );
  }

  get depth(): number {
    return NETWORK_ROOT;
  }

  asObject(): Object {
    return {
      ...super.asObject(),
      name: this.name,
      networkName: {
        x: this.x,
        y: this.height + 5,
        width: this.width,
        height: 15,
        textGap: Math.min(100, this.width - 30),
        textX: this.x + this.width / 2,
        textY: this.height + 15 + 5
      },
      links: Array.from(this.rightStreamlines())
        .map(link => link.asObject())
        .filter(link => link.avgHeight > 1)
        .sort((a, b) => b.avgHeight - a.avgHeight),
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
          const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(MODULE);
          if (oppositeModule && oppositeModule.flow < this.flowThreshold)
            continue;
          if (streamlineNode.link) yield streamlineNode.link;
        }
      }
    }
  }

  sortChildren() {
    function flatten(arr) {
      return arr.nodes.reduce(function(flat, toFlatten) {
        return flat.concat(
          Array.isArray(toFlatten.nodes) ? flatten(toFlatten) : toFlatten
        );
      }, []);
    }

    const tree = {
      path: "",
      flow: 0,
      nodes: []
    };

    this.children.forEach(module => {
      let parent = tree;

      for (let path of module.path) {
        let node = parent.nodes.find(node => node.path === path);

        if (!node) {
          node = {
            path,
            flow: 0,
            nodes: []
          };

          parent.nodes.push(node);
        }

        node.flow += module.flow;
        parent = node;
      }

      parent.nodes.push(module);
    });

    const sortDepthFirst = node => {
      if (!node.nodes) return;
      node.nodes.sort((a, b) => b.flow - a.flow);
      node.nodes.forEach(node => sortDepthFirst(node));
    };

    sortDepthFirst(tree);

    this.children = flatten(tree);
  }
}
