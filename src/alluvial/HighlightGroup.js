// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch from "./Branch";


export const NOT_HIGHLIGHTED = -1;
export const INSIGNIFICANT = -2;

export default class HighlightGroup extends AlluvialNodeBase {
    children: Branch[] = [
        Branch.createLeft(this.networkIndex),
        Branch.createRight(this.networkIndex)
    ];

    highlightIndex = NOT_HIGHLIGHTED;

    get insignificant(): boolean {
        return this.highlightIndex === INSIGNIFICANT;
    }

    get depth(): number {
        return 3;
    }

    get left() {
        return this.children[0];
    }

    get right() {
        return this.children[1];
    }
}
