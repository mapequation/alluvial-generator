// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch from "./Branch";
import { HIGHLIGHT_GROUP } from "./depth-constants";
import Module from "./Module";


export const NOT_HIGHLIGHTED = -1;
export const INSIGNIFICANT = -2;

export default class HighlightGroup extends AlluvialNodeBase {
    children: Branch[] = [
        Branch.createLeft(this.networkIndex, this),
        Branch.createRight(this.networkIndex, this),
    ];

    highlightIndex: number;

    constructor(networkIndex: number, parent: Module, highlightIndex: number = NOT_HIGHLIGHTED) {
        super(networkIndex, parent, highlightIndex.toString());
        this.highlightIndex = highlightIndex;
    }

    get depth(): number {
        return HIGHLIGHT_GROUP;
    }

    get left() {
        return this.children[0];
    }

    get right() {
        return this.children[1];
    }

    get isEmpty(): boolean {
        return this.left.isEmpty && this.right.isEmpty;
    }
}
