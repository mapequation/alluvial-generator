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
  moduleLevel: number = 1;
  maxModuleLevel: number = 1;
  path: number[] = [];
  moduleId: string;
  margin: number = 0;
  _name: string[] | null = null;
  visibleInFilter: boolean = false;
  filterActive: boolean = false;
  depth = MODULE;
  index: number;

  static customNames: Map<string, CustomName> = new Map();

  constructor(parent: Network, moduleId: string, moduleLevel: number = 1) {
    super(parent, parent.networkId, `${parent.networkId}_module${moduleId}`);
    this.moduleLevel = moduleLevel;
    this.moduleId = moduleId;
    this.path = TreePath.toArray(moduleId);
    const customName = Module.customNames.get(this.id);
    this._name = customName ? [customName.name] : this.subModuleNames();
    this.index = parent.addChild(this) - 1;
  }

  subModuleNames() {
    const names = Array.from(Module.customNames.entries())
      .filter(([id, ..._]) => id.startsWith(this.id))
      .sort((a, b) => a[1].flow - b[1].flow)
      .map(([_, { name }]) => name);
    return names.length ? names : null;
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

  get name() {
    // @ts-ignore
    return this._name;
  }

  getSiblings(): Module[] {
    if (!this.parent) return [];
    const modules = this.parent.children;

    const moduleLevel = this.moduleLevel - 1;
    if (moduleLevel < 1) return modules;

    const parentPath = TreePath.ancestorAtLevel(this.moduleId, moduleLevel);
    return modules.filter((module) => parentPath.isAncestor(module.moduleId));
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
      // FIXME, move this to LeafNode?
      this.maxModuleLevel = Math.max(node.level - 1, this.maxModuleLevel);
    }
    return queue.map((node) => node.name);
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

  get moduleNamePosition() {
    const { x1, x2, y, height } = this;
    const padding = 5;
    const width = 15;
    const textOffset = width + padding;

    return {
      x: [x1 - textOffset, x2 + textOffset],
      y: y + height / 2,
    };
  }

  get moduleIdPosition() {
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
    return Array.from(this.leafNodes(), (node) => node.toNode());
  }
}
