// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import HighlightGroup from "./HighlightGroup";
import LeafNode from "./LeafNode";


export default class Module extends AlluvialNodeBase {
    children: HighlightGroup[] = [];

    getGroup(node: LeafNode, highlightIndex: number): ?HighlightGroup {
        return this.children.find(group => group.highlightIndex === highlightIndex);
    }

    getOrCreateGroup(node: LeafNode, highlightIndex: number): HighlightGroup {
        let group = this.getGroup(node, highlightIndex);
        if (!group) {
            group = new HighlightGroup(this.networkIndex, this, highlightIndex);
            this.children.push(group);
        }
        return group;
    }

    get depth(): number {
        return 2;
    }
}
