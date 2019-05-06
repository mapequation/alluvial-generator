// @flow
import sortBy from "lodash/sortBy";
import PriorityQueue from "../lib/priority-queue";
import TreePath from "../lib/treepath";

import AlluvialNodeBase from "./AlluvialNodeBase";
import { MODULE } from "./Depth";
import HighlightGroup from "./HighlightGroup";
import NetworkRoot from "./NetworkRoot";


export default class Module extends AlluvialNodeBase {
  children: HighlightGroup[] = [];
  moduleLevel: number = 1;
  path: number[] = [];
  moduleId: string;
  margin: number = 0;
  _name: ?string = null;
  depth = MODULE;

  static customNames: Map<string, string> = new Map();

  constructor(
    networkId: string,
    parent: NetworkRoot,
    moduleId: string,
    moduleLevel: number = 1
  ) {
    super(networkId, parent, `${parent.networkId}_module${moduleId}`);
    this.moduleLevel = moduleLevel;
    this.moduleId = moduleId;
    this.path = TreePath.toArray(moduleId);
    this._name = Module.customNames.get(this.id) || null;
  }

  set name(name: string) {
    if (name === "") {
      Module.customNames.delete(this.id);
      this._name = null;
    } else {
      Module.customNames.set(this.id, name);
      this._name = name;
    }
  }

  get name(): ?string {
    return this._name;
  }

  getGroup(highlightIndex: number): ?HighlightGroup {
    return this.children.find(group => group.highlightIndex === highlightIndex);
  }

  getOrCreateGroup(highlightIndex: number): HighlightGroup {
    let group = this.getGroup(highlightIndex);
    if (!group) {
      group = new HighlightGroup(this.networkId, this, highlightIndex);
      this.children.push(group);
    }
    return group;
  }

  sortChildren() {
    this.children = sortBy(this.children, [child => child.highlightIndex]);
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
      networkCodelength: parent ? parent.codelength : 0,
    };
  }
}
