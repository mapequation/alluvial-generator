// @flow
import StreamlineNode from "./StreamlineNode";


export default class StreamlineLink {
    left: StreamlineNode;
    right: StreamlineNode;

    constructor(left: StreamlineNode, right: StreamlineNode) {
        this.left = left;
        this.right = right;
    }
}
