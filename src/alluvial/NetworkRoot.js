// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import AlluvialRoot from "./AlluvialRoot";
import { MODULE, NETWORK_ROOT } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import StreamlineLink from "./StreamlineLink";
import StreamlineNode from "./StreamlineNode";


export default class NetworkRoot extends AlluvialNodeBase {
  children: Module[] = [];
  flowThreshold: number = 0;
  name: string;
  depth = NETWORK_ROOT;
  codelength: number;
  nodesByName: Map<string, LeafNode> = new Map();

  constructor(networkId: string, parent: AlluvialRoot, name: string, codelength: number) {
    super(networkId, parent, networkId);
    this.name = name;
    this.codelength = codelength;
  }

  getModule(moduleId: string): ?Module {
    return this.children.find(module => module.moduleId === moduleId);
  }

  getOrCreateModule(moduleId: string, moduleLevel: number): Module {
    let module = this.getModule(moduleId);
    if (!module) {
      module = new Module(this.networkId, this, moduleId, moduleLevel);
      this.children.push(module);
    }
    return module;
  }

  createLeafNodeToNameMap(nodes: Iterable<LeafNode>) {
    this.nodesByName = new Map(
      Array.from(nodes).map(node => [node.name, node])
    );
  }

  getLeafNodeByName(name: string): ?LeafNode {
    return this.nodesByName.get(name);
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
        textY: this.height + 15 + 5,
      },
      links: Array.from(this.rightStreamlines())
        .map(link => link.asObject())
        .sort((a, b) => b.avgHeight - a.avgHeight),
      children: this.children
        .filter(child => child.flow >= this.flowThreshold)
        .map(child => child.asObject()),
    };
  }

  * rightStreamlines(): Iterable<StreamlineLink> {
    for (let module of this) {
      // Skip if left module if below threshold
      if (module.flow < this.flowThreshold) continue;
      for (let group of module) {
        for (let streamlineNode of group.right) {
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

  sortByFewestStreamlineCrossings() {
    const oppositePositions: Map<string, number> = new Map();

    for (let module of this) {
      let oppositeModulePosition = 0;
      // Skip if module if below threshold
      if (module.flow < this.flowThreshold) continue;
      for (let group of module) {
        for (let streamlineNode of group.left) {
          // Skip if opposite module is below threshold
          const oppositeStreamlineNode: ?StreamlineNode = streamlineNode.getOppositeStreamlineNode();
          if (!oppositeStreamlineNode) continue;
          const oppositeModule: ?Module = oppositeStreamlineNode.getAncestor(MODULE);
          if (oppositeModule && oppositeModule.flow < this.flowThreshold)
            continue;
          if (!oppositeModule)
            continue;
          const weight = 0.5 * (streamlineNode.flow + oppositeStreamlineNode.flow) / module.flow;
          oppositeModulePosition += oppositeModule.y * weight;
        }
      }
      oppositePositions.set(module.moduleId, oppositeModulePosition);
    }
    this.children.sort((a, b) => {
      const bOppositePosition = oppositePositions.get(b.moduleId) || 0;
      const aOppositePosition = oppositePositions.get(a.moduleId) || 0;
      return bOppositePosition - aOppositePosition;
    });
  }

  sortChildren() {
    type TreeNode = {
      path: number,
      flow: number,
      nodes: Array<any>
    };

    function flatten(arr: TreeNode) {
      return arr.nodes.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten.nodes) ? flatten(toFlatten) : toFlatten);
      }, []);
    }

    const tree: TreeNode = {
      path: 0,
      flow: 0,
      nodes: [],
    };

    this.children.forEach(module => {
      let parent = tree;

      for (let path of module.path) {
        let node = parent.nodes.find(node => node.path === path);

        if (!node) {
          node = {
            path,
            flow: 0,
            nodes: [],
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
