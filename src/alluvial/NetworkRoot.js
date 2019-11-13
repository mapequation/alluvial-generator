// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import AlluvialRoot from "./AlluvialRoot";
import { MODULE, NETWORK_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
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

  addChild(module: Module) {
    super.addChild(module);
    this.modulesById.set(module.moduleId, module);
  }

  removeChild(module: Module) {
    super.removeChild(module);
    this.modulesById.delete(module.moduleId);
  }

  getModule(moduleId: string): ?Module {
    return this.modulesById.get(moduleId);
  }

  createLeafNodeByNameMap(nodes: Iterable<LeafNode>) {
    this.nodesByIdentifier = new Map(
      Array.from(nodes, node => [node.identifier, node])
    );
  }

  getLeafNode(identifier: string): ?LeafNode {
    return this.nodesByIdentifier.get(identifier);
  }

  getModuleNames() {
    return Array.from(Module.customNames.entries())
      .filter(([key, val]) => key.startsWith(this.id));
  }

  asObject(): Object {
    return {
      id: this.id,
      networkId: this.networkId,
      codelength: this.codelength,
      flow: this.flow,
      depth: this.depth,
      ...this.layout,
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
        .reduce((filtered, child) => {
          if (child.flow >= this.flowThreshold)
            filtered.push(child.asObject());
          return filtered;
        }, [])
    };
  }

  * rightStreamlines(): Iterable<StreamlineLink> {
    for (let module of this) {
      // Skip if left module if below threshold
      if (module.flow < this.flowThreshold) continue;
      for (let group of module) {
        for (let streamlineNode of group.right) {
          // Skip if right module is below threshold
          const oppositeStreamlineNode: ?StreamlineNode = streamlineNode.getOpposite();
          if (!oppositeStreamlineNode) continue;
          const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(MODULE);
          if (oppositeModule && oppositeModule.flow < this.flowThreshold)
            continue;
          if (streamlineNode.link) yield streamlineNode.link;
        }
      }
    }
  }

  sortChildren(getModuleSize: any) {
    type TreeNode = {
      path: number,
      moduleSize: number,
      nodes: Array<any>
    };

    const createTreeNode = (path: number): TreeNode => ({
      path,
      moduleSize: 0,
      nodes: []
    });

    const tree = createTreeNode(0);

    this.children.forEach(module => {
      let parent = tree;

      for (let path of module.path) {
        let node = parent.nodes.find(node => node.path === path);

        if (!node) {
          node = createTreeNode(path);
          parent.nodes.push(node);
        }

        node.moduleSize += getModuleSize(module);
        parent = node;
      }

      parent.nodes.push(module);
    });

    const sortDepthFirst = (node: TreeNode) => {
      if (!node.nodes) return;
      node.nodes.sort((a, b) => b.moduleSize - a.moduleSize);
      node.nodes.forEach(node => sortDepthFirst(node));
    };

    sortDepthFirst(tree);

    function flatten(arr: TreeNode) {
      return arr.nodes.reduce(function(flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten.nodes) ? flatten(toFlatten) : toFlatten);
      }, []);
    }

    this.children = flatten(tree);
  }
}
