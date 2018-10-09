// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch from "./Branch";


export const NOT_HIGHLIGHTED = -1;
export const INSIGNIFICANT = -2;

export default class HighlightGroup extends AlluvialNodeBase {
    left = Branch.createLeft(this.networkIndex);
    right = Branch.createRight(this.networkIndex);

    highlightIndex = NOT_HIGHLIGHTED;

    get insignificant(): boolean {
        return this.highlightIndex === INSIGNIFICANT;
    }
}
