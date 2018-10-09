// @flow
import type { Node } from "../io/parse-ftree";
import AlluvialNodeBase from "./AlluvialNodeBase";
import HighlightGroup from "./HighlightGroup";


export default class Module extends AlluvialNodeBase {
    children: HighlightGroup[] = [];

    getOrCreateGroup(node: Node, highlightIndex: number): HighlightGroup {
        let group = this.children.find(group => group.highlightIndex === highlightIndex);
        if (!group) {
            group = new HighlightGroup(this.networkIndex);
            this.children.push(group);
        }
        return group;
    }

    get depth(): number {
        return 2;
    }
}
