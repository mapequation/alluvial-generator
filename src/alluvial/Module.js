// @flow
import type { Node as FTreeNode } from "../io/parse-ftree";
import AlluvialNodeBase from "./AlluvialNodeBase";
import HighlightGroup from "./HighlightGroup";


export default class Module extends AlluvialNodeBase {
    groups: HighlightGroup[] = [];

    getOrCreateGroup(node: FTreeNode, highlightIndex: number): HighlightGroup {
        let group = this.groups.find(group => group.highlightIndex === highlightIndex);
        if (!group) {
            group = new HighlightGroup(this.networkIndex);
            this.groups.push(group);
        }
        return group;
    }
}
