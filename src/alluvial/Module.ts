import PriorityQueue from "../utils/PriorityQueue";
import TreePath from "../utils/TreePath";
import AlluvialNodeBase from "./AlluvialNode";
import { MODULE } from "./Depth";
import type HighlightGroup from "./HighlightGroup";
import type LeafNode from "./LeafNode";
import type Network from "./Network";

type CustomName = {
  name: string;
  flow: number;
};

export default class Module extends AlluvialNodeBase<HighlightGroup, Network> {
  static customNames: Map<string, CustomName> = new Map(); // FIXME should this really be static?
  readonly depth = MODULE;
  readonly path: number[] = [];
  readonly moduleId: string;
  margin: number = 0;
  index: number;
  private readonly moduleLevel: number = 1;

  constructor(parent: Network, moduleId: string, moduleLevel: number = 1) {
    super(parent, parent.networkId, `${parent.networkId}_module${moduleId}`);
    this.moduleLevel = moduleLevel;
    this.moduleId = moduleId;
    this.path = TreePath.toArray(moduleId);
    const customName = Module.customNames.get(this.id);
    this._name = customName ? [customName.name] : this.subModuleNames();
    this.index = parent.addChild(this) - 1;
  }

  private _name: string[] | null = null;

  get name() {
    // @ts-ignore
    return this._name;
  }

  set name(name: string | null) {
    if (!name || name === "") {
      Module.customNames.delete(this.id);
      this._name = this.subModuleNames();
    } else {
      Module.customNames.set(this.id, { name, flow: this.flow });
      this._name = [name];
    }
  }

  get largestLeafNodes() {
    // TODO inline
    return this.getLargestLeafNodeNames();
  }

  get x1() {
    return this.x;
  }

  get x2() {
    return this.x + this.width;
  }

  get namePosition() {
    const { x1, x2, y, height } = this;
    const padding = 5;
    const width = 15;
    const textOffset = width + padding;

    const x = this.parent.isFirstChild
      ? x1 - textOffset
      : this.parent.isLastChild
      ? x2 + textOffset
      : (x1 + x2) / 2;

    return {
      x,
      y: y + height / 2,
    };
  }

  get textAnchor() {
    return this.parent.isFirstChild
      ? "end"
      : this.parent.isLastChild
      ? "start"
      : null;
  }

  get idPosition() {
    const { x1, x2, y, height } = this;
    return {
      x: (x1 + x2) / 2,
      y: y + height / 2,
    };
  }

  get networkName() {
    return this.parent?.name ?? "";
  }

  get networkCodelength() {
    return this.parent?.codelength ?? 0;
  }

  get getLeafNodes() {
    // TODO remove
    return Array.from(this.leafNodes(), (node) => node.toNode());
  }

  get isVisible() {
    return this.flow >= this.flowThreshold && this.flow > 0;
  }

  private get flowThreshold() {
    return this.parent?.flowThreshold ?? 0;
  }

  getGroup(highlightIndex: number, insignificant: boolean) {
    return this.children.find(
      (group) =>
        group.highlightIndex === highlightIndex &&
        group.insignificant === insignificant
    );
  }

  expand() {
    const leafNodes: LeafNode[] = Array.from(this.leafNodes());
    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return;
    }

    const newModuleLevel = this.moduleLevel + 1;

    const alreadyExpanded = leafNodes.some(
      (node) => node.level <= newModuleLevel
    );
    if (alreadyExpanded) {
      console.warn(
        `Module can't be expanded to level ${newModuleLevel} ` +
          `because some nodes are at level ${newModuleLevel - 1}`
      );
      return;
    }

    leafNodes.forEach((node) => {
      node.moduleLevel = newModuleLevel;
      node.update();
    });
  }

  regroup() {
    if (this.moduleLevel <= 1) {
      console.warn(
        `Module with id ${this.moduleId} is already at module level ${this.moduleLevel}`
      );
    }

    const modules = this.getSiblings();

    const leafNodes: LeafNode[] = [].concat.apply(
      [],
      // @ts-ignore FIXME
      modules.map((module) => [...module.leafNodes()])
    );

    if (!leafNodes.length) {
      console.warn(`No leaf nodes found`);
      return false;
    }

    const newModuleLevel = this.moduleLevel - 1;

    leafNodes.forEach((node) => {
      node.moduleLevel = newModuleLevel;
      node.update();
    });
  }

  getLargestLeafNodeNames(numNodes: number = 6) {
    const queue = new PriorityQueue<LeafNode>(numNodes);
    for (let node of this.leafNodes()) {
      queue.push(node);
    }
    return queue.map((node) => node.name);
  }

  *rightStreamlines() {
    for (let group of this) {
      for (let streamlineNode of group.right) {
        const oppositeStreamlineNode = streamlineNode.getOpposite();

        if (!oppositeStreamlineNode) continue;

        const oppositeModule = oppositeStreamlineNode.getAncestor(
          MODULE
        ) as Module | null;

        if (oppositeModule) {
          // Skip if right module is below threshold
          if (!oppositeModule.isVisible) continue;
        }

        if (streamlineNode.link) yield streamlineNode.link;
      }
    }
  }

  private subModuleNames() {
    const names = Array.from(Module.customNames.entries())
      .filter(([id, ..._]) => id.startsWith(this.id))
      .sort((a, b) => a[1].flow - b[1].flow)
      .map(([_, { name }]) => name);
    return names.length ? names : null;
  }

  private getSiblings(): Module[] {
    if (!this.parent) return [];
    const modules = this.parent.children;

    const moduleLevel = this.moduleLevel - 1;
    if (moduleLevel < 1) return modules;

    const parentPath = TreePath.ancestorAtLevel(this.moduleId, moduleLevel);
    return modules.filter((module) => parentPath.isAncestor(module.moduleId));
  }
}
