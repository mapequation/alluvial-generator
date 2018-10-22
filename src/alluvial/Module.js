// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { MODULE } from "./depth-constants";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";
import NetworkRoot from "./NetworkRoot";
import TreePath from "../lib/treepath";

export default class Module extends AlluvialNodeBase {
  children: HighlightGroup[] = [];
  moduleLevel: number = 1;
  path: number[] = [];
  moduleId: string;
  margin: number = 0;

  constructor(
    networkId: string,
    parent: NetworkRoot,
    moduleId: string,
    moduleLevel: number = 1
  ) {
    super(networkId, parent, `${parent.id}_module${moduleId}`);
    this.moduleLevel = moduleLevel;
    this.moduleId = moduleId;
    this.path = TreePath.toArray(moduleId);
  }

  getGroup(highlightIndex: number): ?HighlightGroup {
    return this.children.find(group => group.highlightIndex === highlightIndex);
  }

  getOrCreateGroup(node: LeafNode, highlightIndex: number): HighlightGroup {
    let group = this.getGroup(highlightIndex);
    if (!group) {
      group = new HighlightGroup(this.networkId, this, highlightIndex);
      this.children.push(group);
    }
    return group;
  }

  asObject(): Object {
    return {
      moduleLevel: this.moduleLevel,
      moduleId: this.moduleId,
      ...super.asObject()
    };
  }

  get depth(): number {
    return MODULE;
  }
}
