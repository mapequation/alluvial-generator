import AlluvialNodeBase, { Layout } from "./AlluvialNode";
import Diagram from "./Diagram";
import { NETWORK } from "./Depth";
import LeafNode from "./LeafNode";
import Module from "./Module";
import type { Side } from "./Side";
import { moveItem } from "../utils/array";
import StreamlineNode from "./StreamlineNode";
import type { Module as InfomapModule } from "@mapequation/infomap";
import TreePath from "../utils/TreePath";

export default class Network extends AlluvialNodeBase<Module, Diagram> {
  readonly depth = NETWORK;
  name: string;
  isCustomSorted = false;
  readonly layerId: number | undefined;
  readonly codelength: number;
  private nodesByIdentifier: Map<string, LeafNode> = new Map();
  private readonly modulesById: Map<string, Module> = new Map();
  private streamlineNodesById: Map<string, StreamlineNode> = new Map();
  moduleLinks?: Map<string, InfomapModule> = undefined;

  constructor(
    parent: Diagram,
    networkId: string,
    name: string,
    codelength: number,
    layerId?: number,
    modules?: InfomapModule[]
  ) {
    super(parent, networkId, networkId);
    parent.addChild(this);
    this.name = name;
    this.codelength = codelength;
    this.layerId = layerId;

    if (modules) {
      for (const module of modules) {
        if (module.links) {
          if (this.moduleLinks == null) {
            this.moduleLinks = new Map();
          }
          this.moduleLinks.set(module.path.join(":"), module);
        }
      }
    }
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

  get hierarchicalChildren() {
    const root = new TreeNode();

    const nodesByPath: Map<string, TreeNode> = new Map().set(root.path, root);

    for (const module of this.children) {
      if (!module.isVisible) {
        continue;
      }

      let parent = root;
      const path = new TreePath(module.path);

      for (
        let moduleLevel = 0;
        moduleLevel <= module.moduleLevel;
        ++moduleLevel
      ) {
        const parentPath = path.ancestorAtLevelAsString(moduleLevel);

        if (!nodesByPath.has(parentPath)) {
          const isLeaf = moduleLevel === module.moduleLevel;
          parent = new TreeNode(parentPath, moduleLevel, isLeaf, parent);
          nodesByPath.set(parentPath, parent);
        } else {
          parent = nodesByPath.get(parentPath)!;
        }
      }

      parent?.addChild(module);
    }

    return root;
  }

  get flowThreshold() {
    return this.parent?.flowThreshold ?? 0;
  }

  static create(
    parent: Diagram,
    networkId: string,
    name: string,
    codelength: number,
    layerId?: number,
    modules?: InfomapModule[]
  ) {
    return new Network(parent, networkId, name, codelength, layerId, modules);
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

class TreeNode extends Layout {
  children: (TreeNode | Module)[] = [];
  maxModuleLevel: number = 1;
  y = Infinity;
  private maxY = -Infinity;
  private maxHeight = -Infinity;

  constructor(
    public path: string = "root",
    public moduleLevel: number = 1,
    public isLeaf: boolean = false,
    private parent?: TreeNode
  ) {
    super();

    if (parent) {
      parent.children.push(this);
      this.updateMaxModuleLevel(moduleLevel);
    }
  }

  private updateMaxModuleLevel(moduleLevel: number) {
    if (moduleLevel > this.maxModuleLevel) {
      this.maxModuleLevel = moduleLevel;
    }
    this.parent?.updateMaxModuleLevel(moduleLevel);
  }

  *visit(): Iterable<TreeNode | Module> {
    for (const node of this.children) {
      if (node instanceof TreeNode) {
        if (!node.isLeaf) yield node;
        yield* node.visit();
      } else {
        yield node;
      }
    }
  }

  addChild(module: Module) {
    if (!this.isLeaf || !this.parent) {
      throw new Error("Module added to non-leaf TreeNode");
    }

    this.parent.updateLayout(module);
    this.children.push(module);
  }

  private updateLayout(module: Module) {
    this.x = module.x;
    this.width = module.width;
    this.y = Math.min(this.y, module.y);

    if (module.y > this.maxY) {
      this.maxY = module.y;
      this.maxHeight = module.height;
      this.height = Math.max(
        this.height,
        Math.abs(this.y - module.y) + module.height
      );
    } else {
      this.height = Math.max(
        this.height,
        Math.abs(this.y - this.maxY) + this.maxHeight
      );
    }

    this.parent?.updateLayout(module);
  }
}
