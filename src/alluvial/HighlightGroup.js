// @flow
import AlluvialNodeBase from "./AlluvialNodeBase";
import Branch, { LEFT, RIGHT } from "./Branch";


export const NOT_HIGHLIGHTED = -1;
export const INSIGNIFICANT = -2;

export default class HighlightGroup extends AlluvialNodeBase {
    left = new Branch(LEFT, this.networkIndex);
    right = new Branch(RIGHT, this.networkIndex);

    highlightIndex = NOT_HIGHLIGHTED;

    get insignificant(): boolean {
        return this.highlightIndex === INSIGNIFICANT;
    }
}
