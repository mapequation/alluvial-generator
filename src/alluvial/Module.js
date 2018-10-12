// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import { MODULE } from "./depth-constants";
import HighlightGroup from "./HighlightGroup";
import NetworkRoot from "./NetworkRoot";
import LeafNode from "./LeafNode";


export default class Module extends AlluvialNodeBase {
    children: HighlightGroup[] = [];
    moduleLevel: number = 1;
    path: number[] = [];

    constructor(networkIndex: number, parent: NetworkRoot, id: string = "", moduleLevel: number = 1) {
        super(networkIndex, parent, id);
        this.moduleLevel = moduleLevel;
        this.path = id.split(":").map(childId => Number(childId));
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
            ...super.asObject(),
        };
    }

    get depth(): number {
        return MODULE;
    }
}
