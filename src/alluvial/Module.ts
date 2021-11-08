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

  get isVisible(): boolean {
    return this.filterActive ? this.visibleInFilter : true;
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

  getLargestLeafNodeNames() {
    const queue = new PriorityQueue(6);
    for (let node of this.leafNodes()) {
      queue.push(node);
      this.maxModuleLevel = Math.max(node.level - 1, this.maxModuleLevel);
    }
    return queue.map((node: LeafNode) => node.name);
  }

  asObject() {
    const { name, x: x1, y, height, parent } = this;

    const x2 = x1 + this.width;
    const padding = 5;
    const width = 15;
    const textOffset = width + padding;

    return {
      ...super.asObject(),
      moduleLevel: this.moduleLevel,
      moduleId: this.moduleId,
      name,
      largestLeafNodes: this.getLargestLeafNodeNames(),
      numLeafNodes: this.numLeafNodes,
      maxModuleLevel: this.maxModuleLevel,
      moduleNamePosition: {
        x: [x1 - textOffset, x2 + textOffset],
        y: y + height / 2,
      },
      moduleIdPosition: {
        x: (x1 + x2) / 2,
        y: y + height / 2,
      },
      networkName: parent ? parent.name : "",
      networkCodelength: parent && parent.codelength ? parent.codelength : 0,
      leafNodes: Array.from(this.leafNodes(), (node) => node.toNode()),
    };
  }
}
