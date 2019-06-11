// @flow
import PriorityQueue from "../lib/priority-queue";
import TreePath from "../lib/treepath";

import AlluvialNodeBase from "./AlluvialNodeBase";
import { MODULE } from "./Depth";
import HighlightGroup from "./HighlightGroup";
import NetworkRoot from "./NetworkRoot";


type CustomName = {
  name: string,
  flow: number,
};

export default class Module extends AlluvialNodeBase {
  parent: ?NetworkRoot;
  children: HighlightGroup[] = [];
  moduleLevel: number = 1;
  path: number[] = [];
  moduleId: string;
  margin: number = 0;
  _name: ?Array<string> = null;
  depth = MODULE;

  static customNames: Map<string, CustomName> = new Map();

  constructor(
    parent: NetworkRoot,
    moduleId: string,
    moduleLevel: number = 1
  ) {
    super(parent, parent.networkId, `${parent.networkId}_module${moduleId}`);
    this.moduleLevel = moduleLevel;
    this.moduleId = moduleId;
    this.path = TreePath.toArray(moduleId);
    this._name = Module.customNames.has(this.id)
      ? [Module.customNames.get(this.id).name]
      : this.subModuleNames();
    parent.addChild(this);
  }

  subModuleNames(): ?Array<string> {
    const names = Array.from(Module.customNames.keys())
      .filter(id => id.startsWith(this.id))
      .map(id => Module.customNames.get(id))
      .sort((a, b) => a.flow - b.flow)
      .map(each => each.name);
    return names.length ? names : null;
  }

  set name(name: ?string) {
    if (!name || name === "") {
      Module.customNames.delete(this.id);
      this._name = this.subModuleNames();
    } else {
      Module.customNames.set(this.id, { name, flow: this.flow });
      this._name = [name];
    }
  }

  get name(): ?Array<string> {
    return this._name;
  }

  getSiblings(): Module[] {
    if (!this.parent) return [];
    const modules = this.parent.children;

    const moduleLevel = this.moduleLevel - 1;
    if (moduleLevel < 1) return modules;

    const parentPath = TreePath.ancestorAtLevel(this.moduleId, moduleLevel);
    return modules.filter(module => parentPath.isAncestor(module.moduleId));
  }

  getGroup(highlightIndex: number): ?HighlightGroup {
    return this.children.find(group => group.highlightIndex === highlightIndex);
  }

  sortChildren() {
    this.sortBy((a: HighlightGroup, b: HighlightGroup) => a.highlightIndex - b.highlightIndex);
  }

  getLargestLeafNodeNames() {
    const queue = new PriorityQueue(6);
    for (let node of this.leafNodes()) {
      queue.push(node);
    }
    return queue.map(node => node.name);
  }

  asObject(): Object {
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
      moduleNamePosition: {
        x: [x1 - textOffset, x2 + textOffset],
        y: y + height / 2
      },
      moduleIdPosition: {
        x: (x1 + x2) / 2,
        y: y + height / 2
      },
      networkName: parent ? parent.name : "",
      networkCodelength: parent && parent.codelength ? parent.codelength : 0
    };
  }
}
