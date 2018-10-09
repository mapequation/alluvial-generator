// @flow
import type { Node } from "../io/parse-ftree";
import AlluvialNodeBase from "./AlluvialNodeBase";
import HighlightGroup from "./HighlightGroup";


export default class Module extends AlluvialNodeBase {
    groups: HighlightGroup[] = [];

    getOrCreateGroup(node: Node, highlightIndex: number): HighlightGroup {
        let group = this.groups.find(group => group.highlightIndex === highlightIndex);
        if (!group) {
            group = new HighlightGroup(this.networkIndex);
            this.groups.push(group);
        }
        return group;
    }

    get depth(): number {
        return 2;
    }

    asObject(): Object {
        return {
            depth: this.depth,
            layout: this.layout,
            children: this.groups.map(g => g.asObject()),
        };
    }
}
