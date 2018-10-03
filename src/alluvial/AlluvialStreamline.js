// @flow
import AlluvialStreamlineNode from "./AlluvialStreamlineNode";


export default class AlluvialStreamline {
    left: AlluvialStreamlineNode;
    right: AlluvialStreamlineNode;

    constructor(left: AlluvialStreamlineNode, right: AlluvialStreamlineNode) {
        this.left = left;
        this.right = right;
    }
}
