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
  margin: number = this.defaultMargin;

  constructor(
    networkIndex: number,
    parent: NetworkRoot,
    id: string,
    moduleLevel: number = 1
  ) {
    super(networkIndex, parent, id);
    this.moduleLevel = moduleLevel;
    this.path = TreePath.toArray(this.id);
  }

  getGroup(highlightIndex: number): ?HighlightGroup {
    return this.children.find(group => group.highlightIndex === highlightIndex);
  }

  getOrCreateGroup(node: LeafNode, highlightIndex: number): HighlightGroup {
    let group = this.getGroup(highlightIndex);
    if (!group) {
      group = new HighlightGroup(this.networkIndex, this, highlightIndex);
      this.children.push(group);
    }
    return group;
  }

  asObject(): Object {
    return {
      moduleLevel: this.moduleLevel,
      ...super.asObject()
    };
  }

  get depth(): number {
    return MODULE;
  }

  get defaultMargin(): number {
    const margins = [20, 10, 6, 3, 2];
    let index = Math.min(this.moduleLevel - 1, margins.length - 1);
    return margins[index];
  }
}
